"use strict";
import {q,ROUTES} from "./core/navigation.js";
import {navigate,home,directory,cash,settings,menuScreen,heroSummary,setFilter} from "./views/screens.js";
function render(){
  const id=location.hash.slice(1).toLowerCase();
  const route=ROUTES.find(r=>r.id===id)||ROUTES[0];
  q('pageTitle').textContent=route.title;
  q('pageDesc').textContent=route.desc;
  q('pageEyebrow').textContent=route.label.toUpperCase();
  q('summary').innerHTML=heroSummary(route.id);
  q('panel').innerHTML=route.id==='beranda'?home():route.id==='kas'?cash():route.id==='pengaturan'?settings():route.id==='menu'?menuScreen():directory(route.id);
  document.title=route.label+' · TMfiber Billing';
  document.querySelectorAll('[data-route]').forEach(a=>{
    const active=a.dataset.route===route.id;
    a.classList.toggle('active',active);
    if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
}
function init(){
  navigate();
  q('today').textContent=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',year:'numeric'}).format(new Date());
  const dialog=q('loginDialog');
  q('openLogin').addEventListener('click',()=>dialog.showModal());
  q('accountButton').addEventListener('click',()=>dialog.showModal());
  q('closeLogin').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  q('panel').addEventListener('click',e=>{
    const b=e.target.closest('[data-filter]');
    if(!b)return;
    setFilter(b.dataset.filter);
    render();
  });
  function setConnection(){q('offlineNotice').hidden=navigator.onLine;}
  window.addEventListener('online',setConnection);
  window.addEventListener('offline',setConnection);
  setConnection();
  window.addEventListener('hashchange',()=>{setFilter('belum');render();});
  render();
  if('serviceWorker' in navigator&&window.isSecureContext){
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
  }
}
document.addEventListener('DOMContentLoaded',init);
