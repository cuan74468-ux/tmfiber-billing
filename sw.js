"use strict";
// Offline cache contains ONLY the static, public application shell.
// Do not add API responses, customer records, login sessions, user-generated images, or authenticated pages.
const CACHE="tmfiber-public-shell-v2";
const PUBLIC_FILES=["./","./index.html","./styles.css","./src/app.js","./assets/icon.svg","./manifest.webmanifest"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PUBLIC_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("tmfiber-public-shell-")&&key!==CACHE).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
  const url=new URL(req.url);
  const base=new URL(self.registration.scope);
  if(!url.pathname.startsWith(base.pathname))return;
  const path=url.pathname.slice(base.pathname.length);
  const allowed=new Set(["","index.html","styles.css","src/app.js","assets/icon.svg","manifest.webmanifest"]);
  if(!allowed.has(path)||url.search)return;
  event.respondWith((async()=>{
    try{
      const response=await fetch(req);
      if(response.ok){
        const cache=await caches.open(CACHE);
        await cache.put(req,response.clone());
      }
      return response;
    }catch(error){
      const cache=await caches.open(CACHE);
      const cached=await cache.match(req,{ignoreSearch:false});
      if(cached)return cached;
      if(req.mode==="navigate"){
        const fallback=await cache.match("./index.html");
        if(fallback)return fallback;
      }
      return Response.error();
    }
  })());
});
