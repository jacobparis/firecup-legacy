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
  const alphabet = 'ABCDEFGHIJKLMNPQRSTUVWXYZ12346789';
  const title = Array.apply(null, {length: 4}).map(function() { return alphabet.charAt(Math.floor(Math.random() * alphabet.length)); }).join('');
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
