import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

const configPath='src/core/config.js';
const original=readFileSync(configPath,'utf8');
const fakeUrl='https://script.google.com/macros/s/SYNTHETIC_BROWSER_TEST/exec';
const patched=original.replace("apiEndpoint:''","apiEndpoint:'"+fakeUrl+"'").replace('readOnly:true','readOnly:false').replace('mutationsEnabled:false','mutationsEnabled:true').replace('financeEnabled:false','financeEnabled:true');
assert.notEqual(patched,original);
let server,browser;
const calls=[];
const customers=[{id:'CUS-SYNTH0001',nama:'Pelanggan Sintetis',paket:'10 Mbps',tarif:120000,status:'AKTIF'}];
const invoices=[{id:'INV-SYNTH0001',pelanggan:'CUS-SYNTH0001',periode:'202611',nominal:120000,status:'BELUM_BAYAR'}];
function reply(action,payload){
 calls.push({action,payload});
 switch(action){
  case 'request_otp':return{cooldown_seconds:60};
  case 'verify_otp':return{session_token:'STAGING_SYNTHETIC_TOKEN_ONLY',user:{role:'OWNER',nama:'Pemilik Simulasi'}};
  case 'get_dashboard_data':return{summary:{terkumpul:0,total_target:120000,persen:0},metrics:{belum_bayar:1,lunas:0,pelanggan:customers.length,jatuh_tempo:0}};
  case 'get_customers':return{items:customers,total:customers.length};
  case 'get_invoices':return{items:invoices,total:invoices.length};
  case 'save_customer':{
   const x={id:'CUS-SYNTH0002',nama:payload.nama,paket:payload.paket,tarif:payload.tarif,status:'AKTIF'};
   customers.push(x);return{id_pelanggan:x.id};
  }
  case 'create_invoice':{
   const x={id:'INV-SYNTH0002',pelanggan:payload.id_pelanggan,periode:payload.periode,nominal:150000,status:'BELUM_BAYAR'};
   invoices.push(x);return{id_tagihan:x.id};
  }
  case 'record_installment':invoices[0].status='CICIL';return{new_status:'CICIL',sisa_hutang:100000};
  case 'mark_as_paid':{const x=invoices.find(x=>x.id===payload.id_tagihan);if(x)x.status='LUNAS';return{new_status:'LUNAS'};}
  default:throw Error('Unexpected mock action '+action);
 }
}
async function main(){
 writeFileSync(configPath,patched);
 server=spawn('python3',['-m','http.server','8766','--bind','127.0.0.1'],{stdio:'ignore'});
 for(let i=0;i<40;i++){try{const r=await fetch('http://127.0.0.1:8766/');if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',d=>d.accept());
 await page.route(fakeUrl,async route=>{
  const req=route.request();
  assert.equal(req.method(),'POST');
  assert.match(req.headers()['content-type'],/text\/plain;charset=utf-8/);
  const input=JSON.parse(req.postData());
  assert.ok(input.action);
  if(!['request_otp','verify_otp'].includes(input.action))assert.equal(input.session_token,'STAGING_SYNTHETIC_TOKEN_ONLY');
  const data=reply(input.action,input.payload);
  await route.fulfill({status:200,headers:{'access-control-allow-origin':'*','content-type':'application/json'},body:JSON.stringify({status:'SUCCESS',code:200,message:'OK',data})});
 });
 await page.goto('http://127.0.0.1:8766/',{waitUntil:'networkidle'});
 await page.locator('#openLogin').click();
 await page.locator('#phone').fill('81200000000');
 await page.locator('#otpSend').click();
 await page.locator('#otp').fill('123456');
 await page.locator('#otpVerify').click();
 await page.locator('.featured-balance strong').filter({hasText:'Rp 0'}).waitFor();
 await page.locator('#mobileNav a[href="#pelanggan"]').click();
 await page.locator('button[data-command="customer"]').first().click();
 await page.locator('#opName').fill('Tester Kedua');
 await page.locator('#opPhone').fill('81200000001');
 await page.locator('#opAddress').fill('Jl Simulasi');
 await page.locator('#opPackage').fill('20 Mbps');
 await page.locator('#opPrice').fill('150000');
 await page.locator('#opDue').fill('10');
 await page.locator('#operationSubmit').click();
 await page.locator('#operationDialog').waitFor({state:'hidden'});
 assert.equal(customers.length,2);
 await page.locator('#mobileNav a[href="#tagihan"]').click();
 await page.locator('button[data-command="invoice"]').first().click();
 await page.locator('#opCustomer').selectOption('CUS-SYNTH0002');
 await page.locator('#opPeriod').fill('202611');
 await page.locator('#operationSubmit').click();
 await page.locator('#operationDialog').waitFor({state:'hidden'});
 assert.equal(invoices.length,2);
 await page.locator('[data-command="payment-part"]').first().click();
 await page.locator('#opAmount').fill('20000');
 await page.locator('#operationSubmit').click();
 await page.locator('#operationDialog').waitFor({state:'hidden'});
 assert.equal(invoices[0].status,'CICIL');
 await page.locator('[data-command="payment-full"]').first().click();
 await page.locator('#operationSubmit').click();
 await page.locator('#operationDialog').waitFor({state:'hidden'});
 assert.equal(invoices[0].status,'LUNAS');
 assert.equal(errors.length,0,'Browser errors: '+errors.join(';'));
 for(const action of ['save_customer','create_invoice','record_installment','mark_as_paid']){
  const x=calls.find(c=>c.action===action);
  assert.ok(x,action+' not invoked');
  assert.ok(/^[A-Za-z0-9_-]{12,80}$/.test(x.payload.idempotency_key),'Missing key for '+action);
 }
 mkdirSync('test-artifacts',{recursive:true});
 await page.screenshot({path:'test-artifacts/staging-owner-workflow-synthetic.png',fullPage:true});
 console.log('STAGING_BROWSER_FLOW_PASS: login, customer, invoice, installment and settlement using synthetic mocked API');
}
try{await main();}finally{
 if(browser)await browser.close();
 if(server)server.kill('SIGTERM');
 writeFileSync(configPath,original);
}
