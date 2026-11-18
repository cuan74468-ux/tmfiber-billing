import {icon,ROUTES,q} from '../core/navigation.js';
import {TM_STAGE,hasStagingEndpoint} from '../core/config.js';
let filterValue='belum';
let readModel=null;
export function setReadModel(model){readModel=model&&typeof model==='object'?model:null;}
const escapeHtml=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const money=v=>v===null||v===undefined||v===''?'—':Number.isFinite(Number(v))?'Rp '+new Intl.NumberFormat('id-ID').format(Number(v)):'—';
const count=v=>v===null||v===undefined||v===''?'—':Number.isFinite(Number(v))?new Intl.NumberFormat('id-ID').format(Number(v)):'—';
const MAIN=['beranda','tagihan','pelanggan','kas','menu'];
function navItem(r){const a=document.createElement('a');a.href='#'+r.id;a.dataset.route=r.id;a.innerHTML=icon(r.symbol)+'<span>'+r.label+'</span>';return a;}
export function navigate(){
 for(const id of MAIN){q('mobileNav').append(navItem(ROUTES.find(r=>r.id===id)));q('sideNav').append(navItem(ROUTES.find(r=>r.id===id)));}
}
const status=(text,tone='neutral')=>'<span class="pill '+tone+'">'+text+'</span>';
const locked=(title,description)=>'<div class="empty"><span class="empty-icon">'+icon('lock')+'</span><h3>'+title+'</h3><p>'+description+'</p></div>';
const search=(label)=>'<label class="search-box">'+icon('search')+'<span class="sr-only">'+label+'</span><input type="search" data-list-search placeholder="'+label+'" '+(readModel?'':'disabled')+'></label>';
const canCreate=()=>Boolean(readModel&&hasStagingEndpoint()&&TM_STAGE.mutationsEnabled&&!TM_STAGE.readOnly);
const canPay=()=>Boolean(canCreate()&&TM_STAGE.financeEnabled);
const action=(label,ic='plus',command='')=>'<button class="outline-button" type="button" '+(command&&canCreate()?'data-command="'+command+'"':'disabled')+'>'+icon(ic)+'<span>'+label+'</span></button>';
const header=(title,sub,button='')=>'<header class="section-head"><div><h2>'+title+'</h2><p>'+sub+'</p></div>'+button+'</header>';
const panel=(title,sub,body,button='')=>'<section class="panel">'+header(title,sub,button)+body+'</section>';
const filters=()=>{
 const opts=[['belum','Belum bayar'],['cicil','Cicilan'],['lunas','Lunas'],['semua','Semua']];
 return '<div class="filter-tabs" role="group" aria-label="Status tagihan">'+opts.map(([v,l])=>'<button class="filter'+(filterValue===v?' selected':'')+'" type="button" data-filter="'+v+'" aria-pressed="'+(filterValue===v)+'">'+l+'</button>').join('')+'</div>';
};
const toolbar=(placeholder,button)=>'<div class="toolbar">'+search(placeholder)+(button?action(button,'plus',button==='Tambah pelanggan'?'customer':button==='Buat tagihan'?'invoice':''):'')+'</div>';
function kpi(label,kind,ic,value=null){
 return '<div class="kpi '+kind+'"><div class="kpi-top"><span>'+label+'</span><span class="kpi-icon">'+icon(ic)+'</span></div><strong>'+count(value)+'</strong><small>'+(readModel?'Data STAGING':'Data setelah login')+'</small></div>';
}
export function heroSummary(id){
 if(id==='beranda'){const data=readModel?.dashboard;return '<div class="summary-wrap"><div class="featured-balance"><span>Penerimaan bulan ini · STAGING</span><strong>'+(data?money(data.summary?.terkumpul):'Rp •••••••')+'</strong><div class="balance-bottom">'+icon('shield')+' <span>'+(data?'Data pengujian terotorisasi':'Hanya tampil setelah masuk')+'</span></div></div><div class="kpi-grid">'+kpi('Belum bayar','warning','clock',data?.metrics?.belum_bayar)+kpi('Sudah lunas','success','check',data?.metrics?.lunas)+kpi('Pelanggan','blue','users',data?.metrics?.pelanggan)+kpi('Jatuh tempo','danger','calendar',data?.metrics?.jatuh_tempo)+'</div></div>';}
 if(id==='tagihan')return '<div class="kpi-grid standalone">'+kpi('Belum bayar','warning','clock')+kpi('Cicilan','blue','coins')+kpi('Sudah lunas','success','check')+kpi('Total tagihan','neutral','invoice')+'</div>';
 if(id==='kas')return '<div class="kpi-grid standalone">'+kpi('Pemasukan','success','wallet')+kpi('Pengeluaran','warning','cash')+kpi('Setoran','blue','coins')+kpi('Saldo kas','neutral','check')+'</div>';
 return '';
}
function quickLinks(){
 const items=[['Kirim tagihan','send'],['Catat bayar','wallet'],['Tambah pelanggan','users'],['Catat kas','cash']];
 return '<section class="quick-section">'+header('Pekerjaan cepat','Tindakan tersedia setelah login')+'<div class="quick-grid">'+items.map(([name,ic])=>{const command=name==='Tambah pelanggan'?'customer':name==='Catat bayar'?'payment-full':'';const allowed=command==='customer'?canCreate():command==='payment-full'?canPay():false;return '<button class="quick-action" '+(allowed?'data-command="'+command+'"':'disabled')+' type="button"><span class="quick-icon">'+icon(ic)+'</span><strong>'+name+'</strong></button>';}).join('')+'</div></section>';
}
function readList(type){
 if(!readModel)return null;
 const source=type==='pelanggan'?readModel.customers:type==='tagihan'?readModel.invoices:type==='pembayaran'?readModel.invoices:null;
 if(!source||!Array.isArray(source.items))return null;
 let records=source.items.slice(0,50);
 if(type==='tagihan')records=records.filter(r=>{
  const st=String(r.status||'').trim().toUpperCase().replace(/\s+/g,'_');
  if(filterValue==='semua')return true;
  if(filterValue==='lunas')return st==='LUNAS';
  if(filterValue==='cicil')return st==='CICIL';
  return ['BELUM','BELUM_BAYAR','MENUNGGU','BELUM_LUNAS'].includes(st);
 });
 if(records.length===0)return locked('Tidak ada data untuk pilihan ini','Coba pilih status tagihan lain.');
 const items=records.map(r=>{
  const name=type==='pelanggan'?r.nama:(r.id||'Tagihan');
  const sub=type==='pelanggan'?(r.paket||'Paket belum diisi'):(r.periode||'Periode belum diisi');
  const amount=type==='pelanggan'?money(r.tarif):money(r.nominal);
  const state=r.status?escapeHtml(r.status):'—';
  return '<div class="read-row"><div><strong>'+escapeHtml(name)+'</strong><small>'+escapeHtml(sub)+'</small></div><div class="read-meta"><strong>'+amount+'</strong><small>'+state+'</small>'+(type==='tagihan'&&canPay()&&state.toUpperCase()!=='LUNAS'?'<button class="inline-pay" type="button" data-command="payment-full" data-invoice-id="'+escapeHtml(r.id)+'">Catat lunas</button><button class="inline-pay" type="button" data-command="payment-part" data-invoice-id="'+escapeHtml(r.id)+'">Catat cicilan</button>':'')+'</div></div>';
 }).join('');
 return '<div class="read-list">'+items+'</div>';
}
export function home(){
 return quickLinks()+panel('Tagihan pelanggan','Pantau pembayaran yang perlu ditindaklanjuti',filters()+toolbar('Cari nama atau nomor pelanggan')+(readList('tagihan')||locked('Daftar tagihan terlindungi','Masuk untuk melihat pelanggan, jumlah tagihan, dan tindakan penagihan.')),'<a class="text-link" href="#tagihan">Semua tagihan '+icon('arrow')+'</a>')+
 '<div class="secondary-row">'+panel('Aktivitas terkini','Penerimaan dan perubahan terbaru',locked('Belum ada aktivitas ditampilkan','Riwayat usaha hanya tersedia setelah login.'))+'</div>';
}
function listScreen(type){
 const data={
 pelanggan:['Daftar pelanggan','Cari, lihat paket dan status pelanggan','Cari pelanggan','Tambah pelanggan','Belum ada data pelanggan yang dapat dilihat','detail-pelanggan'],
 tagihan:['Daftar tagihan','Status pembayaran dan jatuh tempo','Cari tagihan','Buat tagihan','Tagihan hanya tersedia setelah login','detail-tagihan'],
 pembayaran:['Riwayat pembayaran','Bukti bayar dan konfirmasi manual','Cari pembayaran','Konfirmasi bayar','Pembayaran harus diverifikasi sebelum dinyatakan lunas',null],
 audit:['Riwayat aktivitas','Akses hanya untuk pemilik usaha','Cari aktivitas','Unduh riwayat','Riwayat tindakan tidak tersedia secara publik',null],
 mikrotik:['Pemeriksaan jaringan','Area khusus teknisi; tindakan router belum aktif','Cari pelanggan','Periksa sambungan','Tidak ada perintah MikroTik yang dijalankan',null],
 penagih:['Daftar tugas penagihan','Tagihan jatuh tempo, cicilan, dan setoran penagih','Cari pelanggan','Kirim pengingat','Tugas penagih tersedia setelah akun diverifikasi',null]
 }[type];
 let extra=type==='tagihan'?filters():'';
 extra+=toolbar(data[2],type==='pelanggan'?'Tambah pelanggan':type==='tagihan'?'Buat tagihan':null);
 if(type==='pelanggan'||type==='tagihan')extra+='<div class="data-column-hint">'+(type==='pelanggan'?'Nama pelanggan · Paket · Status':'Pelanggan · Periode · Nominal · Status')+'</div>';
 extra+=(readList(type)||locked('Akses petugas diperlukan',data[4]));
 if(data[5])extra+='<div class="related-route"><a href="#'+data[5]+'">Lihat rancangan '+(type==='pelanggan'?'detail pelanggan':'detail tagihan')+' '+icon('arrow')+'</a></div>';
 return panel(data[0],data[1],extra);
}
function detail(kind){
 const customer=kind==='detail-pelanggan';
 const info=customer?[
 ['Informasi pelanggan','Nama, kontak dan alamat layanan','users'],
 ['Paket internet','Kecepatan, biaya dan status layanan','signal'],
 ['Riwayat tagihan','Jatuh tempo dan bukti pembayaran','invoice'],
 ['Catatan teknisi','Penanganan gangguan pelanggan','wrench']
 ]:[
 ['Rincian tagihan','Periode, nominal dan jatuh tempo','invoice'],
 ['Riwayat pembayaran','Pembayaran penuh atau sebagian','wallet'],
 ['Sisa cicilan','Jumlah dibayar dan sisa yang perlu ditagih','coins'],
 ['Bukti & audit','Bukti penerimaan serta perubahan status','shield']
 ];
 return panel(customer?'Detail Pelanggan':'Detail Tagihan','Data hanya dapat ditampilkan setelah login', '<div class="detail-rows">'+info.map(([name,sub,ic])=>'<div class="detail-row"><span class="detail-icon">'+icon(ic)+'</span><div><strong>'+name+'</strong><small>'+sub+'</small></div>'+status('Terkunci')+'</div>').join('')+'</div>');
}
export function cash(){return panel('Buku kas dan setoran','Pemasukan, pengeluaran dan setoran penagih',toolbar('Cari catatan kas','Catat transaksi')+locked('Buku kas belum tersedia','Catatan keuangan hanya tampil untuk petugas dengan izin.'));}
export function settings(){
 const entries=[
 ['Profil usaha','Nama usaha dan identitas layanan','settings'],
 ['Paket internet','Daftar paket dan tarif pelanggan','signal'],
 ['Petugas dan akses','Owner, penagih dan teknisi','users'],
 ['WhatsApp','Pengingat tagihan dan OTP','send'],
 ['QRIS & rekening','Penerimaan dan rekonsiliasi manual','wallet'],
 ['Keamanan','Sesi, perubahan dan riwayat sistem','shield']
 ];
 return panel('Pengaturan usaha','Hanya pemilik yang berwenang mengubah konfigurasi','<div class="settings-list">'+entries.map(([name,sub,ic])=>'<div class="setting-row"><span class="setting-icon">'+icon(ic)+'</span><div><strong>'+name+'</strong><small>'+sub+'</small></div>'+status('Belum aktif')+'</div>').join('')+'</div>');
}
export function menuScreen(){
 const sections=[
 ['Pekerjaan harian',['beranda','pelanggan','tagihan','pembayaran','kas']],
 ['Ruang petugas',['penagih','mikrotik']],
 ['Layanan lain',['portal','audit','pengaturan']]
 ];
 return '<div class="menu-layout">'+sections.map(([title,ids])=>'<section class="menu-section"><h2>'+title+'</h2><div class="menu-list">'+ids.map(id=>{
  const r=ROUTES.find(x=>x.id===id);
  return '<a class="menu-tile" href="#'+id+'"><span class="menu-icon">'+icon(r.symbol)+'</span><span><strong>'+r.label+'</strong><small>'+r.desc+'</small></span>'+icon('arrow')+'</a>';
 }).join('')+'</div></section>').join('')+'</div>';
}
function portal(){
 return panel('Cek tagihan pelanggan','Rancangan halaman publik dari tautan WhatsApp','<div class="portal-note">'+icon('shield')+'<div><strong>Tagihan hanya dibuka melalui tautan yang sah</strong><p>Verifikasi tanda tangan, masa berlaku, dan pembatasan akses dilakukan pada server. Halaman ini belum menerima atau menampilkan data pelanggan.</p></div></div>'+locked('Tautan tagihan belum diaktifkan','Jangan masukkan data pelanggan sebelum backend portal siap.'));
}
export function screen(id){
 if(id==='beranda')return home();
 if(['pelanggan','tagihan','pembayaran','mikrotik','audit','penagih'].includes(id))return listScreen(id);
 if(id==='kas')return cash();
 if(id==='pengaturan')return settings();
 if(id==='menu')return menuScreen();
 if(id==='portal')return portal();
 if(['detail-pelanggan','detail-tagihan'].includes(id))return detail(id);
 return home();
}
export function setFilter(value){if(['belum','cicil','lunas','semua'].includes(value))filterValue=value;}
