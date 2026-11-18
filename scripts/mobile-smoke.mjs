import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
async function waitServer(){for(let i=0;i<40;i++){try{const r=await fetch('http://127.0.0.1:8765/');if(r.ok)return;}catch{}await sleep(250);}throw Error('HTTP test server unavailable');}
const allRoutes=['beranda','tagihan','pelanggan','kas','menu','pembayaran','detail-pelanggan','detail-tagihan','penagih','mikrotik','audit','pengaturan','portal'];
try{
 await waitServer();browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox']});
 mkdirSync('test-artifacts',{recursive:true});
 for(const width of [360,390,412,768,1280]){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  await page.locator('.featured-balance').waitFor();
  assert.equal(await page.locator('#pageTitle').textContent(),'Beranda');
  assert.equal(await page.locator('.kpi').count(),4);
  assert.equal(await page.locator('.quick-action').count(),4);
  assert.equal(await page.locator('.quick-action:not([disabled])').count(),0);
  assert.equal(await page.locator('#operationSubmit:not([disabled])').count(),0);
  assert.equal(await page.locator('#operationDialog').evaluate(d=>d.open),false);
  if(width<=760)assert.equal(await page.locator('.mobile-nav a:visible').count(),5);
  else assert.equal(await page.locator('.sidebar a[data-route]:visible').count(),5);
  const measure=async label=>{const x=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));assert.ok(x.scroll<=x.inner+1,label+' overflow '+width+': '+JSON.stringify(x));};
  await measure('home');
  await page.locator('[data-filter="cicil"]').click();
  assert.equal(await page.locator('[data-filter="cicil"]').getAttribute('aria-pressed'),'true');
  await page.locator('#openLogin').click();
  assert.equal(await page.locator('#loginDialog').evaluate(d=>d.open),true);
  assert.equal(await page.locator('#loginDialog input:not([disabled])').count(),0);
  await page.locator('#closeLogin').click();
  assert.equal(await page.locator('#loginDialog').evaluate(d=>d.open),false);
  await page.screenshot({path:'test-artifacts/tmfiber-'+width+'px.png',fullPage:true});
  for(const route of allRoutes){
   await page.goto('http://127.0.0.1:8765/#'+route,{waitUntil:'networkidle'});
   await page.locator('#pageTitle').waitFor();
   await page.waitForFunction((id)=>{const names={'beranda':'Beranda','tagihan':'Tagihan','pelanggan':'Pelanggan','kas':'Kas & Setoran','menu':'Menu','pembayaran':'Pembayaran','detail-pelanggan':'Detail Pelanggan','detail-tagihan':'Detail Tagihan','penagih':'Tugas Penagihan','mikrotik':'Panel Teknisi','audit':'Riwayat Sistem','pengaturan':'Pengaturan','portal':'Cek Tagihan'};return document.getElementById('pageTitle')?.textContent===names[id]},route);
   await measure(route);
   if(width===390)await page.screenshot({path:'test-artifacts/390-'+route+'.png',fullPage:true});
  }
  await page.goto('http://127.0.0.1:8765/#menu',{waitUntil:'networkidle'});
  await page.locator('.menu-tile[href="#mikrotik"]').waitFor();
  assert.equal(await page.locator('.menu-tile[href="#audit"]').count(),1);
  assert.equal(errors.length,0,'Browser errors: '+errors.join('; '));
  console.log('MOBILE_LAYOUT_PASS',width,'routes',allRoutes.length,'overflow none');
  await page.close();
 }
}finally{if(browser)await browser.close();server.kill('SIGTERM');}
