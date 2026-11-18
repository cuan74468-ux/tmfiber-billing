/**
 * Run TMFIBER_STAGING_PREFLIGHT in the separate Apps Script editor, never production.
 * Read-only; reports booleans and counts, not secrets or personal data.
 */
function TMFIBER_STAGING_PREFLIGHT(){
 var p=PropertiesService.getScriptProperties();
 var flags={
  environment:p.getProperty('TM_ENVIRONMENT'),
  reads:p.getProperty('TM_READS_ENABLED')==='true',
  dryRun:p.getProperty('TM_DRY_RUN')==='true',
  mutation:p.getProperty('TM_MUTATIONS_ENABLED')==='true',
  autoPayment:p.getProperty('TM_AUTO_PAYMENTS_ENABLED')==='true',
  providerConfigured:!!p.getProperty('TM_FONNTE_TOKEN'),
  sessionSecretConfigured:!!p.getProperty('TM_SESSION_SECRET'),
  otpSecretConfigured:!!p.getProperty('TM_OTP_SECRET')
 };
 if(flags.environment!=='STAGING'||!flags.reads||!flags.dryRun||flags.autoPayment)throw Error('PREFLIGHT_BLOCKED: STAGING flags invalid.');
 var db=SpreadsheetApp.openById(p.getProperty('TM_SPREADSHEET_ID'));
 if(!/STAGING/i.test(db.getName())||/PRODUCTION/i.test(db.getName()))throw Error('PREFLIGHT_BLOCKED: not isolated STAGING database');
 var required={
  Pelanggan:['ID_Pelanggan','Nama','No_WA','Tarif','Jatuh_Tempo'],
  Tagihan:['ID_Tagihan','ID_Pelanggan','Status_Bayar','jumlah_terbayar','sisa_hutang'],
  Kas_Operasional:['ID_Transaksi','Nominal','Idempotency_Key'],
  Users_Admin:['No_WA','Role','Aktif'],
  Audit_Log:['prev_hash','row_hash'],
  Settings:['Parameter','Nilai'],
  Pembayaran_Ledger:['ID_Ledger','Status','Request_Hash'],
  Operasi_Ledger:['ID_Operasi','Status','Request_Hash']
 };
 var schema={};var unresolved=0;
 Object.keys(required).forEach(function(name){
  var sh=db.getSheetByName(name);if(!sh)throw Error('PREFLIGHT_BLOCKED: missing tab '+name);
  var columns=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(function(v){return String(v).trim();});
  required[name].forEach(function(c){if(columns.indexOf(c)<0)throw Error('PREFLIGHT_BLOCKED: missing column '+name+'.'+c);});
  schema[name]=true;
  if(name==='Pembayaran_Ledger'||name==='Operasi_Ledger'){
   var index=columns.indexOf('Status'),values=sh.getDataRange().getValues();
   for(var i=1;i<values.length;i++)if(String(values[i][index])==='PENDING')unresolved++;
  }
 });
 var result={ok:unresolved===0,environment:'STAGING',tabs:Object.keys(schema).length,unresolvedPending:unresolved,flags:flags};
 Logger.log('TMFIBER_STAGING_PREFLIGHT '+JSON.stringify(result));
 return result;
}
