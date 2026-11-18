"use strict";
import {q,ROUTES} from './core/navigation.js';
import {navigate,heroSummary,screen,setFilter,setReadModel} from './views/screens.js';
import {tmPost} from './core/api.js';
import {TM_STAGE,hasStagingEndpoint} from './core/config.js';
let sessionToken='',currentUser=null;

let opMode='',opRequestKey='',opBusy=false;
function openOperation(mode,invoiceId=''){
 const isCustomer=mode==='customer',isInvoice=mode==='invoice',isPayment=mode==='payment-full'||mode==='payment-part';
 const allowed=currentUser?.role==='OWNER'&&hasStagingEndpoint()&&!TM_STAGE.readOnly&&TM_STAGE.mutationsEnabled&&(!isPayment||TM_STAGE.financeEnabled);
 if(!allowed)return;
 if(!isCustomer&&!isInvoice&&!isPayment)return;
 opMode=mode;opRequestKey=crypto.randomUUID();opBusy=false;
 const dialog=q('operationDialog'),form=q('operationForm');
 form.reset();
 for(const section of dialog.querySelectorAll('[data-op-panel]')){
  const show=section.dataset.opPanel===(isCustomer?'customer':isInvoice?'invoice':'payment');
  section.hidden=!show;
  for(const field of section.querySelectorAll('input,select'))field.disabled=!show;
 }
 q('operationTitle').textContent=isCustomer?'Tambah pelanggan':isInvoice?'Buat tagihan':mode==='payment-part'?'Catat cicilan':'Tandai lunas';
 q('operationDescription').textContent='Hanya untuk lingkungan STAGING yang telah diverifikasi.';
 q('operationStatus').textContent='';
 q('operationSubmit').disabled=false;
 q('operationSubmit').textContent='Simpan di STAGING';
 if(isInvoice){
  const select=q('opCustomer');select.replaceChildren();
  for(const r of readModelSnapshot().customers?.items||[])select.add(new Option(r.nama||r.id,r.id));
  q('opPeriod').value=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit'}).format(new Date()).replace(/-/g,'').slice(0,6);
 }
 if(isPayment){
  const select=q('opInvoice');select.replaceChildren();
  for(const r of readModelSnapshot().invoices?.items||[]){
   if(String(r.status||'').toUpperCase()==='LUNAS')continue;
   select.add(new Option((r.id||'Tagihan')+' · '+(r.nominal||'—'),r.id));
  }
  if(invoiceId)select.value=invoiceId;
  q('opAmountGroup').hidden=mode!=='payment-part';q('opAmount').disabled=mode!=='payment-part';
 }
 dialog.showModal();
}
let snapshot={};
const readModelSnapshot=()=>snapshot;

