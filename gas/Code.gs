/**
 * TMfiber — isolated STAGING-only GAS pilot API. Never deploy on production.
 * Do not put secrets here: set them inside Apps Script Script Properties.
 */
var TM_VERSION='0.2.0', TM_OTP_TTL=300, TM_TTL=43200, TM_TZ='Asia/Jakarta';
function tmOutput_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function tmErr_(code,msg){var e=new Error(msg);e.tmCode=code;return e;}
function tmConfig_(){return PropertiesService.getScriptProperties();}
function tmGate_(){
  var p=tmConfig_();
  if(p.getProperty('TM_ENVIRONMENT')!=='STAGING'||p.getProperty('TM_READS_ENABLED')!=='true'||p.getProperty('TM_DRY_RUN')!=='true')throw tmErr_(503,'Lingkungan STAGING belum siap.');
  ['TM_SPREADSHEET_ID','TM_SESSION_SECRET','TM_OTP_SECRET'].forEach(function(k){if(!p.getProperty(k))throw tmErr_(503,'Konfigurasi belum lengkap.');});
}
function doGet(){return tmOutput_({status:'SUCCESS',code:200,message:'TMfiber API; use POST.',data:{version:TM_VERSION}});}
function doPost(e){
 try{
  if(!e||!e.postData||typeof e.postData.contents!=='string'||e.postData.contents.length>8192)throw tmErr_(400,'Permintaan tidak valid.');
  var req=JSON.parse(e.postData.contents),body=req.payload||{};
  if(typeof req.action!=='string'||!body||typeof body!=='object'||Array.isArray(body))throw tmErr_(400,'Permintaan tidak valid.');
  tmGate_();var result;
  if(req.action==='request_otp')result=tmRequestOtp_(body);
  else if(req.action==='verify_otp')result=tmVerifyOtp_(body);
  else if(req.action==='logout')result=tmLogout_(req.session_token);
  else{
   var user=tmAuth_(req.session_token);
   if(req.action==='get_dashboard_data')result=tmDashboard_(user);
   else if(req.action==='get_customers')result=tmCustomers_(user,body);
   else if(req.action==='get_invoices')result=tmInvoices_(user,body);
   else if(req.action==='get_cashbook')result=tmCash_(user,body);
   else if(req.action==='mark_as_paid')result=tmRecordPayment_(user,body,false);
   else if(req.action==='record_installment')result=tmRecordPayment_(user,body,true);
   else throw tmErr_(404,'Fungsi belum tersedia.');
  }
  return tmOutput_({status:'SUCCESS',code:200,message:'Berhasil.',data:result});
 }catch(ex){
  var code=ex.tmCode||500;
  return tmOutput_({status:'ERROR',code:code,message:code===500?'Layanan tidak dapat memproses permintaan.':ex.message,data:{}});
 }
}
function tmSha_(s){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s).map(function(b){return('0'+(b&255).toString(16)).slice(-2);}).join('');}
function tmSign_(secret,value){return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(value,secret)).replace(/=+$/,'');}
function tmEqual_(a,b){if(typeof a!=='string'||typeof b!=='string')return false;var n=Math.max(a.length,b.length),d=a.length^b.length;for(var i=0;i<n;i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;}
function tmPhone_(v){if(typeof v!=='string'&&typeof v!=='number')throw tmErr_(400,'Nomor WA tidak valid.');var p=String(v).replace(/[\s()+.-]/g,'');if(p[0]==='0')p='62'+p.slice(1);if(!/^62[0-9]{8,13}$/.test(p))throw tmErr_(400,'Nomor WA tidak valid.');return p;}
function tmRows_(tab){
 var sh=SpreadsheetApp.openById(tmConfig_().getProperty('TM_SPREADSHEET_ID')).getSheetByName(tab);
 if(!sh)throw tmErr_(503,'Skema database STAGING belum sesuai.');
 var all=sh.getDataRange().getValues();if(all.length<1)return[];
 var keys=all.shift().map(function(x){return String(x).trim();});
 return all.filter(function(row){return row.some(function(x){return x!==''&&x!==null;});}).map(function(row){var o={};keys.forEach(function(k,i){if(k)o[k]=tmCell_(row[i]);});return o;});
}
function tmCell_(v){if(Object.prototype.toString.call(v)==='[object Date]')return Utilities.formatDate(v,TM_TZ,'yyyy-MM-dd');return v==null?'':v;}
function tmUser_(phone){
 var r=tmRows_('Users_Admin').filter(function(x){try{return tmPhone_(x.No_WA)===phone;}catch(e){return false;}})[0];
 if(!r||['TRUE','AKTIF','YA','YES','1'].indexOf(String(r.Aktif).trim().toUpperCase())<0)return null;
 var role=String(r.Role||'').trim().toUpperCase();
 if(['OWNER','KOLEKTOR','TEKNISI'].indexOf(role)<0)return null;
 return {phone:phone,nama:String(r.Nama||''),role:role};
}
function tmKey_(prefix,phone){return prefix+tmSha_(phone).slice(0,40);}
function tmRandomOtp_(){
 // Derive 6 digits from GAS UUID (not Math.random); verify provider/security requirements before production.
 var n=parseInt(Utilities.getUuid().replace(/-/g,'').slice(0,8),16);
 return String(100000+(n%900000));
}
function tmRequestOtp_(p){
 var phone=tmPhone_(p.no_wa),token=tmConfig_().getProperty('TM_FONNTE_TOKEN');
 if(!token)throw tmErr_(503,'Gateway WhatsApp belum siap.');
 var cache=CacheService.getScriptCache(),lock=LockService.getScriptLock();
 if(!lock.tryLock(10000))throw tmErr_(429,'Coba sesaat lagi.');
 try{if(cache.get(tmKey_('cool_',phone)))return{cooldown_seconds:60};cache.put(tmKey_('cool_',phone),'1',60);}finally{lock.releaseLock();}
 var user=tmUser_(phone);if(!user)return{cooldown_seconds:60};
 var otp=tmRandomOtp_(),nonce=Utilities.getUuid();
 cache.put(tmKey_('otp_',phone),JSON.stringify({nonce:nonce,mac:tmSign_(tmConfig_().getProperty('TM_OTP_SECRET'),phone+':'+otp+':'+nonce)}),TM_OTP_TTL);
 cache.remove(tmKey_('tries_',phone));
 try{
  var res=UrlFetchApp.fetch('https://api.fonnte.com/send',{method:'post',headers:{Authorization:token},payload:{target:phone,message:'Kode masuk TMfiber: '+otp+'. Berlaku 5 menit. Rahasiakan kode ini.'},muteHttpExceptions:true});
  var sent=res.getResponseCode()>=200&&res.getResponseCode()<300&&JSON.parse(res.getContentText()).status===true;
  if(!sent)throw new Error('send failed');
 }catch(e){cache.remove(tmKey_('otp_',phone));throw tmErr_(503,'OTP belum dapat dikirim.');}
 return{cooldown_seconds:60};
}
function tmVerifyOtp_(p){
 var phone=tmPhone_(p.no_wa),otp=String(p.otp||'');
 if(!/^[0-9]{6}$/.test(otp))throw tmErr_(400,'Kode OTP tidak valid.');
 var cache=CacheService.getScriptCache(),lock=LockService.getScriptLock();
 if(!lock.tryLock(10000))throw tmErr_(429,'Coba sesaat lagi.');
 try{
  var count=Number(cache.get(tmKey_('tries_',phone))||0);
  if(count>=5)throw tmErr_(429,'Terlalu banyak percobaan.');
  var found=cache.get(tmKey_('otp_',phone)),user=tmUser_(phone);
  if(!found||!user)throw tmErr_(401,'OTP salah atau kedaluwarsa.');
  var record=JSON.parse(found),mac=tmSign_(tmConfig_().getProperty('TM_OTP_SECRET'),phone+':'+otp+':'+record.nonce);
  if(!tmEqual_(mac,record.mac)){cache.put(tmKey_('tries_',phone),String(count+1),300);throw tmErr_(401,'OTP salah atau kedaluwarsa.');}
  cache.remove(tmKey_('otp_',phone));cache.remove(tmKey_('tries_',phone));
  var exp=Date.now()+TM_TTL*1000,claims=JSON.stringify({sub:phone,jti:Utilities.getUuid(),exp:exp,v:1});
  var prefix=Utilities.base64EncodeWebSafe(claims).replace(/=+$/,'');
  return{session_token:prefix+'.'+tmSign_(tmConfig_().getProperty('TM_SESSION_SECRET'),prefix),user:{nama:user.nama,role:user.role}};
 }finally{lock.releaseLock();}
}
function tmAuth_(token){
 if(typeof token!=='string'||token.length>2500)throw tmErr_(401,'Sesi tidak valid.');
 var parts=token.split('.');
 if(parts.length!==2||!tmEqual_(tmSign_(tmConfig_().getProperty('TM_SESSION_SECRET'),parts[0]),parts[1]))throw tmErr_(401,'Sesi tidak valid.');
 var claims;
 try{claims=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());}catch(e){throw tmErr_(401,'Sesi tidak valid.');}
 if(claims.v!==1||typeof claims.exp!=='number'||!claims.jti||claims.exp<=Date.now()||claims.exp>Date.now()+TM_TTL*1000+60000)throw tmErr_(401,'Sesi kedaluwarsa.');
 if(tmConfig_().getProperty('revoked_'+tmSha_(claims.jti)))throw tmErr_(401,'Sesi sudah keluar.');
 var user=tmUser_(tmPhone_(claims.sub));if(!user)throw tmErr_(403,'Akun tidak aktif.');
 user.jti=claims.jti;user.exp=claims.exp;return user;
}
function tmLogout_(token){var user=tmAuth_(token);tmConfig_().setProperty('revoked_'+tmSha_(user.jti),String(user.exp));return{logged_out:true};}
function tmOwner_(u){if(u.role!=='OWNER')throw tmErr_(403,'Akses hanya untuk pemilik.');}
function tmPage_(rows,p){var n=Math.max(1,Math.min(100,Math.floor(Number(p.limit)||50))),offset=Math.max(0,Math.min(100000,Math.floor(Number(p.offset)||0)));return{items:rows.slice(offset,offset+n),total:rows.length,limit:n,offset:offset};}
function tmDashboard_(u){
 tmOwner_(u);
 var customers=tmRows_('Pelanggan'),invoices=tmRows_('Tagihan'),month=Utilities.formatDate(new Date(),TM_TZ,'yyyyMM');
 var target=0,paid=0,unpaid=0,settled=0,overdue=0;
 var today=Utilities.formatDate(new Date(),TM_TZ,'yyyy-MM-dd');
 invoices.forEach(function(r){
  if(String(r.Periode||'').replace(/[^0-9]/g,'').slice(0,6)!==month)return;
  var amount=Number(r.Total_Tagihan||r.Nominal||0);if(!Number.isFinite(amount)||amount<0)return;
  target+=amount;
  var st=String(r.Status_Bayar||'').trim().toUpperCase();
  var hasPartial=r.jumlah_terbayar!==undefined && r.jumlah_terbayar!=='' && r.jumlah_terbayar!==null;
  var credited=hasPartial?Number(r.jumlah_terbayar):st==='LUNAS'?amount:0;
  if(!Number.isFinite(credited)||credited<0||credited>amount)throw tmErr_(409,'Cicilan STAGING tidak konsisten.');
  paid+=credited;
  if(st==='LUNAS')settled++;else{
   unpaid++;
   var due=String(r.Tgl_Jatuh_Tempo||'').slice(0,10);
   if(/^\d{4}-\d{2}-\d{2}$/.test(due)&&due<today)overdue++;
  }
 });
 return{summary:{terkumpul:paid,total_target:target,persen:target?Math.round(paid/target*100):0},metrics:{pelanggan:customers.length,belum_bayar:unpaid,lunas:settled,jatuh_tempo:overdue},period:month};
}
function tmCustomers_(u,p){tmOwner_(u);return tmPage_(tmRows_('Pelanggan').map(function(r){return{id:r.ID_Pelanggan,nama:r.Nama,no_wa:r.No_WA,paket:r.Paket,tarif:r.Tarif,jatuh_tempo:r.Jatuh_Tempo,status:r.Status};}),p);}
function tmInvoices_(u,p){tmOwner_(u);return tmPage_(tmRows_('Tagihan').map(function(r){return{id:r.ID_Tagihan,pelanggan:r.ID_Pelanggan,periode:r.Periode,nominal:r.Total_Tagihan,jatuh_tempo:r.Tgl_Jatuh_Tempo,status:r.Status_Bayar,metode:r.Metode_Bayar};}),p);}
function tmCash_(u,p){tmOwner_(u);return tmPage_(tmRows_('Kas_Operasional').map(function(r){return{id:r.ID_Transaksi,tanggal:r.Tanggal,jenis:r.Jenis_Transaksi,nominal:r.Nominal,keterangan:r.Keterangan};}),p);}
