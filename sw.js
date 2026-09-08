// Service worker with smarter caching
const CACHE_NAME = 'deflitsbus-v2';
const ASSET_CACHE_PATTERN = /\/assets\//;
const IMAGE_CACHE_PATTERN = /\.(?:png|jpg|jpeg|webp|gif|svg)$/i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // Handle Vite assets (hashed CSS/JS)
  if (ASSET_CACHE_PATTERN.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Handle images with cache-first but limit size
  if (IMAGE_CACHE_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirstWithLimit(req, 50)); // max 50 images
    return;
  }

  // HTML pages
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Fonts, icons etc.
  event.respondWith(cacheFirst(req));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((res) => {
      if (res && res.status === 200) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || networkPromise;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && res.status === 200) cache.put(request, res.clone());
  return res;
}

// Cache-first but keep cache small
async function cacheFirstWithLimit(request, maxItems) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const res = await fetch(request);
  if (res && res.status === 200) {
    await cache.put(request, res.clone());

    // Cleanup if too many images
    const keys = await cache.keys();
    const imageKeys = keys.filter((k) => IMAGE_CACHE_PATTERN.test(new URL(k.url).pathname));
    if (imageKeys.length > maxItems) {
      await cache.delete(imageKeys[0]); // delete oldest
    }
  }
  return res;
}