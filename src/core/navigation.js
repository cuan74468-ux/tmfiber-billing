/* Public navigation configuration only. */
export const ICON={
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
export const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8">'+(ICON[name]||ICON.shield)+'</svg>';
export const ROUTES=[
  {id:'beranda',label:'Dashboard',symbol:'home',title:'Dashboard',desc:'Ringkasan pelanggan, tagihan, dan penerimaan WiFi.'},
  {id:'pelanggan',label:'Data Pelanggan',symbol:'users',title:'Pelanggan',desc:'Data pelanggan dan paket internet.'},
  {id:'tagihan',label:'Tagihan',symbol:'invoice',title:'Tagihan',desc:'Pantau pembayaran dan jatuh tempo.'},
  {id:'pembayaran',label:'Pembayaran',symbol:'wallet',title:'Pembayaran',desc:'Verifikasi pembayaran dan setoran.'},
  {id:'kas',label:'Kas',symbol:'cash',title:'Kas WiFi',desc:'Pemasukan, pengeluaran dan setoran.'},
  {id:'mikrotik',label:'Alat teknisi',symbol:'signal',title:'Alat teknisi',desc:'Pemeriksaan sambungan WiFi untuk petugas teknis.'},
  {id:'audit',label:'Riwayat sistem',symbol:'audit',title:'Riwayat sistem',desc:'Catatan perubahan untuk pemilik usaha.'},
  {id:'pengaturan',label:'Pengaturan',symbol:'settings',title:'Pengaturan',desc:'Kelola akses dan integrasi layanan.'},
  {id:'menu',label:'Menu',symbol:'settings',title:'Menu layanan',desc:'Semua pekerjaan TMfiber dalam satu tempat.'}
];
export const q=id=>document.getElementById(id);
