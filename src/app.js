"use strict";
/* TMfiber Frontend. No embedded credentials, customer records or privileged API. */
const ICONS={
home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/>',
invoice:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 8h8M8 12h8"/>',
wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M7 6V4h12"/>',
signal:'<path d="M3 20h3v-4H3zM9 20h3v-8H9zM15 20h3V7h-3z"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
cash:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9h2m10 6h2"/>',
audit:'<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
shield:'<path d="M12 2 3 6v6c0 6 4 9 9 10 5-1 9-4 9-10V6z"/><path d="m9 12 2 2 4-4"/>',
blank:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8"/>'
};
const icon=(name)=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[name]||ICONS.blank)+'</svg>';
const ROUTES=[
{id:'beranda',label:'Beranda',ico:'home',headline:'Selamat datang di TMfiber',desc:'Kendali operasional jaringan dalam satu tempat.'},
{id:'pelanggan',label:'Pelanggan',ico:'users',headline:'Pelanggan',desc:'Kelola pelanggan, paket internet, dan informasi jaringan.'},
{id:'tagihan',label:'Tagihan',ico:'invoice',headline:'Tagihan',desc:'Pantau periode tagihan, jatuh tempo, dan status pembayaran.'},
{id:'pembayaran',label:'Pembayaran',ico:'wallet',headline:'Pembayaran',desc:'Verifikasi manual transaksi dan rekonsiliasi pembayaran.'},
{id:'kas',label:'Kas operasional',ico:'cash',headline:'Kas operasional',desc:'Catat biaya, pemasukan lain, dan setoran kolektor.'},
{id:'mikrotik',label:'Jaringan',ico:'signal',headline:'Jaringan MikroTik',desc:'Pantau koneksi dan perintah jaringan secara terkendali.'},
{id:'audit',label:'Riwayat audit',ico:'audit',headline:'Riwayat audit',desc:'Telusuri tindakan sensitif dan perubahan yang tercatat.'},
{id:'pengaturan',label:'Pengaturan',ico:'settings',headline:'Pengaturan',desc:'Konfigurasi bisnis dan keamanan operator.'}
];
const el=id=>document.getElementById(id);
function navLink(route){const a=document.createElement('a');a.href='#'+route.id;a.dataset.route=route.id;a.innerHTML=icon(route.ico)+'<span>'+route.label+'</span>';return a}
function makeNav(){ROUTES.forEach(r=>el('sideNav').append(navLink(r)));['beranda','pelanggan','tagihan','pembayaran','mikrotik'].forEach(id=>el('mobileNav').append(navLink(ROUTES.find(x=>x.id===id))))}
function section(title,detail,body){return '<section class="surface"><div class="surface-head"><div><h2>'+title+'</h2><p>'+detail+'</p></div><span class="tag">Akses terbatas</span></div>'+body+'</section>'}
function blank(message){return '<div class="empty"><div class="empty-icon">'+icon('shield')+'</div><h3>Data belum tersedia</h3><p>'+message+'</p></div>'}
function stat(label,ico){return '<article class="stat"><div class="stat-top"><span class="stat-label">'+label+'</span><span class="stat-icon">'+icon(ico)+'</span></div><div class="stat-value">—</div><div class="stat-caption">Menunggu sesi terverifikasi</div></article>'}
function home(){return '<div class="stats">'+stat('Pelanggan aktif','users')+stat('Tagihan bulan ini','invoice')+stat('Pembayaran diterima','wallet')+stat('Status jaringan','signal')+'</div><div class="two-col">'+section('Aktivitas tagihan','Ringkasan kegiatan terakhir','<div class="table-head"><span>Pelanggan</span><span>Periode</span><span>Nominal</span><span>Status</span></div>'+blank('Masuk menggunakan akun terotorisasi untuk memuat aktivitas dan tagihan.'))+section('Kondisi operasional','Pantauan layanan TMfiber',blank('Status router dan pembayaran hanya tersedia setelah API terintegrasi.'))+'</div>'}
function generic(id){const defs={pelanggan:['Direktori pelanggan','Nama','Paket','Jatuh tempo','Status'],tagihan:['Daftar tagihan','Pelanggan','Periode','Total','Status'],pembayaran:['Rekonsiliasi pembayaran','Invoice','Metode','Nominal','Status'],kas:['Buku kas operasional','Tanggal','Kategori','Nominal','Status'],mikrotik:['Status koneksi PPPoE','Pelanggan','Profil','Koneksi','Status'],audit:['Log aktivitas sistem','Waktu','Aktor','Tindakan','Hasil'],pengaturan:['Pengaturan workspace','Pengaturan','Nilai','Hak akses','Status']};const d=defs[id];return section(d[0],'Tampilan akan memuat data hanya setelah server memvalidasi sesi.','<div class="table-head">'+d.slice(1).map(x=>'<span>'+x+'</span>').join('')+'</div>'+blank('Tidak ada data yang ditampilkan pada halaman publik sebelum integrasi dan autentikasi backend disetujui.'))}
function render(){const id=decodeURIComponent(location.hash.slice(1));const route=ROUTES.find(x=>x.id===id)||ROUTES[0];el('pageTitle').innerHTML=route.headline+'<span class="accent">.</span>';el('pageDesc').textContent=route.desc;el('crumb').textContent=route.label;el('panel').innerHTML=route.id==='beranda'?home():generic(route.id);document.querySelectorAll('[data-route]').forEach(a=>{const active=a.dataset.route===route.id;a.classList.toggle('active',active);active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')})}
document.addEventListener('DOMContentLoaded',()=>{makeNav();el('today').textContent=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'long',year:'numeric'}).format(new Date());const dlg=el('loginDialog');el('openLogin').addEventListener('click',()=>dlg.showModal());document.querySelector('.avatar').addEventListener('click',()=>dlg.showModal());window.addEventListener('hashchange',render);render();});
/* No service worker caching of HTML or authenticated responses until authenticated offline strategy is security-reviewed. */
