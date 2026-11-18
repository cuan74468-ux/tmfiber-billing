/* Everyday Billing V3 — public visual routes. Permission gates must be enforced in GAS. */
export const ICON={
 home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/>',
 invoice:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 8h8M8 12h8"/>',
 wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M7 6V4h12"/>',
 signal:'<path d="M3 20h3v-4H3zM9 20h3v-8H9zM15 20h3V7h-3z"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
 cash:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9h2m10 6h2"/>',
 audit:'<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 shield:'<path d="M12 2 3 6v6c0 6 4 9 9 10 5-1 9-4 9-10V6z"/><path d="m9 12 2 2 4-4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 send:'<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 arrow:'<path d="m9 18 6-6-6-6"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
 coins:'<circle cx="12" cy="12" r="9"/><path d="M9 9c1-2 6-2 6 0s-6 1-6 4 5 3 6 1M12 5v14"/>',
 alert:'<path d="M12 3 2 21h20zM12 9v5m0 4h.01"/>',
 wrench:'<path d="M14 6a6 6 0 0 0-8 8l-4 4 4 4 4-4a6 6 0 0 0 8-8l-4 4-4-4z"/>',
 link:'<path d="M10 13a5 5 0 0 0 7.5.5l3-3A5 5 0 0 0 13.5 3l-2 2M14 11a5 5 0 0 0-7.5-.5l-3 3A5 5 0 0 0 10.5 21l2-2"/>',
 card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
 download:'<path d="M12 3v12m-4-4 4 4 4-4M4 18v3h16v-3"/>'
};
export const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">'+(ICON[name]||ICON.shield)+'</svg>';
export const ROUTES=[
 {id:'beranda',label:'Beranda',symbol:'home',eyebrow:'RINGKASAN USAHA',title:'Beranda',desc:'Tagihan dan pelanggan WiFi dalam satu tempat.'},
 {id:'tagihan',label:'Tagihan',symbol:'invoice',eyebrow:'PENAGIHAN',title:'Tagihan',desc:'Lihat tagihan yang perlu ditindaklanjuti.'},
 {id:'pelanggan',label:'Pelanggan',symbol:'users',eyebrow:'DATA PELANGGAN',title:'Pelanggan',desc:'Informasi layanan dan langganan internet.'},
 {id:'kas',label:'Kas',symbol:'cash',eyebrow:'KEUANGAN',title:'Kas & Setoran',desc:'Catatan penerimaan, pengeluaran, dan setoran.'},
 {id:'menu',label:'Menu',symbol:'menu',eyebrow:'SEMUA LAYANAN',title:'Menu',desc:'Akses pekerjaan dan pengaturan lainnya.'},
 {id:'pembayaran',label:'Pembayaran',symbol:'wallet',eyebrow:'PEMBAYARAN',title:'Pembayaran',desc:'Periksa bukti dan konfirmasi pembayaran.'},
 {id:'detail-pelanggan',label:'Detail Pelanggan',symbol:'users',eyebrow:'PELANGGAN',title:'Detail Pelanggan',desc:'Layanan, tagihan, dan catatan pelanggan.'},
 {id:'detail-tagihan',label:'Detail Tagihan',symbol:'invoice',eyebrow:'TAGIHAN',title:'Detail Tagihan',desc:'Rincian pembayaran dan status tagihan.'},
 {id:'penagih',label:'Panel Penagih',symbol:'send',eyebrow:'RUANG PENAGIH',title:'Tugas Penagihan',desc:'Tagihan yang perlu diingatkan dan disetor.'},
 {id:'mikrotik',label:'Panel Teknisi',symbol:'signal',eyebrow:'RUANG TEKNISI',title:'Panel Teknisi',desc:'Pemeriksaan sambungan pelanggan.'},
 {id:'audit',label:'Riwayat Sistem',symbol:'audit',eyebrow:'ADMINISTRASI',title:'Riwayat Sistem',desc:'Catatan aktivitas dan perubahan.'},
 {id:'pengaturan',label:'Pengaturan',symbol:'settings',eyebrow:'ADMINISTRASI',title:'Pengaturan',desc:'Pengaturan usaha dan hak akses.'},
 {id:'portal',label:'Portal Pelanggan',symbol:'link',eyebrow:'LAYANAN PELANGGAN',title:'Cek Tagihan',desc:'Rancangan portal pelanggan dengan tautan aman.'}
];
export const q=id=>document.getElementById(id);
