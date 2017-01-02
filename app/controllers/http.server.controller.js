require('../models/Game');
require('../models/Card');
require('../models/Player');
require('../../node_modules/lodash/lodash');
const Socket = require('./socket.server.controller');
const _ = require('lodash');
const Game = require('mongoose')
.model('Game');
const Card = require('mongoose')
.model('Card');
const Player = require('mongoose').model('Player');

const getErrorMessage = function(err) {
  if (err.errors) {
    for (const errName in err.errors) {
      if (err.errors[errName].message) {return err.errors[errName].message;}
    }
  }
  else {
    return 'Unknown server error';
  }
};

exports.create = newGame;
exports.update = update;
exports.getGame = getGame;
exports.getRoom = getRoom;
exports.buildBurnDeck = buildBurnDeck;
exports.addPlayer = addPlayer;
exports.list = list;

function newGame(req, res, next) {
  const adjectives = ['active', 'basic', 'calm', 'dark', 'eerie', 'fancy',
    'giant', 'happy', 'icy', 'juicy', 'kind', 'large', 'magic', 'nifty', 'odd',
    'perky', 'quiet', 'royal', 'scary', 'tiny', 'urban', 'vast', 'warm', 'young', 'zesty'];

  const animals = ['ape', 'beagle', 'cat', 'dog', 'eagle', 'falcon', 'gorilla', 'hamster',
    'insect', 'jellyfish', 'koala', 'lobster', 'moose', 'nest', 'owl', 'panda', 'quail',
    'rabbit', 'snail', 'tuna', 'viper', 'walrus', 'yak', 'zebra'];

  const places = ['arena', 'alley', 'barn', 'cabin', 'cafe', 'dock', 'farm', 'gym', 'house', 'igloo',
    'jail', 'library', 'museum', 'outhouse', 'palace', 'ranch', 'school', 'tent',
    'university', 'vault', 'warehouse'];

  const randomItem = function(array) {
    return array[Math.floor(Math.random() * array.length)];
  };
  const title = randomItem(adjectives) + '-' + randomItem(animals) + '-' + randomItem(places);
  console.log('NEW GAME: ' + title);
  console.log(req.body.settings);
  const settings = {
    settings: req.body.settings,
    turn: -1,
    totalTurns: 0,
    title: title,
  };

  settings.turn = req.body.settings.takeTurns ? 0 : -1;
  const decks = [];
  _.each(req.body.settings.decks, function(deck) {
    decks.push(Socket.buildADeck(deck));
  });

  Promise.all(decks)
  .then(function(results) {
    // TODO Dynamify results array to be based on settings
    settings.eventDeck = results[0];
    if(results.length > 1) {
      settings.burnDeck = results[1];
    }
    const game = new Game(settings);

    game.save(function(err) {
      if (err) {
        return next(err);
      }
      return res.json(settings);
    });
  })
  .catch(function(err) {
    console.log(err);
  });

}

function addPlayer(req, res, next) {
  console.log('ADD PLAYER');
  const player = req.body;
  console.log(player);
  console.log(req.params.title);
  Game.findOne({
    title: req.params.title
  })
  .exec()
  .then(function(game) {
    player.index = game.players.length;
    console.log(player);
    return Game.update({
      title: req.params.title
    }, {
      $push: {
        players: player
      }
    }).exec(function(err, game) {
      if (err) {
        return next(err);
      }

      if (!game) {
        return next(new Error('Failed to save player to ' + title));
      }
      req.data = game;
      next();
    });
  });
}

function getRoom(req, res, next, room) {
  console.log('GET Room: ' + room);
  if(!room) {return Promise.reject();}

  Game
  .where('title').equals(room)
  .findOne()
  .then(function(game) {
    req.data = game;
    next();
  });
}

function buildBurnDeck(req, res, next) {
  Card
  .where('deck').equals('burn')
  .findOne()
  .then(function(deck) {
    req.data = deck;
    next();
  });
}

function getGame(req, res, next, title) {
  console.log('GET GAME');
  Game.findOne({
    title: title
  })
  .exec()
  .then(function(game) {
    if (!game) {
      return next(new Error('Failed to load game ' + title));
    }
    console.log(req.params);
    if(Number(req.params.full)) {
      // Grab Burn deck and package
      Card.find({deck: 'Burn'})
      .lean()
      .exec()
      .then(function(deck) {
        req.game = {
          'mode': game.mode,
          'turn': game.turn,
          'totalTurns': game.totalTurns,
          'title': game.title,
          'eventDeck': game.eventDeck,
          'players': game.players,
          'burnDeck': shuffle(deck)
        };
        next();
      });
    }
    else if(req.query) {
      game.eventDeck = undefined;
      game.players = undefined;
      req.game = game;
      next();
    }
    else {
      req.game = game;
      next();
    }

  });
}

function updatePlayer(req, res, next) {
  if(!req.params) {next();}
  if(!req.query) {next();}

  Game.findOne({
    title: req.params.title
  })
  .exec()
  .then(function(game) {
    player.index = game.players.length;
    console.log(player);
    console.log(game);
    if(req.query.name) {

    }
    return Game.update({
      title: req.params.title
    }, {
      $push: {
        players: player
      }
    }).exec(function(err, game) {
      if (err) {
        return next(err);
      }

      if (!game) {
        return next(new Error('Failed to save player to ' + title));
      }
      req.game = game;
      next();
    });
  });

}
function update(req, res, next) {
  if(!req.params) {next();}
  if(!req.query) {next();}

  if(req.query.turn) {
    // Change turn
    Game.update({
      title: req.params.gameID
    }, {
      $set: {
        turn: req.query.turn
      },
      $inc: {
        totalTurns: 1
      }
    })
      .exec()
    .then(function(game) {

      return res.json(req.query);
    });
  }

  if(req.query.hand) {
    console.log('ENTER');
    console.log(req.params);
    console.log(req.query);
    console.log(req.body);
    Game.update({
      'title': req.params.gameID,
      'players.index': Number(req.query.hand)
    }, {
      $push: {
        'players.$.hand': req.body
      }
    })
    .exec()
    .then(function() {
      return res.json(req.query);
    });
  }

  if(req.query.setName) {
    console.log('ENTER');
    console.log(req.params);
    console.log(req.query);
    console.log(req.body);
    Game.update({
      'title': req.params.gameID,
      'players.index': Number(req.query.player)
    }, {
      $set: {
        'players.$.name': req.body.name
      }
    })
    .exec()
    .then(function() {
      return res.json(req.query);
    });
  }

  if(req.query.link) {
    console.log('ENTER');
    console.log(req.params);
    console.log(req.query);
    console.log(req.body);
    Game.update({
      'title': req.params.gameID,
      'players.index': Number(req.query.player)
    }, {
      $set: {
        'players.$.deviceToken': req.body.deviceToken
      }
    })
    .exec()
    .then(function() {
      return res.json(req.query);
    });
  }

}

function list(req, res, next) {
  res.json(req.data);
}

function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
