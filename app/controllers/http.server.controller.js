require('../models/Game');
require('../models/Card');
require('../models/Player');
const Socket = require('./socket.server.controller');
const _ = {
  map: require('lodash').map,
  sample: require('lodash').sample
};
const Game = require('mongoose')
.model('Game');
const Card = require('mongoose')
.model('Card');
const Player = require('mongoose').model('Player');

exports.create = newGame;
exports.getRoom = getRoom;
exports.list = list;

function newGame(req, res, next) {
  const adjectives = ['active', 'basic', 'blue', 'calm', 'dark', 'eerie', 'fancy', 'giant', 'green', 'happy', 'icy', 'juicy', 'kind', 'large', 'magic', 'mystic', 'neon', 'nifty', 'odd', 'perky', 'quiet', 'red', 'royal', 'scary', 'tiny', 'urban', 'vast', 'warm', 'young', 'zesty'];

  const animals = ['ape', 'beagle', 'cat', 'dog', 'eagle', 'falcon', 'gorilla', 'hamster', 'insect', 'jellyfish', 'koala', 'lobster', 'moose', 'nest', 'owl', 'panda', 'quail', 'rabbit', 'snail', 'tuna', 'viper', 'walrus', 'yak', 'zebra'];

  const places = ['arena', 'alley', 'barn', 'cabin', 'cafe', 'dock', 'farm', 'gym', 'house', 'igloo', 'jail', 'library', 'museum', 'outhouse', 'palace', 'ranch', 'school', 'tent', 'university', 'vault', 'warehouse'];

  const title = _.sample(adjectives) + '-' + _.sample(animals) + '-' + _.sample(places);
  console.log('NEW GAME: ' + title);
  console.log(req.body);
  const settings = {
    settings: req.body.settings,
    turn: -1,
    totalTurns: 0,
    title: title,
  };

  settings.turn = req.body.settings.takeTurns ? 0 : -1;
  const decks = _.map(req.body.settings.decks, function(deck) {
    return Socket.buildADeck(deck, req.body.theme, deck.len);
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

function getRoom(req, res, next, room) {
  console.log('GET Room: ' + room);
  if(!room) {return Promise.reject();}

  return Game
  .where('title').equals(room)
  .findOne()
  .then(function(game) {
    req.data = game;
    next();
  });
}

function list(req, res) {
  res.json(req.data);
}

function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
