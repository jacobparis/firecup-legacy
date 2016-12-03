angular
  .module('Game')
  .service('PlayerService', ['$q', PlayerService]);

function PlayerService($q) {
  let players = [];

  this.getPlayers = getPlayers;
  this.getPlayer = getPlayer;
  this.getNumberOfPlayers = getNumberOfPlayers;
  this.getHand = getHand;
  this.getTable = getTable;
  this.getCard = getCard;
  this.getHandSize = getHandSize;
  this.giveCard = giveCard;
  this.discard = discard;

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
    if(!players[id]) {return false;}
    const hand = [];
    for (let i = 0; i < players[id].hand.length; i++) {
      if (players[id].hand[i].type == 'trap') {
        hand.push(players[id].hand[i]);
      }
    }
    return hand;
  }

  function getTable(id) {
    if(!players[id]) {return false;}
    const table = [];
    for (let i = 0; i < players[id].hand.length; i++) {
      if (players[id].hand[i].type == 'status') {
        table.push(players[id].hand[i]);
      }
    }
    return table;
  }
  function getCard(player, card) {
    return players[player].hand[card];
  }

  function getHandSize(id) {
    return players[id].hand.length;
  }

  function giveCard(id, card) {
    return $q(function(resolve, reject) {
      if(!card) {reject('No valid card.');}

      players[id].hand.push(card);
      resolve();
    });
  }

  function discard(id, card) {
    const index = players[id].hand.indexOf(card);
    if (index > -1) {
      players[id].hand.splice(index, 1);
    }
  }

}
