#!/usr/bin/env node
'use strict';

const argv = require('minimist')(process.argv.slice(2), {
  default: {port: 8000}
});

if (argv.help) {
  console.log(
`./server.js

Options:
  --port     Port number (default: 8000)
  --http2    Use HTTP2 server (HTTPS)
  --max-age  Set a max-age on all resources in ms (default: 0)
  --no-store Set no-store on all resources
`
  )
  process.exit();
}

const fs = require('fs');
const connect = require('connect');
const morgan = require('morgan');
const serveIndex = require('serve-index');
const serveStatic = require('serve-static');

const app = connect();

app.use(morgan('dev'));

const staticOpts = {
  maxAge: argv['max-age'] || 0
};

if (argv['no-store']) {
  staticOpts.setHeaders = res => res.setHeader('Cache-Control', 'no-store');
}

app.use('/', serveStatic('public', staticOpts));
app.use('/', serveIndex('public', {icons: true}));

const server = (() => {
  if (argv.http2) {
    return require('http2').createServer({
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./certificate.pem')
    }, app);
  }
  return require('http').createServer(app);
})();


server.listen(argv.port, () => {
  console.log(`Listening on port ${argv.port}!`);
});
