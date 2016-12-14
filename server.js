process.env.NODE_ENV = process.env.NODE_ENV || 'development';

let config = require('./config/config'),
  mongoose = require('./config/mongoose'),
  express = require('./config/express');

let db = mongoose(),
  app = express();
app.set('port', process.env.PORT || 80);
app.listen(app.get('port'));

module.exports = app;
console.log(process.env.NODE_ENV + ' server running at http://localhost:' + config.port);
