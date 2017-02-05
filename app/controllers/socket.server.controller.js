require('../models/Game');
require('../models/Card');
require('../models/Feedback');
require('../models/Player');
const _ = {
  map: require('lodash').map,
  each: require('lodash').each,
  times: require('lodash').times,
  take: require('lodash').take,
  shuffle: require('lodash').shuffle,
  find: require('lodash').find
};
const mongoose = require('mongoose');
const Game = require('mongoose').model('Game');
const Card = require('mongoose').model('Card');
const Player = require('mongoose').model('Player');
const Feedback = require('mongoose').model('Feedback');
exports.addPlayer = addPlayer;
exports.updatePlayer = updatePlayer;
exports.setTurn = setTurn;
exports.getRoom = getRoom;
exports.buildADeck = buildADeck;
exports.drawBurnCards = drawBurnCards;
exports.saveFeedback = saveFeedback;

function addPlayer(room, name, deviceToken, facebook) {
  room = room.toUpperCase();
  console.log('Add player ' + name + ' to ' + room);

  const query = Game
  .where('title').equals(room)
  .select('players')
  .findOne()
  .then(function(game) {
    return Game
    .findOneAndUpdate({
      $push: {
        players: {
          name: name,
          index: game.players.length,
          deviceToken: deviceToken,
          facebook: facebook
        }
      }
    })
    .select('players')
    .where('title').equals(room)
    .exec()
    .then(function(blag) {
      updatePlayer(room, {index: game.players.length, name: name});
      return blag;
    });
  });

  return query;
}

