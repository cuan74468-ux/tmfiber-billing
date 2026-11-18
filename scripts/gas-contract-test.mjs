import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const gas=readFileSync('gas/Code.gs','utf8');
const props=new Map([
 ['TM_ENVIRONMENT','STAGING'],
 ['TM_READS_ENABLED','true'],
 ['TM_DRY_RUN','true'],
 ['TM_SPREADSHEET_ID','FAKE_STAGING_ID_ONLY'],
 ['TM_SESSION_SECRET','synthetic-session-signing-secret-not-for-real-use'],
 ['TM_OTP_SECRET','synthetic-otp-signing-secret-not-for-real-use'],
 ['TM_FONNTE_TOKEN','mock-provider-token-not-real']
]);
const cache=new Map();
const fakePhone='6200000000000'; // synthetic unrouteable fixture; no real network calls.
const sheets={
 Pelanggan:[['ID_Pelanggan','ODP','Nama','Label','No_WA','Alamat','Paket','Tarif','Kode_Unik','Jatuh_Tempo','User_PPPoE','Status'],
 ['SIM-C001','','TEST ONLY','','','','20 Mbps',150000,'','10','','AKTIF']],
 Tagihan:[['ID_Tagihan','Periode','ID_Pelanggan','Label','Nominal','Total_Tagihan','Tgl_Jatuh_Tempo','Status_Bayar','Metode_Bayar','Diterima_Oleh','Waktu_Bayar','Status_Setoran']],
 Kas_Operasional:[['ID_Transaksi','Tanggal','Jenis_Transaksi','Kategori','Keterangan','Nominal','Dicatat_Oleh']],
 Users_Admin:[['No_WA','Nama','Role','Aktif','Terakhir_Login'],[fakePhone,'SIM OWNER','OWNER','TRUE','']],
 Audit_Log:[['Timestamp','User','Role','Aksi','Target','Detail']],
 Settings:[['Parameter','Nilai','Keterangan']]
};
let message='';
let tokenCounter=0;
const utilities={
 DigestAlgorithm:{SHA_256:'sha256'},
 computeDigest:(_alg,value)=>[...crypto.createHash('sha256').update(String(value)).digest()].map(b=>b>127?b-256:b),
 computeHmacSha256Signature:(value,key)=>[...crypto.createHmac('sha256',key).update(value).digest()].map(b=>b>127?b-256:b),
 base64EncodeWebSafe:value=>Buffer.from(typeof value==='string'?value:Uint8Array.from(value.map(x=>x&255))).toString('base64url'),
 base64DecodeWebSafe:value=>[...Buffer.from(value,'base64url')],
 newBlob:value=>({getDataAsString:()=>Buffer.from(Uint8Array.from(value.map(x=>x&255))).toString('utf8')}),
 getUuid:()=>String(++tokenCounter).padStart(8,'0')+'-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
 formatDate:(value,_tz,format)=>{const d=new Date(value);const y=d.getUTCFullYear(),m=String(d.getUTCMonth()+1).padStart(2,'0'),day=String(d.getUTCDate()).padStart(2,'0');return format==='yyyyMM'?y+m:y+'-'+m+'-'+day;}
};
const ctx={
 Date,Math,JSON,Number,String,Object,Error,Array,RegExp,Utilities:utilities,
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)||null,setProperty:(k,v)=>{props.set(k,v);}})},
 CacheService:{getScriptCache:()=>({get:k=>cache.get(k)||null,put:(k,v)=>cache.set(k,v),remove:k=>cache.delete(k)})},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 SpreadsheetApp:{openById:id=>{assert.equal(id,'FAKE_STAGING_ID_ONLY');return{getSheetByName:name=>sheets[name]?{getDataRange:()=>({getValues:()=>sheets[name].map(row=>[...row])})}:null};}},
 ContentService:{MimeType:{JSON:'application/json'},createTextOutput:value=>({content:value,setMimeType(){return this;}})},
 UrlFetchApp:{fetch:(_url,args)=>{assert.equal(_url,'https://api.fonnte.com/send');message=args.payload.message;return{getResponseCode:()=>200,getContentText:()=>JSON.stringify({status:true})};}}
};
vm.createContext(ctx);
vm.runInContext(gas,ctx,{filename:'Code.gs'});
const post=(action,payload={},session_token)=>JSON.parse(ctx.doPost({postData:{contents:JSON.stringify({action,payload,session_token})}}).content);
const fail=(response,code)=>{assert.equal(response.status,'ERROR');assert.equal(response.code,code);};
fail(post('get_customers'),401);
fail(post('mark_as_paid'),401);
fail(post('verify_otp',{no_wa:fakePhone,otp:'111111'}),401);
let r=post('request_otp',{no_wa:fakePhone});
assert.equal(r.status,'SUCCESS');
assert.equal(r.data.cooldown_seconds,60);
let otp=message.match(/Kode masuk TMfiber: ([0-9]{6})/);
assert.ok(otp);
fail(post('verify_otp',{no_wa:fakePhone,otp:'999999'}),401);
r=post('verify_otp',{no_wa:fakePhone,otp:otp[1]});
assert.equal(r.status,'SUCCESS');
assert.equal(r.data.user.role,'OWNER');
const token=r.data.session_token;
fail(post('verify_otp',{no_wa:fakePhone,otp:otp[1]}),401);
r=post('get_customers',{},token);
assert.equal(r.status,'SUCCESS');assert.equal(r.data.total,1);
r=post('get_dashboard_data',{},token);
assert.equal(r.status,'SUCCESS');assert.equal(r.data.metrics.pelanggan,1);
const period=new Date().getUTCFullYear()+String(new Date().getUTCMonth()+1).padStart(2,'0');
sheets.Tagihan[0].push('jumlah_terbayar');
sheets.Tagihan.push(['INV-STAGING-001',period,'SIM-C001','',150000,150000,'2026-11-01','CICIL','','','','',50000]);
r=post('get_dashboard_data',{},token);
assert.equal(r.status,'SUCCESS');
assert.equal(r.data.summary.terkumpul,50000);
assert.equal(r.data.summary.total_target,150000);
assert.equal(r.data.metrics.belum_bayar,1);

const invalid=token.slice(0,-1)+(token.endsWith('x')?'y':'x');
fail(post('get_customers',{},invalid),401);
assert.equal(post('logout',{},token).status,'SUCCESS');
fail(post('get_customers',{},token),401);
props.set('TM_DRY_RUN','false');
fail(post('request_otp',{no_wa:fakePhone}),503);
props.set('TM_DRY_RUN','true');
assert.ok(!/FONNTE_TOKEN\s*=\s*["']/.test(gas));
console.log('GAS_CONTRACT_TEST_PASS: session signing, OTP replay, revoke, role gate, staging gate');
