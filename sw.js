"use strict";
// Only public application assets are cached. Never store API data, sessions, financial or customer records.
const CACHE="tmfiber-public-shell-v9";
const PUBLIC_FILES=["./","./index.html","./styles.css","./src/app.js","./src/core/config.js","./src/core/api.js","./src/core/navigation.js","./src/views/screens.js","./assets/icon.svg","./manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PUBLIC_FILES)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("tmfiber-public-shell-")&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",e=>{
 const req=e.request,url=new URL(req.url),base=new URL(self.registration.scope);
 if(req.method!=="GET"||url.origin!==self.location.origin||!url.pathname.startsWith(base.pathname))return;
 const path=url.pathname.slice(base.pathname.length);
 const allowed=new Set(["","index.html","styles.css","src/app.js","src/core/config.js","src/core/api.js","src/core/navigation.js","src/views/screens.js","assets/icon.svg","manifest.webmanifest"]);
 if(!allowed.has(path)||url.search)return;
 e.respondWith((async()=>{
  try{const res=await fetch(req);if(res.ok){const cache=await caches.open(CACHE);await cache.put(req,res.clone());}return res;}
  catch{const cache=await caches.open(CACHE);const cached=await cache.match(req,{ignoreSearch:false});if(cached)return cached;if(req.mode==="navigate")return(await cache.match("./index.html"))||Response.error();return Response.error();}
 })());
});
