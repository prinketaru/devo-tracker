const CACHE_NAME = "devo-tracker-v3";

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/android-chrome-192x192.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS.map((u) => self.location.origin + u))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        if (response.status === 200 && response.type === "basic") {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((r) => r || caches.match("/")))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;
  if (!event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request).catch(() => new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }))
  );
}, { capture: true });

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = { title: "DayMark", body: "Time for your devotion." };
  try {
    payload = event.data.json();
  } catch {
    payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "DayMark", {
      body: payload.body,
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: "devo-reminder",
      data: { url: payload.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      if (clientList.length) {
        clientList[0].focus();
        clientList[0].navigate(self.location.origin + url);
      } else if (self.clients.openWindow) {
        self.clients.openWindow(self.location.origin + url);
      }
    })
  );
});