function updatePlayer(title, doc) {

  if(!title) {return Promise.reject();}
  if(!doc.hasOwnProperty('index')) {return Promise.reject();}

  title = title.toUpperCase();
  console.log('Update Player in ' + title);
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

  if(doc.facebook) {
    console.log('Connect player to facebook: ' + doc.facebook);
    if(doc.facebook === 'DELETE') {
      doc.facebook = null;
    }

    const newPlayer = new Player({
      facebook: doc.facebook,
      room: title,
    });

    newPlayer
    .save()
    .then(function(result) {
      console.log(result);
    }, function(err) {
      Player
      .where('facebook').equals(doc.facebook)
      .findOne()
      .then(function(user) {
        console.log(user);
        console.log(user.room);
        if(user.room === title) {
          // User is already here, abort;
          return Promise.resolve();
        }

        return Player
        .where('facebook').equals(doc.facebook)
        .update({$set: {room: title}, $inc: {games: 1}})
        .exec();
      });
    });

    query = Game
    .findOneAndUpdate({$set: {'players.$.facebook': doc.facebook}})
    .setOptions({
      'new': true
    })
    .merge(query);
  }

  if(doc.pushCard) {
    console.log('Give card to player #' + doc.index);
    console.log(doc.facebook);
    if(doc.facebook && JSON.parse(doc.pushCard).type === 'status') {
      Player
      .where('facebook').equals(doc.facebook)
      .update({
        $inc: {statuses: 1}
      })
      .exec();
    }
    query = Game
    .findOneAndUpdate({
      $push: {
        'players.$.hand': JSON.parse(doc.pushCard)
      },
      $inc: {
        'players.$.stats.statuses': (JSON.parse(doc.pushCard).type === 'status') ? 1 : 0
      }
    })
    .setOptions({
      'new': true
    })
    .merge(query);
  }

  if(doc.hasOwnProperty('pullCard')) {
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

function buildADeck(deck, themes, len) {
  if(!deck) {return Promise.reject();}
  themes = themes || ['classic'];
  len = len || 100000;
  console.log(themes);
  return Card.find({
    'deck': deck.type,
    'type': {
      $in: deck.contents
    },
    'theme': {
      $in: themes
    }
  })
  .lean()
  .then(function(sourceDeck) {
    let deck = [];
    _.each(sourceDeck, function(sourceCard) {
      let cards = [{
        'primary': sourceCard.primary,
        'secondary': sourceCard.secondary,
        'tertiary': sourceCard.tertiary,
        'theme': sourceCard.theme,
        'type': sourceCard.type,
        'deck': sourceCard.deck
      }];

      // Card has a data array
      if(sourceCard.data && sourceCard.data.length) {
        const result = [];
        _.each(sourceCard.data, function(line, index) {
          result[index] = {
            'primary': sourceCard.primary,
            'secondary': sourceCard.secondary.slice(0).replace('RANDOM', line),
            'tertiary': sourceCard.tertiary,
            'theme': sourceCard.theme,
            'type': sourceCard.type,
            'deck': sourceCard.deck
          };
        });
        cards = result;
      }

      // Duplicate cards
      if(sourceCard.frequency > 1) {
        let result = [];
        _.times(sourceCard.frequency, function() {
          result = result.concat(cards);
        });
        cards = result;
      }
      deck = deck.concat(cards);
    });

    return _.take(_.map(_.shuffle(deck), function(doc, index) {
      doc.index = index;
      return doc;
    }), len);
  });
}

function setTurn(room, index) {
  if(!room) {return Promise.reject();}
  if(index == null) {return Promise.reject();} // eslint-disable-line

  room = room.toUpperCase();

  console.log('Set turn to ' + index);

  return Game
  .where('title').equals(room)
  .where('turn').ne(-1)
  .select('turn totalTurns')
  .findOneAndUpdate({$inc: {'totalTurns': 1}, $set: {'turn': index}})
  .then(function(game) {
    Player
    .where('room').equals(room)
    .update({
      $inc: {turns: 1}
    })
    .exec();

    return Game
    .where('title').equals(room)
    .select('totalTurns')
    .findOne()
    .exec();
  });
}

function getRoom(room) {
  room = room.toUpperCase();

  console.log('Get Room: ' + room);
  if(!room) {return Promise.reject();}

  const loadGame = Game
  .where('title').equals(room)
  .findOne()
  .exec();

  return loadGame;
}

function buildDeck2() {
  const burnCards = Card
  .where('deck').equals('burn')
  .find()
  .exec();

  return burnCards;
}

function drawBurnCards(room, players) {
  if(!room) {return Promise.reject();}
  room = room.toUpperCase();

  console.log('Draw burn card in ' + room);
  return Game
  .where('title').equals(room)
  .select('burnDeck settings players')
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
    // Check length of deck
    console.log('Burndeck in ' + room + ' has ' + game.burnDeck.length + ' cards left.');
    if(game.burnDeck.length < 5) {
      console.log(room + ' needs a new burn deck');
      buildADeck(_.find(game.settings.decks, {type: 'burn'}))
      .then(function(burnDeck) {
        console.log('New Deck');
        console.log(burnDeck);
        Game
        .where('title').equals(room)
        .update({'burnDeck': burnDeck})
        .exec();
      });
    }
    const deck = game.burnDeck;

    let newCard = {};
    for(let i = 0; i < players.length; i++) {
      if(game.players[players[i]].facebook) {
        Player
        .where('facebook').equals(game.players[players[i]].facebook)
        .update({
          $inc: {burns: 1}
        })
        .exec();
      }
      // Here I can parse the burn cards before delivering to client
      newCard = deck.splice(0, 1)[0];
      newCard.player = players[i];
      cards.push(newCard);
      console.log(newCard);
      Game
      .where('title').equals(room)
      .where('players.index').equals(players[i])
      .select('burnDeck')
      .update({
        $pull: {
          'burnDeck': {
            index: newCard.index
          }
        },
        $inc: {
          'players.$.stats.burns': 1
        }
      })
      .exec();
    }
    return cards;
  });

}

function saveFeedback(doc) {
  const feedback = new Feedback({
    contact: doc.data.contact,
    comment: doc.data.comment,
    img: doc.img
  });
  feedback.save();
}
function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
