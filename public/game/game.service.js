angular
  .module('GameService', [])
  .service('PlayerService', ['$q', PlayerService]);

function PlayerService($q) {
  var players = [
    {
      name: "Jacob",
      hand: [],
      index: 0
    },
    {
      name: "Katana",
      hand: [
        {
          "_id": "58117e972a6ee02819cffbbc",
          "primary": "EVERYONE MUST AVOID LOOKING AT YOU. IF YOU MAKE EYE CONTACT WITH SOMEONE, PUNISH THEM.",
          "type": "status",
          "deck": "consequence",
          "color": "black"
          },
        {
          "_id": "58117e972a6ee02819cffbbc",
          "primary": "YOU MUST END EVERY SENTENCE WITH 'MEOW' OR GROOM YOURSELF",
          "secondary": "if you pour a drink into a little bowl and drink it like a cat, you can give this card to someone else",
          "type": "status",
          "deck": "consequence",
          "color": "black"
          },
        {
          "_id": "58117e972a6ee02819cffbbc",
          "primary": "EVERYONE SOMEONE, PUNISH THEM.",
          "type": "status",
          "deck": "consequence",
          "color": "black"
          },

        ],
      index: 1
    },
    {
      name: "Jon",
      hand: [],
      index: 2
    },
    {
      name: "Bruin",
      hand: [],
      index: 3
    },
    {
      name: "Sara",
      hand: [],
      index: 4
    },
    {
      name: "Marisa",
      hand: [],
      index: 5
    },
    {
      name: "Andrew",
      hand: [],
      index: 6
    },
    {
      name: "Russel",
      hand: [],
      index: 7
    },
    {
      name: "Fred",
      hand: [],
      index: 8
    },
    {
      name: "Evanescence",
      hand: [],
      index: 9
    },
    {
      name: "Steve McQueen",
      hand: [],
      index: 10
    }
  ];

  this.getPlayers = getPlayers;
  this.getPlayer = getPlayer;
  this.getNumberOfPlayers = getNumberOfPlayers;
  this.getHand = getHand;
  this.getHandSize = getHandSize;
  this.giveCard = giveCard;
  this.discard = discard;

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
