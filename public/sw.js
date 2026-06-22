/* Service Worker de Brisa — solo Web Push (no cachea la app, así los deploys
   se reflejan de inmediato sin contenido viejo). */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Llega un push del servidor → mostrar notificación del sistema
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_e) {
    payload = { title: "Brisa", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Brisa";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-brisa.png",
    badge: "/icon-brisa.png",
    vibrate: [100, 50, 100],
    tag: payload.tag,
    data: { url: payload.url || "/notifications" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click en la notificación → enfocar/abrir la app en el link correspondiente
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/notifications";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
