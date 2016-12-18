const cards = require('./controllers/cards.server.controller');
const games = require('./controllers/http.server.controller');
const Game = require('./controllers/socket.server.controller');

module.exports = function(app) {

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  app.get('/api/cards/type/:type', cards.list);
  app.post('/api/cards/type/:type', cards.create);

  app.get('/api/cards/deck/:deck', cards.list);

  app.get('/api/decks/:deckId', cards.shuffle);
  app.get('/api/decks/:deckId', cards.list);
  app.post('/api/decks/:deckId', cards.create);

  app.post('/api/players/:title', games.addPlayer);
  app.post('/api/players/:title', games.list);

  app.get('/api/games/:gameID?', games.list);
  app.post('/api/games/:gameID?', games.create);

  app.param('deckId', cards.getDeck);
  app.param('type', cards.getByType);
  app.param('deck', games.buildBurnDeck);
  app.param('gameID', games.getRoom);

  app.io.route('client:join', function(req) {
    console.log('Client join room ' + req.data.room);
    console.log(req.data);
    req.io.join(req.data.room);
    req.io.room(req.data.room).broadcast('client:joined');
    req.io.respond(true);
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
      .then(function(result) {
        console.log('THEN');
        console.log(result);
        app.io.room(req.data.room).broadcast('player:updated', result.players[0]);
      }, function(error) {
        console.log(error);
      });
    },
    'ready': function(req) {
      Game.getRoom(req.data.room)
      .then(function(room) {
        Game.buildDeck()
        .then(function(deck) {
          room.burnDeck = deck;
          req.io.respond(room);
        });
      });
    },
    'burn': function(req) {
      Game.drawBurnCards(req.data.room, req.data.players)
      .then(function(cards) {
        console.log(cards);

        app.io.room(req.data.room).broadcast('player:burned', cards);
      });
      // Insert list of cards and players here
    }
  });

  app.io.route('turn', {
    'set': function(req) {
      console.log('Begin set turn');
      console.log(req.data.room);
      console.log(req.data.index);
      Game.setTurn(req.data.room, req.data.index)
      .then(function(data) {
        console.log('Turn set, sending callback');
        console.log(data);
        app.io.room(req.data.room).broadcast('turn:changed', {
          turn: req.data.index,
          totalTurns: data.totalTurns
        });
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
