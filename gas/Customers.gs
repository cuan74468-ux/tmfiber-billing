/**
 * STAGING-only customer and invoice creation with an operation ledger.
 * NOTE: Not atomic across Sheets. PENDING blocks additional CRUD until resolved.
 */
function tmSafeText_(input,max){
 var v=String(input===undefined||input===null?'':input).trim();
 if(!v||v.length>max||/[\u0000-\u001F\u007F]/.test(v))throw tmErr_(400,'Isi formulir tidak valid.');
 // Append as literal text instead of interpreted sheet formula.
 if(/^[=+\-@]/.test(v))v="'"+v;
 return v;
}
function tmOperation_(user,p,type,body,resourceKey,apply){
 tmOwner_(user);tmWriteGate_();
 var key=tmRequireId_(p.idempotency_key);
 var fingerprint=tmSha_(type+'|'+JSON.stringify(body));
 var lock=LockService.getScriptLock();
 if(!lock.tryLock(25000))throw tmErr_(429,'Operasi sedang diproses.');
 try{
  var ledger=tmSheet_('Operasi_Ledger');
  var col=tmColumns_(ledger,['Action','Resource_Key','Idempotency_Key','Request_Hash','Status']);
  var rows=ledger.getDataRange().getValues();
  for(var i=1;i<rows.length;i++){
   var rec=rows[i];
   if(String(rec[col.Status])==='PENDING')throw tmErr_(409,'Ada operasi tertahan yang harus direkonsiliasi.');
   if(String(rec[col.Idempotency_Key])===key){
    if(String(rec[col.Action])!==type||String(rec[col.Request_Hash])!==fingerprint)throw tmErr_(409,'Kunci operasi digunakan untuk permintaan berbeda.');
    if(String(rec[col.Status])==='COMMITTED')return{already_processed:true,resource_key:String(rec[col.Resource_Key])};
    throw tmErr_(409,'Operasi sebelumnya belum tuntas.');
   }
  }
  // Validate all inputs and business invariants before writing PENDING.
  var state=apply(true);
  var audit=tmSheet_('Audit_Log'),ac=tmColumns_(audit,['prev_hash','row_hash']);
  var last=audit.getLastRow(),previousHash='GENESIS';
  if(last>1){
   previousHash=String(audit.getRange(last,ac.row_hash+1).getValue()||'');
   if(!previousHash)throw tmErr_(409,'Audit sebelumnya harus direkonsiliasi.');
  }
  var stamp=Utilities.formatDate(new Date(),TM_TZ,'yyyy-MM-dd HH:mm:ss');
  var ledgerRow=ledger.getLastRow()+1;
  ledger.appendRow(['OP-'+Utilities.getUuid(),stamp,type,resourceKey,key,fingerprint,'PENDING',user.phone,'','']);
  // If any write fails, operation remains PENDING. No blind retry.
  var result=apply(false,state);
  var target=type+':'+resourceKey;
  var detail='key='+key+';resource='+resourceKey;
  var hash=tmSha_(previousHash+'|'+stamp+'|'+user.phone+'|'+user.role+'|'+type+'|'+target+'|'+detail);
  audit.appendRow([stamp,user.phone,user.role,type,target,detail,previousHash,hash]);
  ledger.getRange(ledgerRow,col.Status+1).setValue('COMMITTED');
  result.already_processed=false;
  return result;
 }finally{lock.releaseLock();}
}
function tmCreateCustomer_(user,p){
 var name=tmSafeText_(p.nama,100),phone=tmPhone_(p.no_wa);
 var address=tmSafeText_(p.alamat,200),pkg=tmSafeText_(p.paket,75);
 var price=Number(p.tarif),due=Number(p.jatuh_tempo);
 if(!Number.isSafeInteger(price)||price<1000||price>100000000)throw tmErr_(400,'Tarif harus nominal rupiah yang valid.');
 if(!Number.isSafeInteger(due)||due<1||due>28)throw tmErr_(400,'Jatuh tempo harus tanggal 1–28.');
 var body={name:name,phone:phone,address:address,pkg:pkg,price:price,due:due};
 var id='CUS-'+Utilities.getUuid().replace(/-/g,'').slice(0,14).toUpperCase();
 return tmOperation_(user,p,'CREATE_CUSTOMER',body,id,function(preflight){
  var sh=tmSheet_('Pelanggan'),cols=tmColumns_(sh,['ID_Pelanggan','Nama','No_WA','Alamat','Paket','Tarif','Jatuh_Tempo','Status']);
  var rows=sh.getDataRange().getValues();
  for(var i=1;i<rows.length;i++){
   if(String(rows[i][cols.No_WA])===phone)throw tmErr_(409,'Nomor WA pelanggan sudah terdaftar.');
  }
  if(preflight)return{cols:cols};
  var values=new Array(sh.getLastColumn()).fill('');
  values[cols.ID_Pelanggan]=id;values[cols.Nama]=name;values[cols.No_WA]=phone;
  values[cols.Alamat]=address;values[cols.Paket]=pkg;values[cols.Tarif]=price;
  values[cols.Jatuh_Tempo]=due;values[cols.Status]='AKTIF';
  sh.appendRow(values);
  return{id_pelanggan:id};
 });
}
function tmCreateInvoice_(user,p){
 var customerId=String(p.id_pelanggan||'').trim();
 var month=String(p.periode||'').trim();
 if(!/^[A-Za-z0-9_-]{4,80}$/.test(customerId)||!/^20[0-9]{4}$/.test(month)||Number(month.slice(4))<1||Number(month.slice(4))>12)throw tmErr_(400,'Pelanggan atau periode tidak valid.');
 var body={customerId:customerId,month:month};
 var id='INV-'+month+'-'+Utilities.getUuid().replace(/-/g,'').slice(0,12).toUpperCase();
 return tmOperation_(user,p,'CREATE_INVOICE',body,customerId+':'+month,function(preflight){
  var cust=tmSheet_('Pelanggan'),c=tmColumns_(cust,['ID_Pelanggan','Tarif','Jatuh_Tempo','Status']);
  var clients=cust.getDataRange().getValues(),found=null;
  for(var i=1;i<clients.length;i++)if(String(clients[i][c.ID_Pelanggan])===customerId){found=clients[i];break;}
  if(!found||String(found[c.Status]).toUpperCase()!=='AKTIF')throw tmErr_(404,'Pelanggan aktif tidak ditemukan.');
  var amount=Number(found[c.Tarif]),day=Number(found[c.Jatuh_Tempo]);
  if(!Number.isSafeInteger(amount)||amount<=0||!Number.isSafeInteger(day)||day<1||day>28)throw tmErr_(409,'Paket pelanggan harus diperiksa.');
  var invoice=tmSheet_('Tagihan'),cols=tmColumns_(invoice,['ID_Tagihan','Periode','ID_Pelanggan','Nominal','Total_Tagihan','Tgl_Jatuh_Tempo','Status_Bayar','jumlah_terbayar','sisa_hutang']);
  var rows=invoice.getDataRange().getValues();
  for(var j=1;j<rows.length;j++)if(String(rows[j][cols.ID_Pelanggan])===customerId&&String(rows[j][cols.Periode]).replace(/[^0-9]/g,'').slice(0,6)===month)throw tmErr_(409,'Tagihan periode ini sudah ada.');
  if(preflight)return{cols:cols,amount:amount,day:day};
  var values=new Array(invoice.getLastColumn()).fill('');
  values[cols.ID_Tagihan]=id;values[cols.Periode]=month;values[cols.ID_Pelanggan]=customerId;
  values[cols.Nominal]=amount;values[cols.Total_Tagihan]=amount;
  values[cols.Tgl_Jatuh_Tempo]=month.slice(0,4)+'-'+month.slice(4)+'-'+String(day).padStart(2,'0');
  values[cols.Status_Bayar]='BELUM_BAYAR';values[cols.jumlah_terbayar]=0;values[cols.sisa_hutang]=amount;
  invoice.appendRow(values);
  return{id_tagihan:id,id_pelanggan:customerId,periode:month,total_tagihan:amount};
 });
}
