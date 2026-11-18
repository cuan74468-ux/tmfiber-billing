"use strict";
import {q,ROUTES} from './core/navigation.js';
import {navigate,heroSummary,screen,setFilter} from './views/screens.js';
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
  const isActive=a.dataset.route===route.id;
  a.classList.toggle('active',isActive);
  if(isActive)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
}
function init(){
 navigate();
 q('today').textContent=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',year:'numeric'}).format(new Date());
 const dialog=q('loginDialog');
 const open=()=>dialog.showModal();
 q('openLogin').addEventListener('click',open);
 q('accountButton').addEventListener('click',open);
 q('closeLogin').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 q('panel').addEventListener('click',event=>{
  const chip=event.target.closest('[data-filter]');
  if(!chip)return;
  setFilter(chip.dataset.filter);render();
 });
 function connection(){q('offlineNotice').hidden=navigator.onLine;}
 window.addEventListener('online',connection);
 window.addEventListener('offline',connection);
 connection();
 window.addEventListener('hashchange',()=>{setFilter('belum');render();window.scrollTo({top:0,behavior:'instant'});});
 render();
 if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
}
document.addEventListener('DOMContentLoaded',init);
