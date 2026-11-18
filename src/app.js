"use strict";
import {q,ROUTES} from './core/navigation.js';
import {navigate,heroSummary,screen,setFilter,setReadModel} from './views/screens.js';
import {tmPost} from './core/api.js';
import {hasStagingEndpoint} from './core/config.js';
let sessionToken='',currentUser=null;
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
  setReadModel({dashboard,customers,invoices});render();
 }catch(e){setReadModel(null);render();q('authMessage').textContent='Gagal membaca STAGING: '+e.message;}
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
   await tmPost('request_otp',{no_wa:'62'+phone.value.replace(/\D/g,'').replace(/^0+/,'')});
   q('otpStep').hidden=false;q('phoneStep').hidden=true;otp.disabled=false;verify.disabled=false;message.textContent='Jika akun terdaftar, kode dikirim ke WhatsApp.';otp.focus();
  }catch(e){message.textContent=e.message;}
  finally{send.disabled=!enabled;}
 });
 q('otpBack').addEventListener('click',()=>{q('otpStep').hidden=true;q('phoneStep').hidden=false;otp.disabled=true;verify.disabled=true;});
 verify.addEventListener('click',async()=>{
  verify.disabled=true;message.textContent='Memverifikasi kode...';
  try{
   const data=await tmPost('verify_otp',{no_wa:'62'+phone.value.replace(/\D/g,'').replace(/^0+/ ,''),otp:otp.value});
   if(!data.session_token||data.user?.role!=='OWNER')throw new Error('Akun pengujian belum memiliki izin Owner.');
   sessionToken=data.session_token;currentUser={role:data.user.role,nama:data.user.nama};
   dialog.close();render();await loadReadData();
  }catch(e){message.textContent=e.message;}
  finally{verify.disabled=false;}
 });
 q('logoutButton').addEventListener('click',async()=>{
  const oldToken=sessionToken;sessionToken='';currentUser=null;setReadModel(null);
  dialog.close();render();
  if(oldToken)try{await tmPost('logout',{},oldToken);}catch(e){console.warn('Revokasi sesi server belum terkonfirmasi.');}
 });
 q('panel').addEventListener('click',e=>{const chip=e.target.closest('[data-filter]');if(chip){setFilter(chip.dataset.filter);render();}});
 function connection(){q('offlineNotice').hidden=navigator.onLine;}
 window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();
 window.addEventListener('hashchange',()=>{setFilter('belum');render();window.scrollTo(0,0);});
 render();
 if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
}
document.addEventListener('DOMContentLoaded',init);