const normalizePhone=input=>{let digits=String(input||'').replace(/\D/g,'');if(digits.startsWith('62'))return digits;digits=digits.replace(/^0+/,'');return '62'+digits;};
function render(){
 const id=location.hash.replace(/^#/,'').toLowerCase();
 const route=ROUTES.find(r=>r.id===id)||ROUTES[0];
 q('pageTitle').textContent=route.title;
 q('pageDesc').textContent=route.desc;
 q('pageEyebrow').textContent=route.eyebrow;
 q('summary').innerHTML=heroSummary(route.id);
 q('panel').innerHTML=screen(route.id);
 document.title=route.label+' · TMfiber';
 document.querySelectorAll('[data-route]').forEach(a=>{
  const active=a.dataset.route===route.id;
  a.classList.toggle('active',active);
  if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 q('openLogin').textContent=currentUser?'Akun: '+currentUser.role:'Masuk';
}
async function loadReadData(){
 // Only request after a valid owner session; no live customer data cached or stored.
 try{
  const [dashboard,customers,invoices]=await Promise.all([
   tmPost('get_dashboard_data',{},sessionToken),
   tmPost('get_customers',{limit:50},sessionToken),
   tmPost('get_invoices',{limit:50},sessionToken)
  ]);
  snapshot={dashboard,customers,invoices};setReadModel(snapshot);render();
 }catch(e){snapshot={};setReadModel(null);render();q('authMessage').textContent='Gagal membaca STAGING: '+e.message;}
}
function init(){
 navigate();
 q('today').textContent=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',year:'numeric'}).format(new Date());
 const dialog=q('loginDialog'),phone=q('phone'),otp=q('otp'),send=q('otpSend'),verify=q('otpVerify'),message=q('authMessage');
 const enabled=hasStagingEndpoint();
 phone.disabled=!enabled;send.disabled=!enabled;
 q('loginDescription').textContent=enabled?'Gunakan nomor petugas STAGING yang terdaftar.':'Koneksi STAGING belum disiapkan. Login tetap terkunci.';
 message.textContent=enabled?'Hanya gunakan akun pengujian STAGING.':'Login belum aktif. Tidak ada nomor atau kode yang diproses.';
 const open=()=>{
  q('phoneStep').hidden=!!currentUser;
  q('otpStep').hidden=true;
  otp.disabled=true;verify.disabled=true;
  q('logoutButton').hidden=!currentUser;
  message.textContent=currentUser?'Anda masuk sebagai '+currentUser.role+'.':enabled?'Masukkan nomor petugas STAGING.':'Login belum aktif. Backend belum dideploy.';
  dialog.showModal();
 };
 q('openLogin').addEventListener('click',open);
 q('accountButton').addEventListener('click',open);
 q('closeLogin').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 send.addEventListener('click',async()=>{
  send.disabled=true;message.textContent='Meminta kode OTP...';
  try{
   await tmPost('request_otp',{no_wa:normalizePhone(phone.value)});
   q('otpStep').hidden=false;q('phoneStep').hidden=true;otp.disabled=false;verify.disabled=false;message.textContent='Jika akun terdaftar, kode dikirim ke WhatsApp.';otp.focus();
  }catch(e){message.textContent=e.message;}
  finally{send.disabled=!enabled;}
 });
 q('otpBack').addEventListener('click',()=>{q('otpStep').hidden=true;q('phoneStep').hidden=false;otp.disabled=true;verify.disabled=true;});
 verify.addEventListener('click',async()=>{
  verify.disabled=true;message.textContent='Memverifikasi kode...';
  try{
   const data=await tmPost('verify_otp',{no_wa:normalizePhone(phone.value),otp:otp.value});
   if(!data.session_token||data.user?.role!=='OWNER')throw new Error('Akun pengujian belum memiliki izin Owner.');
   sessionToken=data.session_token;currentUser={role:data.user.role,nama:data.user.nama};
   dialog.close();render();await loadReadData();
  }catch(e){message.textContent=e.message;}
  finally{verify.disabled=false;}
 });
 q('logoutButton').addEventListener('click',async()=>{
  const oldToken=sessionToken;sessionToken='';currentUser=null;snapshot={};setReadModel(null);
  dialog.close();render();
  if(oldToken)try{await tmPost('logout',{},oldToken);}catch(e){console.warn('Revokasi sesi server belum terkonfirmasi.');}
 });
 q('panel').addEventListener('click',e=>{const chip=e.target.closest('[data-filter]');if(chip){setFilter(chip.dataset.filter);render();}});
 q('panel').addEventListener('click',e=>{
  const cmd=e.target.closest('[data-command]');
  if(cmd)openOperation(cmd.dataset.command,cmd.dataset.invoiceId||'');
 });
 q('operationClose').addEventListener('click',()=>q('operationDialog').close());
 q('operationForm').addEventListener('submit',async e=>{
  e.preventDefault();if(opBusy||!opMode||!opRequestKey)return;
  const operation=opMode,key=opRequestKey;
  const isCustomer=operation==='customer',isInvoice=operation==='invoice',isInstallment=operation==='payment-part';
  const payload=isCustomer?{nama:q('opName').value,no_wa:normalizePhone(q('opPhone').value),alamat:q('opAddress').value,paket:q('opPackage').value,tarif:Number(q('opPrice').value),jatuh_tempo:Number(q('opDue').value)}
    :isInvoice?{id_pelanggan:q('opCustomer').value,periode:q('opPeriod').value}
    :{id_tagihan:q('opInvoice').value,metode_bayar:q('opMethod').value,...(isInstallment?{nominal:Number(q('opAmount').value)}:{})};
  if(!isCustomer&&!isInvoice){
   if(!window.confirm('Pastikan uang benar-benar diterima sebelum mencatat pembayaran. Lanjutkan?'))return;
  }
  payload.idempotency_key=key;
  opBusy=true;q('operationSubmit').disabled=true;q('operationStatus').textContent='Menyimpan perubahan...';
  try{
   const action=isCustomer?'save_customer':isInvoice?'create_invoice':isInstallment?'record_installment':'mark_as_paid';
   await tmPost(action,payload,sessionToken);
   q('operationDialog').close();opRequestKey='';
   await loadReadData();
  }catch(err){
   q('operationStatus').textContent=err.message+' Jika mengulang, permintaan menggunakan kunci transaksi yang sama.';
  }finally{opBusy=false;q('operationSubmit').disabled=false;}
 });

 q('panel').addEventListener('input',e=>{
  if(!e.target.matches('[data-list-search]'))return;
  const needle=e.target.value.trim().toLocaleLowerCase('id-ID');
  q('panel').querySelectorAll('.read-row').forEach(row=>{row.hidden=!row.textContent.toLocaleLowerCase('id-ID').includes(needle);});
 });
 function connection(){q('offlineNotice').hidden=navigator.onLine;}
 window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
 window.addEventListener('hashchange',()=>{setFilter('belum');render();window.scrollTo(0,0);});
 render();
 if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
}
document.addEventListener('DOMContentLoaded',init);
