self.oninstall = () => self.skipWaiting();

self.onfetch = event => {
  event.respondWith(fetch(event.request));
};