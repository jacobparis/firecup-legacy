process.env.NODE_ENV = process.env.NODE_ENV || 'development';

let config = require('./config/config'),
  mongoose = require('./config/mongoose'),
  express = require('./config/express');

let db = mongoose(),
  app = express();
app.set('port', process.env.PORT || 443);
app.listen(app.get('port'));

const http = require('http');
http.createServer(function(req, res) {
  res.writeHead(301, { 'Location': 'https://' + req.headers.host + req.url });
  res.end();
}).listen(80);
module.exports = app;
console.log(process.env.NODE_ENV + ' server running at http://localhost:' + config.port);
