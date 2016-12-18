require('../models/Game');
require('../models/Card');

const Game = require('mongoose')
.model('Game');
const Card = require('mongoose')
.model('Card');

exports.addPlayer = addPlayer;
exports.updatePlayer = updatePlayer;
exports.setTurn = setTurn;
exports.getRoom = getRoom;
exports.buildDeck = buildDeck;
exports.drawBurnCards = drawBurnCards;

function addPlayer(room, name, deviceToken) {
  console.log('Add Player named ' + name);

  const query = Game
  .where('title').equals(room)
  .select('players')
  .findOne()
  .then(function(game) {
    console.log('Found room: ' + room);
    return Game
    .findOneAndUpdate({
      $push: {
        players: {
          name: name,
          index: game.players.length,
          deviceToken: deviceToken
        }
      }
    })
    .select('players')
    .where('title').equals(room)
    .exec();
  });

  return query;
}

function updatePlayer(room, doc) {
  if(!room) {return Promise.reject();}
  if(!doc.hasOwnProperty('index')) {return Promise.reject();}

  console.log('Update Player in ' + room);

  const playerObject = Game
  .where('title').equals(room)
  .where('players.index').equals(doc.index)
  .select({
    'players': {
      $elemMatch: {
        'index': doc.index
      }
    },
    'eventDeck': 0,
    'burnDeck': 0,
    'totalTurns': 0,
    'turn': 0,
    'mode': 0,
    'createdAt': 0,
    '_id': 0
  });

  let query = playerObject;
  if(doc.name) {
    console.log('Set Name to ' + doc.name);
    query = Game
    .findOneAndUpdate({$set: {'players.$.name': doc.name}})
    .setOptions({
      'new': true
    })
    .merge(query);
  }

  if(doc.deviceToken) {
    console.log('Link player to ' + doc.deviceToken);
    query = Game
    .findOneAndUpdate({$set: {'players.$.deviceToken': doc.deviceToken}})
    .setOptions({
      'new': true
    })
    .merge(query);
  }

  if(doc.pushCard) {
    console.log('Give card to player #' + doc.index);
    query = Game
    .findOneAndUpdate({$push: {'players.$.hand': JSON.parse(doc.pushCard)}})
    .setOptions({
      'new': true
    })
    .merge(query);
  }

  if(doc.pullCard) {
    console.log('Discard from player #' + doc.index);
    query = Game
    .findOneAndUpdate({$pull: {'players.$.hand': {_id: doc.pullCard}}})
    .setOptions({
      'new': true
    })
    .merge(query);
  }

  return query
  .then(function(result) {
    return result;
  }, function(error) {
    console.log(error);
    return error;
  });
}

function setTurn(room, index) {
  if(!room) {return Promise.reject();}
  if(index == null) {return Promise.reject();} // eslint-disable-line

  console.log('Set turn to ' + index);

  return Game
  .where('title').equals(room)
  .select('turn totalTurns')
  .update({$inc: {'totalTurns': 1}, $set: {'turn': index}})
  .then(function() {
    return Game
    .where('title').equals(room)
    .select('totalTurns')
    .findOne()
    .exec();
  });
}

function getRoom(room) {
  console.log('Get Room: ' + room);
  if(!room) {return Promise.reject();}

  const loadGame = Game
  .where('title').equals(room)
  .findOne()
  .exec();

  return loadGame;
}

function buildDeck() {
  const burnCards = Card
  .where('deck').equals('burn')
  .find()
  .exec();

  return burnCards;
}

function drawBurnCards(room, players) {
  if(!room) {return Promise.reject();}

  return Game
  .where('title').equals(room)
  .select('burnDeck')
  .findOne()
  .then(function(game) {
    const cards = [];
    const deck = game.burnDeck;
    let newCard = {};
    for(let i = 0; i < players.length; i++) {
      newCard = deck.splice(0, 1)[0];
      newCard.player = players[i];
      cards.push(newCard);
      Game
      .where('title').equals(room)
      .select('burnDeck')
      .update({
        $pull: {
          'burnDeck': {
            _id: newCard._id
          }
        }
      })
      .exec();
    }

    return cards;
  });

}

function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
