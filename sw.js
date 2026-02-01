self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("outing-app").then(cache => {
            return cache.addAll([
                "./",
                "./index.html",
                "./script.js",
                "./data.js",
                "./manifest.json"
            ]);
        })
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
