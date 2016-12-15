require('../models/Game');
require('../models/Card');

const Game = require('mongoose')
.model('Game');
const Card = require('mongoose')
.model('Card');

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
exports.addPlayer = addPlayer;
exports.list = list;

function newGame(req, res, next) {
  console.log('NEW GAME');
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
  const settings = {
    mode: req.body.mode,
    turn: req.body.turn,
    totalTurns: 0,
    title: randomItem(adjectives) + '-' + randomItem(animals) + '-' + randomItem(places),
    eventDeck: []
  };

  Promise.all([
    Card.find({deck: 'event'}).lean().exec(),
    Card.find({deck: 'smite'}).lean().exec()
  ])
  .then(function(results) {
    settings.eventDeck = shuffle(results[0].slice(1), true);
    const game = new Game(settings);

    game.save(function(err) {
      if (err) {
        return next(err);
      }
      settings.smiteDeck = shuffle(results[1].slice(1));
      return res.json(settings);
    });
  })
  .catch(function(err) {
    console.log(err);
  });

}

function shuffle(deck, index = false) {
  let m = deck.length,
    t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = deck[m];
    deck[m] = deck[i];
    deck[i] = t;

    if(index) {deck[m].index = m;}
  }
  return deck;
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
      req.game = game;
      next();
    });
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
      // Grab smite deck and package
      Card.find({deck: 'smite'})
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
          'smiteDeck': shuffle(deck)
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
  res.json(req.game);
}

function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
