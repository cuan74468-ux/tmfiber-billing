import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
const code=readFileSync('gas/Code.gs','utf8')+'\n'+readFileSync('gas/Payments.gs','utf8');
const headers={
 Tagihan:['ID_Tagihan','Periode','ID_Pelanggan','Label','Nominal','Total_Tagihan','Tgl_Jatuh_Tempo','Status_Bayar','Metode_Bayar','Diterima_Oleh','Waktu_Bayar','Status_Setoran','jumlah_terbayar','sisa_hutang','komisi_biller','last_mutation_key','last_mutation_at'],
 Kas_Operasional:['ID_Transaksi','Tanggal','Jenis_Transaksi','Kategori','Keterangan','Nominal','Dicatat_Oleh','ID_Tagihan','Idempotency_Key'],
 Audit_Log:['Timestamp','User','Role','Aksi','Target','Detail','prev_hash','row_hash'],
 Pembayaran_Ledger:['ID_Ledger','Timestamp','ID_Tagihan','Nominal','Metode','Petugas','Idempotency_Key','Status','Error_Kode','Catatan']
};
const values={};
for(const [name,row] of Object.entries(headers))values[name]=[[...row]];
values.Tagihan.push(['INV-TEST0001','202611','SIM-001','',150000,150000,'2026-11-30','BELUM_BAYAR','','','','',0,150000,0,'','']);
let abortAudit=false;let dbName='TMfiber STAGING Isolated';
const makeSheet=name=>({
 getDataRange:()=>({getValues:()=>values[name].map(r=>[...r])}),
 getLastRow:()=>values[name].length,
 getLastColumn:()=>values[name][0].length,
 getRange:(row,col,height=1,width=1)=>({
  getValues:()=>values[name].slice(row-1,row-1+height).map(r=>r.slice(col-1,col-1+width)),
  getValue:()=>values[name][row-1]?.[col-1],
  setValue:v=>{values[name][row-1][col-1]=v;},
  setValues:rows=>{for(let i=0;i<rows.length;i++)for(let j=0;j<rows[i].length;j++)values[name][row-1+i][col-1+j]=rows[i][j];}
 }),
 appendRow:row=>{if(name==='Audit_Log'&&abortAudit)throw Error('synthetic audit write failure');values[name].push([...row]);}
});
const props=new Map([['TM_ENVIRONMENT','STAGING'],['TM_READS_ENABLED','true'],['TM_DRY_RUN','true'],['TM_SPREADSHEET_ID','SYNTHETIC_STAGING'],['TM_MUTATIONS_ENABLED','false'],['TM_AUTO_PAYMENTS_ENABLED','false'],['TM_SESSION_SECRET','synthetic-test-only'],['TM_OTP_SECRET','synthetic-test-only-2']]);
const ctx={
 Date,Number,String,Object,Array,JSON,Math,Error,RegExp,
 Utilities:{
  DigestAlgorithm:{SHA_256:'sha256'},
  computeDigest:(_a,v)=>[...crypto.createHash('sha256').update(String(v)).digest()].map(x=>x>127?x-256:x),
  getUuid:()=>crypto.randomUUID(),
  formatDate:()=> '2026-11-18 12:00:00'
 },
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v)})},
 SpreadsheetApp:{openById:id=>{assert.equal(id,'SYNTHETIC_STAGING');return{getName:()=>dbName,getSheetByName:name=>values[name]?makeSheet(name):null};}},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})}
};
vm.createContext(ctx);vm.runInContext(code,ctx,{filename:'Code.gs+Payments.gs'});
const owner={role:'OWNER',phone:'6281111111111'};
const pay=(key,partial,amount)=>ctx.tmRecordPayment_(owner,{id_tagihan:'INV-TEST0001',idempotency_key:key,metode_bayar:'TUNAI',nominal:amount},partial);
const fails=(fn,code)=>{try{fn();assert.fail('Expected error '+code);}catch(e){if(e.tmCode!==code)throw e;}};
fails(()=>pay('synthetic-key-0001',true,50000),403);
props.set('TM_MUTATIONS_ENABLED','true');
const x=pay('synthetic-key-0001',true,50000);
assert.equal(x.new_status,'CICIL');assert.equal(x.jumlah_terbayar,50000);assert.equal(x.sisa_hutang,100000);
assert.equal(values.Tagihan[1][7],'CICIL');
assert.equal(values.Kas_Operasional.length,2);
assert.equal(values.Pembayaran_Ledger[1][7],'COMMITTED');
assert.equal(values.Audit_Log[1][6],'GENESIS');assert.equal(values.Audit_Log[1][7].length,64);
assert.equal(pay('synthetic-key-0001',true,50000).already_processed,true);
assert.equal(values.Kas_Operasional.length,2);
fails(()=>pay('synthetic-key-0002',true,200000),400);
fails(()=>pay('synthetic-key-0002',true,-100),400);
assert.equal(pay('synthetic-key-0001',false,0).already_processed,true);
const firstHash=values.Audit_Log[1][7];
const y=pay('synthetic-key-0002',false,0);
assert.equal(y.new_status,'LUNAS');assert.equal(y.sisa_hutang,0);
assert.equal(values.Tagihan[1][7],'LUNAS');
assert.equal(values.Kas_Operasional.length,3);
assert.equal(values.Audit_Log[2][6],firstHash);
assert.equal(pay('synthetic-key-0002',false,0).already_processed,true);
fails(()=>pay('synthetic-key-0003',false,0),409);
props.set('TM_DRY_RUN','false');
fails(()=>pay('synthetic-key-0004',false,0),403);
props.set('TM_DRY_RUN','true');
dbName='TMfiber PRODUKSI';
fails(()=>pay('synthetic-key-0004',false,0),403);
dbName='TMfiber STAGING Isolated';
values.Tagihan[1][7]='BELUM_BAYAR';values.Tagihan[1][12]=0;values.Tagihan[1][13]=150000;
abortAudit=true;
try{pay('synthetic-key-0005',true,10000);assert.fail('Expected synthetic crash');}catch(e){assert.equal(e.message,'synthetic audit write failure');}
abortAudit=false;
assert.equal(values.Pembayaran_Ledger.at(-1)[7],'PENDING');
fails(()=>pay('synthetic-key-0005',true,10000),409);
console.log('GAS_PAYMENT_TEST_PASS: installments, idempotence, lock gate, audit hash, pending-on-partial-failure');
