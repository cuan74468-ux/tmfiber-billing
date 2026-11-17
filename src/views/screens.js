import {q,icon,ROUTES} from "../core/navigation.js";
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
export function navigate(){
  ROUTES.filter(r=>['beranda','tagihan','pelanggan','kas','menu'].includes(r.id)).forEach(r=>q('sideNav').append(navItem(r)));
  ['beranda','tagihan','pelanggan','kas','menu'].forEach(id=>q('mobileNav').append(navItem(ROUTES.find(r=>r.id===id))));
}
function noData(title,message){
  return '<div class="empty"><span class="empty-illustration">'+icon('lock')+'</span><h3>'+title+'</h3><p>'+message+'</p></div>';
}
function quickAction(name,symbol){
  return '<button disabled type="button" class="quick-action"><span class="quick-icon">'+icon(symbol)+'</span><span>'+name+'</span><small>Perlu masuk</small></button>';
}
function quickActions(){
  return '<section class="quick-section"><div class="section-line"><h2>Pekerjaan sehari-hari</h2><small>Aktif setelah masuk</small></div><div class="quick-grid">'+quickAction('Kirim tagihan','send')+quickAction('Pembayaran','wallet')+quickAction('Pelanggan baru','plus')+quickAction('Catat kas','cash')+'</div></section>';
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
export function home(){
  return quickActions()+'<section class="bill-section"><div class="section-line"><h2>Tagihan pelanggan</h2><span class="tiny-lock">'+icon('shield')+' Privat</span></div>'+listFilters()+searchField('Cari nama atau nomor pelanggan')+noData('Tagihan belum ditampilkan','Masuk sebagai petugas terdaftar untuk melihat pelanggan dan status pembayaran.')+'</section>';
}
export function directory(kind){
  const map={
    pelanggan:['Daftar pelanggan','Kelola pelanggan, paket, dan jatuh tempo','Cari nama atau ID pelanggan','Tambah pelanggan'],
    tagihan:['Daftar tagihan','Filter status dan periode pembayaran','Cari nomor tagihan','Terbitkan tagihan'],
    pembayaran:['Rekonsiliasi pembayaran','Validasi mutasi sebelum menandai lunas','Cari referensi pembayaran','Verifikasi pembayaran'],
    mikrotik:['Pemeriksaan sambungan','Data sambungan untuk petugas teknis','Cari pelanggan','Periksa jaringan'],
    audit:['Jejak aktivitas','Tindakan yang tercatat pada sistem','Cari aktivitas','Ekspor riwayat']
  }[kind];
  return panel(map[0],map[1],'<div class="list-tools">'+searchField(map[2])+buttonDisabled(map[3])+'</div>'+noData('Perlu login petugas','Data hanya tampil setelah backend memvalidasi sesi dan hak akses.'));
}
export function cash(){
  return panel('Riwayat kas','Pemasukan dan pengeluaran tercatat terpisah','<div class="list-tools">'+searchField('Cari transaksi')+buttonDisabled('Catat transaksi')+'</div>'+noData('Belum ada transaksi yang ditampilkan','Kas dan setoran kolektor membutuhkan akun yang terverifikasi.'));
}
export function settings(){
  const entries=[
    ['Profil usaha','Nama usaha, paket, dan jatuh tempo','settings'],
    ['Akun petugas','Owner, Kolektor, dan Teknisi','users'],
    ['WhatsApp','OTP serta pengingat tagihan','send'],
    ['Pembayaran QRIS','Konfirmasi manual dan rekonsiliasi','wallet'],
    ['Alat teknisi','Pemeriksaan sambungan jaringan','signal'],
    ['Riwayat sistem','Catatan perubahan untuk pemilik','shield']
  ];
  return '<section class="setting-list">'+entries.map(([name,desc,ic])=>'<div class="setting-item"><span class="setting-icon">'+icon(ic)+'</span><div><h2>'+name+'</h2><p>'+desc+'</p></div><span class="state">Belum aktif</span></div>').join('')+'</section>';
}
export function menuScreen(){
  const groups=[
    ['BILLING & KEUANGAN', ['beranda','tagihan','pelanggan','pembayaran','kas']],
    ['INFRASTRUKTUR & SISTEM', ['mikrotik','audit','pengaturan']]
  ];
  return '<section class="menu-screen"><p class="menu-help">Pilih menu sesuai pekerjaan Anda. Data usaha tetap terlindungi.</p>'+groups.map(([title,ids])=>'<div class="menu-group"><h2>'+title+'</h2><div class="menu-grid">'+ids.map(id=>{
    const route=ROUTES.find(r=>r.id===id);
    return '<a href="#'+route.id+'" class="menu-tile"><span class="menu-tile-icon">'+icon(route.symbol)+'</span><span><strong>'+route.label+'</strong><small>'+route.desc+'</small></span><span class="menu-chevron" aria-hidden="true">›</span></a>';
  }).join('')+'</div></div>').join('')+'</section>';
}
export function heroSummary(id){
 const item=(label,iconName,tone)=>'<div class="stat '+tone+'"><div class="stat-top"><span class="stat-label">'+label+'</span><span class="stat-icon">'+icon(iconName)+'</span></div><span class="stat-value">—</span><span class="stat-caption">Belum terhubung</span></div>';
 if(id==='beranda')return '<div class="stats">'+item('Total Pelanggan','users','blue')+item('Belum Bayar','clock','amber')+item('Sudah Lunas','check','teal')+item('Penerimaan Bulan Ini','wallet','violet')+'</div>';
 if(id==='kas')return '<div class="stats">'+item('Pemasukan','wallet','blue')+item('Pengeluaran','cash','amber')+item('Sisa Kas','check','teal')+'</div>';
 if(id==='tagihan')return '<div class="stats">'+item('Total Tagihan','invoice','blue')+item('Belum Bayar','clock','amber')+item('Sudah Lunas','check','teal')+'</div>';
 return '<div class="compact-summary">'+icon('shield')+'<div><strong>Akses privat</strong><p>Informasi tersedia untuk petugas setelah login.</p></div></div>';
}
export function setFilter(value){if(['belum','lunas','semua'].includes(value))currentFilter=value;}
