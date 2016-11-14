angular
  .module('Game')
  .service('PlayerService', ['$q', PlayerService]);

function PlayerService($q) {
  var players = [];

  this.addPlayers = addPlayers;
  this.getPlayers = getPlayers;
  this.getPlayer = getPlayer;
  this.getNumberOfPlayers = getNumberOfPlayers;
  this.getHand = getHand;
  this.getCard = getCard;
  this.getHandSize = getHandSize;
  this.giveCard = giveCard;
  this.discard = discard;

  function addPlayers(names) {
    return $q(function(resolve, reject) {
      for(var i = 0; i < names.length; i++) {
        players.push({
          "name": names[i],
          "hand": [],
          "index": i
        });
      }
      resolve();
    });
  }

  function clearPlayers() {
    return $q(function(resolve, reject) {
      players = [];
      resolve();
    });
  }
  function getPlayers() {
    return players;
  }

  function getPlayer(id) {
    return players[id];
  }

  function getNumberOfPlayers() {
    return players.length;
  }

  function getHand(id) {
    return players[id].hand;
  }

  function getCard(player, card) {
    return players[player].hand[card];
  }

  function getHandSize(id) {
    return players[id].hand.length;
  }

  function giveCard(id, card) {
    players[id].hand.push(card);
  }

  function discard(id, card) {
    var index = players[id].hand.indexOf(card);
    if (index > -1) {
      players[id].hand.splice(index, 1);
    }
  }
}
