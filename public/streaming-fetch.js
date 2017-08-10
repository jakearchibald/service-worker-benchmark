self.oninstall = () => self.skipWaiting();

self.onfetch = event => {
  if (!event.request.url.endsWith('.png')) return;

  let doneResolve;
  const done = new Promise(r => doneResolve = r);

  event.waitUntil(doneResolve);

  event.respondWith(async function() {
    let reader;

    const stream = new ReadableStream({
      async start() {
        const response = await fetch(event.request);
        reader = response.body.getReader();
      },
      async pull(controller) {
        const {done, value} = await reader.read();
        if (done) {
          console.log('done');
          doneResolve();
          controller.close();
        }
        else {
          controller.enqueue(value);
        }
      },
      cancel() {
        console.log('done');
        doneResolve();
        reader.cancel();
      }
    });

    return new Response(stream, {
      headers: {'Content-Type': 'image/png'}
    });
  }());
};
