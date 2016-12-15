const cards = require('./controllers/cards.server.controller');
const games = require('./controllers/games.server.controller');
const Game = require('./controllers/game.server.controller');

module.exports = function(app) {

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  app.get('/api/cards/:type', cards.list);
  app.post('/api/cards/:type', cards.create);

  app.get('/api/decks/:deckId', cards.shuffle);
  app.get('/api/decks/:deckId', cards.list);
  app.post('/api/decks/:deckId', cards.create);

  app.post('/api/players/:title', games.addPlayer);
  app.post('/api/players/:title', games.list);

  app.get('/api/games/:gameID?.:full?', games.list);
  app.post('/api/games/:gameID?.:full?', games.create);
  app.put('/api/games/:gameID?.:full?', games.update);

  app.param('deckId', cards.getDeck);
  app.param('type', cards.getByType);
  app.param('gameID', games.getGame);

  app.io.route('client:join', function(req) {
    console.log(req.data);
    req.io.join(req.data.room);
    req.io.room(req.data.room).broadcast('client:joined');
  });

  app.io.route('player', {
    'add': function(req) {
      Game.addPlayer(req.data.room, req.data.name, req.data.deviceToken)
      .then(function() {
        app.io.room(req.data.room).broadcast('player:added', {
          name: req.data.name,
          deviceToken: req.data.deviceToken
        });
      });
    },
    'update': function(req) {
      Game.updatePlayer(req.data.room, req.data.player)
      .then(function() {
        app.io.room(req.data.room).broadcast('player:updated', req.data.player);
      });
    }
  });

  app.io.route('user:join', function(req) {
    req.io.broadcast('user:joined');
  });

  app.use(errorHandler);

  function errorHandler(err, req, res, next) {
    console.error(err.stack);
    if (res.headersSent) {
      console.log('headers sent');
      return next(err);
    }
    console.log('headers not sent');
    next();
  }
  // frontend routes =========================================================
  // route to handle all angular requests

  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });

};
