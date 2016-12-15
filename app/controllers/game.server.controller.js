require('../models/Game');
require('../models/Card');

const Game = require('mongoose')
.model('Game');
const Card = require('mongoose')
.model('Card');

exports.addPlayer = addPlayer;
exports.updatePlayer = updatePlayer;

function addPlayer(room, name, deviceToken) {
  console.log('ADD PLAYER');

  const query = Game
  .where('title').equals(room)
  .select('players')
  .findOne()
  .then(function(game) {
    console.log('FOUND ROOM');
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
  console.log(doc);
  if(!room) {return Promise.reject();}
  if(!doc.hasOwnProperty('index')) {return Promise.reject();}

  console.log('Update Player');

  const playerObject = Game
  .where('title').equals(room)
  .where('players.index').equals(doc.index)
  .select('players');

  let query = playerObject;
  if(doc.name) {
    console.log('Set Name to ' + doc.name);
    query = Game
    .update({'players.$.name': doc.name})
    .merge(query);
  }

  if(doc.deviceToken) {
    console.log('Link player to ' + doc.deviceToken);
    query = Game
    .update({'players.$.deviceToken': doc.deviceToken})
    .merge(query);
  }

  return query.exec();
}
