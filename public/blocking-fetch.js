self.oninstall = () => self.skipWaiting();

self.onfetch = event => {
  const now = Date.now();
  while (Date.now() - now < 20);
  event.respondWith(fetch(event.request));
};