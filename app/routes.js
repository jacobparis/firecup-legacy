const cards = require('./controllers/cards.server.controller');
const games = require('./controllers/http.server.controller');
const Game = require('./controllers/socket.server.controller');

module.exports = function(app) {

  // server routes ===========================================================
  // handle things like api calls
  // authentication routes

  app.get('/api/cards/type/:type', cards.list);
  app.post('/api/cards/type/:type', cards.create);

  app.get('/api/decks/:deckId', cards.shuffle);
  app.get('/api/decks/:deckId', cards.list);
  app.post('/api/decks/:deckId', cards.create);

  app.post('/api/players/:title', games.list);

  app.get('/api/games/:gameID?', games.list);
  app.post('/api/games/:gameID?', games.create);

  app.param('deckId', cards.getDeck);
  app.param('type', cards.getByType);
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
        app.io.room(req.data.room).broadcast('player:updated', result.players[0]);
      }, function(error) {
        console.log(error);
      });
    },
    'ready': function(req) {
      Game.getRoom(req.data.room)
      .then(function(room) {
        req.io.respond(room);
      });
    },
    'burn': function(req) {
      Game.drawBurnCards(req.data.room, req.data.players)
      .then(function(cards) {
        Game.getRoom(req.data.room)
        .then(function(room) {
          app.io.room(req.data.room).broadcast('player:burned', {
            cards: cards,
            players: room.players
          });

        });
      });
      // Insert list of cards and players here
    }
  });

  app.io.route('turn', {
    'set': function(req) {
      console.log('Change turn in ' + req.data.room);
      Game.setTurn(req.data.room, req.data.index)
      .then(function(data) {
        app.io.room(req.data.room).broadcast('turn:changed', {
          turn: req.data.index,
          totalTurns: data.totalTurns
        });
      });
    }
  });

  app.io.route('feedback', {
    'submit': function(req) {
      Game.saveFeedback(req.data);
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
  app.get('/welcome*', function(req, res) {
    res.sendfile('./public/app.html');
  });

  app.get('/game/*', function(req, res) {
    res.sendfile('./public/app.html');
  });

  app.get('/list/*', function(req, res) {
    res.sendfile('./public/app.html');
  });

  app.get('/nsfw*', function(req, res) {
    res.sendfile('./public/nsfw.html');
  });

  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });
};
