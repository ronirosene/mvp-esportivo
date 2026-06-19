const CACHE_NAME = 'MVP_CACHE_v2';
const STATIC_CACHE = 'MVP_STATIC_v2';
const API_CACHE = 'MVP_API_v2';

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/eventos',
  '/agenda',
  '/historico',
  '/cidades',
  '/ranking',
  '/manifest.json',
  '/icon.svg',
];

const API_PATTERNS = [
  '/api/events',
  '/api/public/schedule',
  '/api/public/ranking',
  '/api/public/cities',
  '/api/public/champions',
  '/api/sports',
  '/api/cities',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isApiRequest(url) {
  const path = new URL(url).pathname;
  return API_PATTERNS.some((pattern) => path.startsWith(pattern));
}

function isPageRequest(url) {
  const path = new URL(url).pathname;
  return (
    path === '/' ||
    path === '/offline' ||
    path.startsWith('/eventos') ||
    path.startsWith('/agenda') ||
    path.startsWith('/historico') ||
    path.startsWith('/cidades') ||
    path.startsWith('/ranking') ||
    path.startsWith('/org/')
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (isApiRequest(request.url)) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  if (isPageRequest(request.url)) {
    event.respondWith(networkFirstWithPageFallback(request));
    return;
  }

  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font' || request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirstWithCache(request, CACHE_NAME));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function networkFirstWithPageFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlinePage = await caches.match('/offline');
    if (offlinePage) return offlinePage;
    return new Response('Sem conexão com a internet.', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
