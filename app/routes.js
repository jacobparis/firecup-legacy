var cards = require('./controllers/cards.server.controller');

module.exports = function(app) {

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  app.route('/api/cards/')
    .post(cards.create);

  app.route('/api/decks/:deckId')
    .get(cards.shuffle)
    .get(cards.list)
    .post(cards.create);

  app.param('deckId', cards.getDeck);
  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('/', function(req, res) {
    res.sendfile('./public/index.html');
  });

  app.get('/cards', function(req, res) {
    res.sendfile('./public/index.html');
  });

  app.get('/game', function(req, res) {
    res.sendfile('./public/index.html');
  });
};
