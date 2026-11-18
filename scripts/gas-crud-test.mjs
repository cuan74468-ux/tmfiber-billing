import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
const source=['gas/Code.gs','gas/Payments.gs','gas/Customers.gs'].map(f=>readFileSync(f,'utf8')).join('\n');
const headers={
 Pelanggan:['ID_Pelanggan','ODP','Nama','Label','No_WA','Alamat','Paket','Tarif','Kode_Unik','Jatuh_Tempo','User_PPPoE','Status'],
 Tagihan:['ID_Tagihan','Periode','ID_Pelanggan','Label','Nominal','Total_Tagihan','Tgl_Jatuh_Tempo','Status_Bayar','Metode_Bayar','Diterima_Oleh','Waktu_Bayar','Status_Setoran','jumlah_terbayar','sisa_hutang','komisi_biller','last_mutation_key','last_mutation_at'],
 Audit_Log:['Timestamp','User','Role','Aksi','Target','Detail','prev_hash','row_hash'],
 Operasi_Ledger:['ID_Operasi','Timestamp','Action','Resource_Key','Idempotency_Key','Request_Hash','Status','Actor','Error_Code','Catatan']
};
const tables=Object.fromEntries(Object.entries(headers).map(([k,v])=>[k,[v.slice()]]));
let simulateFailure=false;
const sheet=name=>({
 getDataRange:()=>({getValues:()=>tables[name].map(r=>[...r])}),
 getLastColumn:()=>tables[name][0].length,
 getLastRow:()=>tables[name].length,
 getRange:(i,j,height=1,width=1)=>({
  getValue:()=>tables[name][i-1][j-1],
  setValue:v=>{tables[name][i-1][j-1]=v;},
  getValues:()=>tables[name].slice(i-1,i+height-1).map(row=>row.slice(j-1,j+width))
 }),
 appendRow:row=>{if(simulateFailure&&name==='Audit_Log')throw Error('simulated append failure');tables[name].push(row.slice());}
});
const props=new Map([['TM_ENVIRONMENT','STAGING'],['TM_READS_ENABLED','true'],['TM_DRY_RUN','true'],['TM_MUTATIONS_ENABLED','true'],['TM_AUTO_PAYMENTS_ENABLED','false'],['TM_SPREADSHEET_ID','SYNTH_STAGING'],['TM_SESSION_SECRET','test-only-secret'],['TM_OTP_SECRET','test-only-secret2']]);
const context={
 Date,Number,String,Object,Array,JSON,Math,Error,RegExp,
 Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_alg,value)=>[...crypto.createHash('sha256').update(String(value)).digest()].map(x=>x>127?x-256:x),getUuid:()=>crypto.randomUUID(),formatDate:()=> '2026-11-18 14:00:00'},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v)})},
 SpreadsheetApp:{openById:id=>{assert.equal(id,'SYNTH_STAGING');return{getName:()=> 'TMfiber STAGING Isolated',getSheetByName:name=>tables[name]?sheet(name):null};}},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})}
};
vm.createContext(context);vm.runInContext(source,context);
const owner={role:'OWNER',phone:'6200000000000'},tech={role:'TEKNISI',phone:'6200000000002'};
const throws=(fn,code)=>{try{fn();assert.fail('Expected '+code);}catch(e){if(e.tmCode!==code)throw e;}};
const cust={nama:'=HYPERLINK("bad","abc")',no_wa:'6200000000001',alamat:'Jl Uji No 1',paket:'20 Mbps',tarif:150000,jatuh_tempo:10,idempotency_key:'staging-create-0001'};
throws(()=>context.tmCreateCustomer_(tech,cust),403);
const c=context.tmCreateCustomer_(owner,cust);
assert.ok(c.id_pelanggan.startsWith('CUS-'));assert.equal(c.already_processed,false);
assert.equal(tables.Pelanggan.length,2);assert.ok(tables.Pelanggan[1][2].startsWith("'="));
assert.equal(tables.Operasi_Ledger[1][6],'COMMITTED');
assert.equal(tables.Audit_Log[1][6],'GENESIS');
assert.equal(context.tmCreateCustomer_(owner,cust).already_processed,true);
assert.equal(tables.Pelanggan.length,2);
throws(()=>context.tmCreateCustomer_(owner,{...cust,idempotency_key:'staging-create-0002'}),409);
throws(()=>context.tmCreateCustomer_(owner,{...cust,tarif:200000}),409);
const inv={id_pelanggan:c.id_pelanggan,periode:'202611',idempotency_key:'staging-invoice-0001'};
const i=context.tmCreateInvoice_(owner,inv);
assert.equal(i.total_tagihan,150000);assert.equal(tables.Tagihan[1][7],'BELUM_BAYAR');
assert.equal(tables.Tagihan[1][12],0);assert.equal(tables.Tagihan[1][13],150000);
assert.equal(context.tmCreateInvoice_(owner,inv).already_processed,true);
throws(()=>context.tmCreateInvoice_(owner,{...inv,idempotency_key:'staging-invoice-0002'}),409);
assert.equal(tables.Tagihan.length,2);
props.set('TM_MUTATIONS_ENABLED','false');
throws(()=>context.tmCreateCustomer_(owner,{...cust,idempotency_key:'staging-create-0003'}),403);
props.set('TM_MUTATIONS_ENABLED','true');
simulateFailure=true;
const another={nama:'Second Test',no_wa:'6200000000003',alamat:'Jl Uji 2',paket:'10 Mbps',tarif:90000,jatuh_tempo:15,idempotency_key:'staging-create-0004'};
try{context.tmCreateCustomer_(owner,another);assert.fail('Expected audit failure');}catch(e){assert.equal(e.message,'simulated append failure');}
simulateFailure=false;
assert.equal(tables.Operasi_Ledger.at(-1)[6],'PENDING');
throws(()=>context.tmCreateCustomer_(owner,{...another,idempotency_key:'staging-create-0005'}),409);
console.log('GAS_CRUD_TEST_PASS: create customer, invoice, sanitization, duplicate locks, pending recovery stop');
