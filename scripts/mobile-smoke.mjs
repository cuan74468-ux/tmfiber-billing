import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const server = spawn("python3", ["-m", "http.server", "8765", "--bind", "127.0.0.1"], { stdio: "ignore" });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;
async function waitServer() {
  for(let i=0;i<40;i++){
    try { const r=await fetch("http://127.0.0.1:8765/"); if(r.ok)return; }catch {}
    await sleep(250);
  }
  throw new Error("HTTP test server unavailable");
}
try {
  await waitServer();
  browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||"/usr/bin/google-chrome",args:["--no-sandbox"]});
  mkdirSync("test-artifacts",{recursive:true});
  for(const width of [360,390,412,1280]){
    const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
    const exceptions=[];
    page.on("pageerror",err=>exceptions.push(err.message));
    await page.goto("http://127.0.0.1:8765/",{waitUntil:"networkidle"});
    await page.locator(".balance").waitFor();
    assert.equal(await page.locator("#pageTitle").textContent(),"Halo, TMfiber!");
    assert.equal(await page.locator(".quick-action").count(),4);
    assert.equal(await page.locator(".quick-action:not([disabled])").count(),0);
    const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
    assert.ok(overflow.scroll<=overflow.inner+1,"Horizontal overflow at "+width+"px: "+JSON.stringify(overflow));
    if(width<761){
      assert.equal(await page.locator(".mobile-nav a:visible").count(),5);
      assert.equal(await page.locator('.mobile-nav [href="#mikrotik"]').count(),0);
      await page.locator('.mobile-nav [href="#menu"]').click();
    }else{
      await page.goto("http://127.0.0.1:8765/#menu",{waitUntil:"networkidle"});
    }
    assert.equal(await page.locator('.menu-tile[href="#mikrotik"]').count(),1);
    assert.equal(await page.locator('.menu-tile[href="#audit"]').count(),1);
    await page.locator("#openLogin").click();
    assert.equal(await page.locator("#loginDialog").evaluate(el=>el.open),true);
    assert.equal(await page.locator('#loginDialog input:not([disabled])').count(),0);
    await page.locator("#closeLogin").click();
    assert.equal(await page.locator("#loginDialog").evaluate(el=>el.open),false);
    await page.goto("http://127.0.0.1:8765/#beranda",{waitUntil:"networkidle"});
    await page.locator('[data-filter="lunas"]').click();
    assert.equal(await page.locator('[data-filter="lunas"]').getAttribute('aria-pressed'),'true');
    assert.equal(exceptions.length,0,"Browser JS errors: "+exceptions.join("; "));
    await page.screenshot({path:"test-artifacts/tmfiber-"+width+"px.png",fullPage:true});
    console.log("MOBILE_LAYOUT_PASS",width,overflow);
    await page.close();
  }
} finally {
  if(browser)await browser.close();
  server.kill("SIGTERM");
}
