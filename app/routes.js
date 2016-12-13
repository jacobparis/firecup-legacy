const cards = require('./controllers/cards.server.controller');
const games = require('./controllers/games.server.controller');

module.exports = function(app) {

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  app.route('/api/cards/:type')
    .get(cards.list)
    .post(cards.create);

  app.route('/api/decks/:deckId')
    .get(cards.shuffle)
    .get(cards.list)
    .post(cards.create);

  app.route('/api/players/:title')
    .post(games.addPlayer)
    .post(games.list);

  app.route('/api/games/:gameID?.:full?')
    .get(games.list)
    .post(games.create)
    .put(games.update);

  app.param('deckId', cards.getDeck);
  app.param('type', cards.getByType);
  app.param('gameID', games.getGame);

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
