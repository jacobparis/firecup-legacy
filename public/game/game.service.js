angular
  .module('Game')
  .service('PlayerService', ['$q', PlayerService]);

function PlayerService($q) {
  var players = [];

  this.addPlayers = addPlayers;
  this.demoPlayers = demoPlayers;
  this.getPlayers = getPlayers;
  this.getPlayer = getPlayer;
  this.getNumberOfPlayers = getNumberOfPlayers;
  this.getHand = getHand;
  this.getTable = getTable;
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


  function demoPlayers() {
      names = ["Mr Blonde", "Mr Pink", "Mr Orange", "Mr White", "Nice Guy"];
      return addPlayers(names)
      .then(giveCard(2, {
        "primary": "SMITE THEM",
        "secondary": "Play this card when someone winks",
        "type": "trap"
      }))
      .then(giveCard(2, {
        "primary": "SMITE THEM",
        "secondary": "Play this card when someone blinks",
        "type": "trap"
      }))
      .then(giveCard(2, {
        "primary": "SMITE THEM",
        "secondary": "Play this card when someone stands",
        "type": "trap"
      }))
      .then(giveCard(2, {
        "primary": "SMITE THEM",
        "secondary": "Play this card when someone winks",
        "type": "trap"
      }))
      .then(giveCard(2, {
        "primary": "SMITE THEM",
        "secondary": "Play this card when someone blinks",
        "type": "trap"
      }))
      .then(giveCard(2, {
        "primary": "STAT THEM",
        "secondary": "Play this card when someone stands",
        "type": "status"
      }))
      .then(giveCard(2, {
        "primary": "STAT THEM",
        "secondary": "Play this card when someone winks",
        "type": "status"
      }));
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
    var hand = [];
    for (var i = 0; i < players[id].hand.length; i++) {
      if (players[id].hand[i].type == "trap") {
        hand.push(players[id].hand[i]);
      }
    }
    return hand;
  }

  function getTable(id) {
    var table = [];
    for (var i = 0; i < players[id].hand.length; i++) {
      if (players[id].hand[i].type == "status") {
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
      players[id].hand.push(card);
      resolve();
    });
  }

  function discard(id, card) {
    var index = players[id].hand.indexOf(card);
    if (index > -1) {
      players[id].hand.splice(index, 1);
    }
  }

}
