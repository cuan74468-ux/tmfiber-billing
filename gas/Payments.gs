/**
 * STAGING ONLY — manual cash/transfer/QRIS-static reconciliation.
 * No bank automation. All write actions require an additional disabled-by-default ScriptProperty.
 * Must be installed alongside Code.gs in a SEPARATE staging Apps Script project.
 */
function tmWriteGate_(){
 tmGate_();
 var p=tmConfig_();
 if(p.getProperty('TM_MUTATIONS_ENABLED')!=='true'||
    p.getProperty('TM_AUTO_PAYMENTS_ENABLED')!=='false'||
    p.getProperty('TM_DRY_RUN')!=='true')throw tmErr_(403,'Penulisan transaksi belum diaktifkan di STAGING.');
 var name=SpreadsheetApp.openById(p.getProperty('TM_SPREADSHEET_ID')).getName();
 if(!/STAGING/i.test(name)||/PRODUCTION/i.test(name))throw tmErr_(403,'Database tidak dinyatakan sebagai STAGING.');
}
function tmSheet_(name){var sh=SpreadsheetApp.openById(tmConfig_().getProperty('TM_SPREADSHEET_ID')).getSheetByName(name);if(!sh)throw tmErr_(503,'Tab '+name+' belum tersedia.');return sh;}
function tmColumns_(sheet,needed){
 var header=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(function(x){return String(x).trim();});
 needed.forEach(function(name){if(header.indexOf(name)<0)throw tmErr_(503,'Kolom STAGING belum siap: '+name);});
 var out={};header.forEach(function(name,i){out[name]=i;});return out;
}
function tmRequireId_(input){
 var key=String(input||'').trim();
 if(!/^[A-Za-z0-9_-]{12,80}$/.test(key))throw tmErr_(400,'Kunci idempotensi tidak valid.');
 return key;
}
function tmRecordPayment_(user,p,partial){
 tmOwner_(user);tmWriteGate_();
 var invoiceId=String(p.id_tagihan||'').trim(),key=tmRequireId_(p.idempotency_key);
 if(!/^[A-Za-z0-9_-]{4,80}$/.test(invoiceId))throw tmErr_(400,'ID tagihan tidak valid.');
 var method=String(p.metode_bayar||'').toUpperCase();
 if(['TUNAI','TRANSFER','QRIS_STATIC_MANUAL'].indexOf(method)<0)throw tmErr_(400,'Metode pembayaran tidak dikenal.');
 var lock=LockService.getScriptLock();
 if(!lock.tryLock(25000))throw tmErr_(429,'Transaksi sedang diproses. Coba lagi.');
 try{
  var ledger=tmSheet_('Pembayaran_Ledger'),invoice=tmSheet_('Tagihan'),cash=tmSheet_('Kas_Operasional'),audit=tmSheet_('Audit_Log');
  var lc=tmColumns_(ledger,['ID_Ledger','ID_Tagihan','Idempotency_Key','Status']),
      ic=tmColumns_(invoice,['ID_Tagihan','Total_Tagihan','Status_Bayar','jumlah_terbayar','sisa_hutang','komisi_biller','last_mutation_key','last_mutation_at']),
      cc=tmColumns_(cash,['ID_Transaksi','ID_Tagihan','Idempotency_Key']),
      ac=tmColumns_(audit,['prev_hash','row_hash']);
  var ledgerRows=ledger.getDataRange().getValues();
  for(var i=1;i<ledgerRows.length;i++){
    if(String(ledgerRows[i][lc.Idempotency_Key])===key){
      if(String(ledgerRows[i][lc.ID_Tagihan])!==invoiceId)throw tmErr_(409,'Kunci transaksi sudah digunakan.');
      if(String(ledgerRows[i][lc.Status])==='COMMITTED')return{id_tagihan:invoiceId,idempotency_key:key,already_processed:true};
      throw tmErr_(409,'Transaksi tertahan untuk rekonsiliasi manual.');
    }
  }
  var rows=invoice.getDataRange().getValues(),rowIndex=-1;
  for(var j=1;j<rows.length;j++)if(String(rows[j][ic.ID_Tagihan])===invoiceId){rowIndex=j+1;break;}
  if(rowIndex<2)throw tmErr_(404,'Tagihan tidak ditemukan.');
  var data=rows[rowIndex-1],total=Number(data[ic.Total_Tagihan]);
  if(!Number.isSafeInteger(total)||total<=0)throw tmErr_(409,'Nominal tagihan perlu diperiksa.');
  var status=String(data[ic.Status_Bayar]).toUpperCase();
  if(status==='LUNAS')throw tmErr_(409,'Tagihan sudah lunas.');
  if(['BELUM_BAYAR','BELUM BAYAR','BELUM','CICIL'].indexOf(status)<0)throw tmErr_(409,'Status tagihan tidak dapat diproses.');
  var prev=Number(data[ic.jumlah_terbayar]||0);
  if(!Number.isSafeInteger(prev)||prev<0||prev>=total)throw tmErr_(409,'Saldo cicilan perlu direkonsiliasi.');
  var remaining=total-prev,amount=partial?Number(p.nominal):remaining;
  if(!Number.isSafeInteger(amount)||amount<=0||amount>remaining)throw tmErr_(400,'Nominal pembayaran tidak valid.');
  if(partial&&amount===remaining)throw tmErr_(400,'Untuk pelunasan penuh gunakan Tandai Lunas.');
  var nextPaid=prev+amount,nextRemain=total-nextPaid,newStatus=nextRemain===0?'LUNAS':'CICIL';
  var commission=0; // Collector assignment and commission policy not active in the owner-only MVP.
  // Complete preflight of audit chain before adding any journal entry.
  var auditLast=audit.getLastRow(),previousHash='GENESIS';
  if(auditLast>1){
    previousHash=String(audit.getRange(auditLast,ac.row_hash+1).getValue()||'');
    if(!previousHash)throw tmErr_(409,'Audit lama belum memiliki hash; perlu migrasi/review.');
  }
  var now=Utilities.formatDate(new Date(),'Asia/Jakarta','yyyy-MM-dd HH:mm:ss');
  var ledgerId='LGR-'+Utilities.getUuid().replace(/-/g,'');
  var ledgerRow=ledger.getLastRow()+1;
  ledger.appendRow([ledgerId,now,invoiceId,amount,method,user.phone,key,'PENDING','','']);
  // These calls are not atomic across Sheets. PENDING intentionally survives any partial failure.
  invoice.getRange(rowIndex,ic.jumlah_terbayar+1,1,5).setValues([[nextPaid,nextRemain,commission,key,now]]);
  invoice.getRange(rowIndex,ic.Status_Bayar+1).setValue(newStatus);
  invoice.getRange(rowIndex,ic.Metode_Bayar+1).setValue(method);
  invoice.getRange(rowIndex,ic.Diterima_Oleh+1).setValue(user.phone);
  invoice.getRange(rowIndex,ic.Waktu_Bayar+1).setValue(now);
  cash.appendRow(['KAS-'+Utilities.getUuid().replace(/-/g,''),now,'MASUK','PEMBAYARAN','Tagihan '+invoiceId,amount,user.phone,invoiceId,key]);
  var target='Tagihan:'+invoiceId;
  var detail='metode='+method+';nominal='+amount+';status='+newStatus+';key='+key;
  var hash=tmSha_(previousHash+'|'+now+'|'+user.phone+'|'+user.role+'|PAYMENT|'+target+'|'+detail);
  audit.appendRow([now,user.phone,user.role,'PAYMENT',target,detail,previousHash,hash]);
  ledger.getRange(ledgerRow,8).setValue('COMMITTED');
  return{id_tagihan:invoiceId,new_status:newStatus,jumlah_terbayar:nextPaid,sisa_hutang:nextRemain,idempotency_key:key,already_processed:false};
 }finally{lock.releaseLock();}
}
