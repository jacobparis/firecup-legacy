let config = require('./config'),
  express = require('express.io'),
  bodyParser = require('body-parser');

const methodOverride = require('method-override');
module.exports = function() {
  const app = express();
  app.http().io();

  app.use('/.well-known', express.static('./.well-known'));
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

  app.use(function forceLiveDomain(req, res, next) {
    const host = req.get('Host');
    if (host === 'cardsaround.com' || host === 'wizzymails.com') {
      return res.redirect(301, 'http://firecup.ca/' + req.originalUrl);
    }
    return next();
  });
  // routes ==================================================
  require('../app/routes')(app); // pass our application into our routes

  return app;
};
