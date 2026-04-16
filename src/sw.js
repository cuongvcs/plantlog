const CACHE='pl4';const A=['./'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(A)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{if(e.request.url.includes('script.google.com'))return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
