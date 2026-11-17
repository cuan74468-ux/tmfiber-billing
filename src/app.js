"use strict";
/* TMfiber interface V1.4 — static structure only. No API calls or embedded customer data. */
const ICON={
  home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/>',
  invoice:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 8h8M8 12h8"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M7 6V4h12"/>',
  signal:'<path d="M3 20h3v-4H3zM9 20h3v-8H9zM15 20h3V7h-3z"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
  cash:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9h2m10 6h2M3 10h18"/>',
  audit:'<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  shield:'<path d="M12 2 3 6v6c0 6 4 9 9 10 5-1 9-4 9-10V6z"/><path d="m9 12 2 2 4-4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  receipt:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 9h8M8 13h5"/>',
  send:'<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'
};
const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8">'+(ICON[name]||ICON.shield)+'</svg>';
const ROUTES=[
  {id:'beranda',label:'Beranda',symbol:'home',title:'Ringkasan WiFi',desc:'Kelola tagihan dan operasional dengan mudah.'},
  {id:'pelanggan',label:'Pelanggan',symbol:'users',title:'Pelanggan',desc:'Data pelanggan dan paket internet.'},
  {id:'tagihan',label:'Tagihan',symbol:'invoice',title:'Tagihan',desc:'Pantau pembayaran dan jatuh tempo.'},
  {id:'pembayaran',label:'Pembayaran',symbol:'wallet',title:'Pembayaran',desc:'Verifikasi pembayaran dan setoran.'},
  {id:'kas',label:'Kas',symbol:'cash',title:'Kas operasional',desc:'Pemasukan, pengeluaran dan setoran.'},
  {id:'mikrotik',label:'Jaringan',symbol:'signal',title:'Jaringan WiFi',desc:'Pantau layanan PPPoE dengan aman.'},
  {id:'audit',label:'Riwayat',symbol:'audit',title:'Riwayat aktivitas',desc:'Catatan perubahan dan pemeriksaan.'},
  {id:'pengaturan',label:'Pengaturan',symbol:'settings',title:'Pengaturan',desc:'Kelola akses dan integrasi layanan.'}
];
const q=id=>document.getElementById(id);
const screens={
  beranda:{metrics:[['Tagihan belum bayar','invoice'],['Sudah lunas','check'],['Pelanggan aktif','users']]},
  kas:{metrics:[['Pemasukan','wallet'],['Pengeluaran','cash'],['Saldo bersih','check']]},
  lainnya:{metrics:[]}
};
let currentFilter='belum';
function navItem(r){
  const a=document.createElement('a');a.href='#'+r.id;a.dataset.route=r.id;
  a.innerHTML=icon(r.symbol)+'<span>'+r.label+'</span>';return a;
}
function navigate(){
  ROUTES.forEach(r=>q('sideNav').append(navItem(r)));
  ['beranda','tagihan','pelanggan','kas','pengaturan'].forEach(id=>q('mobileNav').append(navItem(ROUTES.find(r=>r.id===id))));
}
function noData(title,message){
  return '<div class="empty"><span class="empty-illustration">'+icon('lock')+'</span><h3>'+title+'</h3><p>'+message+'</p></div>';
}
function quickAction(name,symbol){
  return '<button disabled type="button" class="quick-action">'+icon(symbol)+'<span>'+name+'</span></button>';
}
function quickActions(){
  return '<section class="quick-section"><div class="section-line"><h2>Aksi cepat</h2><small>Akses setelah login</small></div><div class="quick-grid">'+quickAction('Tagih WA','send')+quickAction('QRIS','wallet')+quickAction('Pelanggan','plus')+quickAction('Catat kas','cash')+'</div></section>';
}
function listFilters(){
  return '<div class="filter-tabs" role="group" aria-label="Status tagihan">'+[['belum','Belum bayar'],['lunas','Sudah lunas'],['semua','Semua']].map(([key,title])=>'<button type="button" class="filter'+(currentFilter===key?' selected':'')+'" data-filter="'+key+'" aria-pressed="'+(currentFilter===key)+'">'+title+'</button>').join('')+'</div>';
}
function searchField(label){
  return '<label class="search-box">'+icon('search')+'<span class="sr-only">'+label+'</span><input type="search" placeholder="'+label+'" disabled></label>';
}
function panel(title,subtitle,body,action=''){
  return '<section class="sheet"><header class="sheet-head"><div><h2>'+title+'</h2><p>'+subtitle+'</p></div>'+action+'</header>'+body+'</section>';
}
function buttonDisabled(text){
  return '<button type="button" class="small-primary" disabled>'+icon('plus')+' '+text+'</button>';
}
function home(){
  return quickActions()+'<section class="bill-section"><div class="section-line"><h2>Tagihan pelanggan</h2><span class="tiny-lock">'+icon('shield')+' Privat</span></div>'+listFilters()+searchField('Cari pelanggan atau ID PPPoE')+noData('Tagihan belum ditampilkan','Masuk sebagai petugas terdaftar untuk melihat pelanggan dan status pembayaran.')+'</section>';
}
function directory(kind){
  const map={
    pelanggan:['Daftar pelanggan','Kelola pelanggan, paket, dan jatuh tempo','Cari nama atau ID pelanggan','Tambah pelanggan'],
    tagihan:['Daftar tagihan','Filter status dan periode pembayaran','Cari nomor tagihan','Terbitkan tagihan'],
    pembayaran:['Rekonsiliasi pembayaran','Validasi mutasi sebelum menandai lunas','Cari referensi pembayaran','Verifikasi pembayaran'],
    mikrotik:['Kondisi pelanggan WiFi','Profil koneksi dan pemeriksaan jaringan','Cari ID PPPoE','Periksa jaringan'],
    audit:['Jejak aktivitas','Tindakan yang tercatat pada sistem','Cari aktivitas','Ekspor riwayat']
  }[kind];
  return panel(map[0],map[1],'<div class="list-tools">'+searchField(map[2])+buttonDisabled(map[3])+'</div>'+noData('Perlu login petugas','Data hanya tampil setelah backend memvalidasi sesi dan hak akses.'));
}
function cash(){
  return panel('Riwayat kas','Pemasukan dan pengeluaran tercatat terpisah','<div class="list-tools">'+searchField('Cari transaksi')+buttonDisabled('Catat transaksi')+'</div>'+noData('Belum ada transaksi yang ditampilkan','Kas dan setoran kolektor membutuhkan akun yang terverifikasi.'));
}
function settings(){
  const entries=[
    ['Profil usaha','Nama usaha, paket, dan jatuh tempo','settings'],
    ['Akun petugas','Owner, Kolektor, dan Teknisi','users'],
    ['WhatsApp','OTP serta pengingat tagihan','send'],
    ['Pembayaran QRIS','Konfirmasi manual dan rekonsiliasi','wallet'],
    ['Jaringan MikroTik','Sinkronisasi dan dry-run','signal'],
    ['Audit dan keamanan','Riwayat akses dan perubahan','shield']
  ];
  return '<section class="setting-list">'+entries.map(([name,desc,ic])=>'<div class="setting-item"><span class="setting-icon">'+icon(ic)+'</span><div><h2>'+name+'</h2><p>'+desc+'</p></div><span class="state">Belum aktif</span></div>').join('')+'</section>';
}
function heroSummary(id){
  if(id==='beranda'){
    return '<div class="balance"><div class="balance-top"><span>Uang WiFi terkumpul</span><span class="private-label">'+icon('lock')+' Privat</span></div><div class="balance-main">Rp •••••••</div><div class="balance-bottom"><span>Target tagihan periode ini</span><span>—</span></div><div class="progress-track"><span></span></div></div>';
  }
  if(id==='kas'){
    return '<div class="metrics">'+screens.kas.metrics.map(([name,s])=>'<div class="metric"><span>'+icon(s)+' '+name+'</span><b>—</b></div>').join('')+'</div>';
  }
  return '<div class="compact-summary"><span class="compact-glyph">'+icon('shield')+'</span><div><strong>Mode akses terlindungi</strong><p>Data dan tindakan petugas membutuhkan autentikasi.</p></div></div>';
}
function render(){
  const id=location.hash.slice(1).toLowerCase();
  const route=ROUTES.find(r=>r.id===id)||ROUTES[0];
  q('pageTitle').textContent=route.title;
  q('pageDesc').textContent=route.desc;
  q('pageEyebrow').textContent=route.label.toUpperCase();
  q('summary').innerHTML=heroSummary(route.id);
  q('panel').innerHTML=route.id==='beranda'?home():route.id==='kas'?cash():route.id==='pengaturan'?settings():directory(route.id);
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
    currentFilter=b.dataset.filter;
    render();
  });
  function setConnection(){q('offlineNotice').hidden=navigator.onLine;}
  window.addEventListener('online',setConnection);
  window.addEventListener('offline',setConnection);
  setConnection();
  window.addEventListener('hashchange',()=>{currentFilter='belum';render();});
  render();
  if('serviceWorker' in navigator&&window.isSecureContext){
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
  }
}
document.addEventListener('DOMContentLoaded',init);
