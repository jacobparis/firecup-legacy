require('../models/Game');
require('../models/Card');
require('../../node_modules/lodash/lodash');
const _ = require('lodash');
const mongoose = require('mongoose');
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

function updatePlayer(title, doc) {
  if(!title) {return Promise.reject();}
  if(!doc.hasOwnProperty('index')) {return Promise.reject();}

  console.log('Update Player in ' + title);
  console.log(doc);
  const playerObject = Game
  .where('title').equals(title)
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
    .findOneAndUpdate({$pull: {'players.$.hand': {index: doc.pullCard}}})
    .setOptions({
      'new': true
    })
    .merge(query);
  }

  return query
  .then(function(result) {
    // Check settings and top up cards if necessary
    return Game
    .where('title').equals(title)
    .select('settings players')
    .findOne()
    .then(function(room) {
      for(const hand of room.settings.hands) {
        if(hand.min) {
          // Player needs a minimum number of cards
          const type = hand.type;
          const player = room.players[result.players[0].index];
          let numCards = 0;
          for(const card of player.hand) {
            if(card && card.type === type) {
              numCards = numCards + 1;
            }
          }
          console.log(numCards);
          if(numCards >= hand.min) {
            // Skip to next player
            continue;
          }

          // The player has fewer cards than the minimum
          const difference = hand.min - numCards;
          console.log('Player ' + player.index + ' in ' + title + 'needs ' + difference + ' more cards.');

            // Gift the player their new cards
          return Game.aggregate([
            { // Filter to room
              $match: {
                'title': title
              }
            },
            {
              $unwind: '$eventDeck'
            },
            {
              $match: {
                'eventDeck.type': type
              }
            },
            {
              $group: {
                '_id': '$_id',
                'eventDeck': {$push: '$eventDeck'}
              }
            }
          ], function(err, result) {
            if(err) {return Promise.resolve(err);}
            if(result) {return Promise.resolve(result);}
          })
          .then(function(doc) {
            const cards = doc[0].eventDeck.slice(0, difference);
            return Game
            .where('title').equals(title)
            .where('players.index').equals(player.index)
            .findOneAndUpdate({$push: {'players.$.hand': {$each: cards}}})
            .setOptions({
              'new': true
            })
            .select({
              'players': {
                $elemMatch: {
                  'index': player.index
                }
              }
            })
            .then(function(aaa) {
              const indices = _.map(cards, function(i) {
                return i.index;
              });

              return {
                'player': aaa,
                'removeList': indices
              };
            });
          })
          .then(function(object) {
            console.log('Remove cards from ' + title);
            console.log(object.removeList);
            Game
            .where('title').equals(title)
            .select('eventDeck')
            .update({
              $pull: {
                'eventDeck': {
                  'index': {
                    $in: object.removeList
                  }
                }
              }
            })
            .exec();
            return object.player;
          });
        }
      }
      return result;
    });
  });
}

function setTurn(room, index) {
  if(!room) {return Promise.reject();}
  if(index == null) {return Promise.reject();} // eslint-disable-line

  console.log('Set turn to ' + index);

  return Game
  .where('title').equals(room)
  .where('turn').ne(-1)
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
  .select('burnDeck settings')
  .findOne()
  .then(function(game) {
    const cards = [];
    if(!_.find(game.settings.decks, {type: 'burn'})) {
      // No burn deck in this variant, return an empty object
      _.each(players, function(player) {
        cards.push({
          'player': player,
          'empty': true
        });
      });
      return cards;
    }
    const deck = game.burnDeck;
    // TODO refill deck if empty
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
