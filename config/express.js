let config = require('./config'),
  express = require('express'),
  bodyParser = require('body-parser');

const methodOverride = require('method-override');
module.exports = function() {
  const app = express();
  app.use(express.static('./public'));
  app.set('x-powered-by', false);
  // get all data/stuff of the body (POST) parameters
  app.use(bodyParser.json()); // parse application/json
  app.use(bodyParser.json({
    type: 'application/vnd.api+json'
  })); // parse application/vnd.api+json as json
  app.use(bodyParser.urlencoded({
    extended: true
  })); // parse application/x-www-form-urlencoded

  app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT

  // routes ==================================================
  require('../app/routes')(app); // pass our application into our routes

  return app;
};
