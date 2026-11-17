"use strict";
// Frontend shell only. No privileged API calls, embedded personal records, or payment actions.
const ICONS = {
  home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/>',
  invoice:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 8h8M8 12h8"/>',
  wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M7 6V4h12"/>',
  signal:'<path d="M3 20h3v-4H3zM9 20h3v-8H9zM15 20h3V7h-3z"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
  cash:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9h2m10 6h2"/>',
  audit:'<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>',
  shield:'<path d="M12 2 3 6v6c0 6 4 9 9 10 5-1 9-4 9-10V6z"/><path d="m9 12 2 2 4-4"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  layers:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 10v10"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  check:'<path d="m5 12 5 5L20 7"/>',
  receipt:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 9h8M8 13h5"/>'
};
const icon = name => '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[name]||ICONS.shield)+'</svg>';
const ROUTES = Object.freeze([
  {id:'beranda',label:'Beranda',ico:'home',headline:'Selamat datang di TMfiber',desc:'Operasional pelanggan, tagihan, dan jaringan dalam satu ruang kerja.'},
  {id:'pelanggan',label:'Pelanggan',ico:'users',headline:'Pelanggan',desc:'Direktori pelanggan, paket, jatuh tempo, dan informasi layanan.'},
  {id:'tagihan',label:'Tagihan',ico:'invoice',headline:'Tagihan',desc:'Penerbitan, pemantauan jatuh tempo, dan riwayat periode.'},
  {id:'pembayaran',label:'Pembayaran',ico:'wallet',headline:'Pembayaran',desc:'Verifikasi penerimaan dan rekonsiliasi berdasarkan bukti transaksi.'},
  {id:'kas',label:'Kas operasional',ico:'cash',headline:'Kas operasional',desc:'Arus kas, pengeluaran, dan serah terima setoran.'},
  {id:'mikrotik',label:'Jaringan',ico:'signal',headline:'Jaringan',desc:'Status pelanggan PPPoE dan kendali router terotorisasi.'},
  {id:'audit',label:'Riwayat audit',ico:'audit',headline:'Riwayat audit',desc:'Jejak tindakan administratif dan perubahan penting.'},
  {id:'pengaturan',label:'Pengaturan',ico:'settings',headline:'Pengaturan',desc:'Pengaturan layanan, akun, dan kesiapan integrasi.'}
]);
const byId = id => document.getElementById(id);
const STATUSES = ['Belum terhubung','Menunggu autentikasi','Data pribadi tersembunyi'];
function navLink(route) {
  const a=document.createElement('a');
  a.href='#'+route.id;a.dataset.route=route.id;
  a.innerHTML=icon(route.ico)+'<span>'+route.label+'</span>';return a;
}
function buildNav(){
  ROUTES.forEach(r=>byId('sideNav').append(navLink(r)));
  ['beranda','pelanggan','tagihan','pembayaran','mikrotik'].forEach(id=>byId('mobileNav').append(navLink(ROUTES.find(r=>r.id===id))));
}
function card(title,caption,content,tag='Akses terlindungi'){
  return '<section class="surface" aria-label="'+title+'"><div class="surface-head"><div><h2>'+title+'</h2><p>'+caption+'</p></div><span class="tag">'+tag+'</span></div>'+content+'</section>';
}
function empty(title,detail,graphic='lock'){
  return '<div class="empty"><div class="empty-icon">'+icon(graphic)+'</div><h3>'+title+'</h3><p>'+detail+'</p></div>';
}
function metric(title,graphic){
  return '<article class="stat"><div class="stat-top"><span class="stat-label">'+title+'</span><span class="stat-icon">'+icon(graphic)+'</span></div><div class="stat-value" aria-label="Belum tersedia">—</div><div class="stat-caption">Tersedia setelah login terverifikasi</div></article>';
}
function sectionIntro(text){
  return '<p class="section-intro">'+text+'</p>';
}
function listHead(labels){
  return '<div class="table-head" role="row">'+labels.map(t=>'<span role="columnheader">'+t+'</span>').join('')+'</div>';
}
function toolbar(placeholder){
  return '<div class="list-toolbar"><label class="search-locked">'+icon('search')+'<input aria-label="'+placeholder+'" placeholder="'+placeholder+'" disabled></label><span class="info-pill">'+icon('lock')+' Hanya akun terverifikasi</span></div>';
}
function miniSteps(items){
  return '<ol class="mini-steps">'+items.map((s,i)=>'<li><span class="step-index">'+(i+1)+'</span><span>'+s+'</span></li>').join('')+'</ol>';
}
function home(){
  return '<div class="stats">'+metric('Pelanggan aktif','users')+metric('Tagihan periode ini','invoice')+metric('Pembayaran terverifikasi','wallet')+metric('Koneksi jaringan','signal')+'</div>'+
  '<div class="two-col">'+
  card('Aktivitas tagihan','Ringkasan penagihan terakhir',listHead(['Pelanggan','Periode','Tagihan','Status'])+empty('Belum ada data untuk ditampilkan','Masuk menggunakan akun Owner atau Kolektor untuk melihat aktivitas yang sesuai hak akses.','receipt'))+
  card('Prioritas operasional','Tindakan yang memerlukan perhatian',empty('Informasi menunggu autentikasi','Tagihan jatuh tempo dan kondisi jaringan tidak dipublikasikan di halaman ini.','shield'))+
  '</div><div class="module-spacer">'+card('Alur kerja billing','Urutan operasional yang disiapkan',miniSteps(['Terbitkan tagihan per periode dengan pemeriksaan duplikasi','Catat bukti pembayaran dan verifikasi mutasi oleh Owner','Rekonsiliasi ledger dan kas sebelum menutup periode','Evaluasi perubahan profil jaringan hanya setelah persetujuan']))+'</div>';
}
const TABLES = {
  pelanggan:['ID','Pelanggan','Paket','Status'],
  tagihan:['Invoice','Periode','Total','Status'],
  pembayaran:['Referensi','Metode','Nominal','Verifikasi'],
  kas:['Tanggal','Keterangan','Jenis','Nominal'],
  mikrotik:['Pelanggan','PPPoE','Profil','Kondisi'],
  audit:['Waktu','Aktor','Tindakan','Hasil']
};
function directory(id){
  const cfg = {
    pelanggan:{title:'Direktori pelanggan',desc:'Cari berdasarkan nama, ID, atau wilayah layanan.',search:'Cari pelanggan atau ID',icon:'users',note:'Data pelanggan hanya boleh dikirim setelah pemeriksaan sesi dan peran pada backend.'},
    tagihan:{title:'Daftar tagihan',desc:'Riwayat dan status penagihan per periode.',search:'Cari invoice atau pelanggan',icon:'invoice',note:'Penerbitan tagihan harus idempoten: satu pelanggan dan satu periode tidak boleh menghasilkan tagihan ganda.'},
    pembayaran:{title:'Antrean verifikasi',desc:'Konfirmasi pembayaran hanya oleh Owner berdasarkan mutasi rekening.',search:'Cari referensi pembayaran',icon:'wallet',note:'Klik “sudah bayar” atau screenshot bukan bukti final. Pencatatan ledger wajib idempoten.'},
    kas:{title:'Buku kas',desc:'Catatan transaksi dan setoran yang dapat diaudit.',search:'Cari catatan kas',icon:'cash',note:'Penerimaan, biaya, dan setoran dipisahkan agar tidak dihitung dua kali.'},
    mikrotik:{title:'Status jaringan PPPoE',desc:'Perintah jaringan akan memerlukan otorisasi tambahan.',search:'Cari pelanggan atau PPPoE',icon:'signal',note:'Isolir otomatis harus tetap nonaktif pada kondisi API gagal, data tidak lengkap, atau tidak sinkron.'},
    audit:{title:'Jejak perubahan',desc:'Riwayat tindakan pengguna dan layanan.',search:'Cari tindakan atau operator',icon:'audit',note:'Log perlu dicatat oleh backend. Log aplikasi saja tidak membuat Google Sheets tidak dapat diubah oleh administrator.'}
  }[id];
  return '<div class="page-actions">'+sectionIntro(cfg.desc)+'<button class="outline-action" type="button" disabled>'+icon('lock')+' '+(id==='pelanggan'?'Tambah pelanggan':id==='tagihan'?'Terbitkan tagihan':id==='pembayaran'?'Verifikasi pembayaran':id==='kas'?'Catat transaksi':id==='mikrotik'?'Kirim perintah':'Ekspor audit')+'</button></div>'+
  card(cfg.title,'Data privat tidak dimuat sebelum API login tersedia',toolbar(cfg.search)+listHead(TABLES[id])+empty('Akses data terkunci','Integrasi backend dan autentikasi perlu diselesaikan sebelum daftar dapat ditampilkan.',cfg.icon))+
  '<div class="module-spacer">'+card('Aturan operasional','Persyaratan kontrol sebelum aktivasi','<div class="guidance">'+icon('shield')+'<p>'+cfg.note+'</p></div>','Pengaman aktif')+'</div>';
}
function settings(){
  const sections=[
    {title:'Akun & akses',body:'OTP, masa sesi, peran Owner/Kolektor/Teknisi dan pembatasan akses.'},
    {title:'Billing & pembayaran',body:'Periode, jatuh tempo, QRIS statis, ledger, dan rekonsiliasi.'},
    {title:'WhatsApp',body:'Fonnte dan pembatasan pemberitahuan kepada pelanggan.'},
    {title:'Integrasi jaringan',body:'Kredensial MikroTik hanya disimpan di backend; sistem isolir memerlukan UAT.'}
  ];
  return '<div class="setting-grid">'+sections.map(s=>'<section class="setting-row"><span class="setting-dot">'+icon('shield')+'</span><div><h2>'+s.title+'</h2><p>'+s.body+'</p></div><span class="setting-state">Belum aktif</span></section>').join('')+'</div>'+
  '<div class="module-spacer">'+card('Kesiapan sistem','Tidak ada konfigurasi privat yang ditampilkan','<div class="safe-list">'+STATUSES.map(x=>'<p>'+icon('check')+' '+x+'</p>').join('')+'</div>','STAGING aman')+'</div>';
}
function render(){
  const id=location.hash.slice(1).toLowerCase();
  const route=ROUTES.find(x=>x.id===id)||ROUTES[0];
  byId('pageTitle').textContent=route.headline+'.';
  byId('pageDesc').textContent=route.desc;
  byId('crumb').textContent=route.label;
  byId('panel').innerHTML=route.id==='beranda'?home():route.id==='pengaturan'?settings():directory(route.id);
  document.title=route.label+' · TMfiber Billing';
  document.querySelectorAll('[data-route]').forEach(link=>{
    const active=link.dataset.route===route.id;
    link.classList.toggle('active',active);
    if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
}
function init(){
  buildNav();
  byId('today').textContent=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'long',year:'numeric'}).format(new Date());
  const dlg=byId('loginDialog');
  byId('openLogin').addEventListener('click',()=>dlg.showModal());
  document.querySelector('.avatar').addEventListener('click',()=>dlg.showModal());
  window.addEventListener('hashchange',render);
  render();
}
document.addEventListener('DOMContentLoaded',init);
