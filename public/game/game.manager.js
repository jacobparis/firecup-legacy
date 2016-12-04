angular
  .module('Game')
  .service('GameResource', ['$resource', GameResource])
  .service('GameManager', ['$resource', '$q', 'GameResource', 'DeckService', GameManager]);

function GameResource($resource) {
  return $resource('api/games/:gameID.:full', {
    'gameID': '@gameID',
  });
}
function GameManager($resource, $q, GameResource, DeckService) {
  const gm = this;
  gm.session = {
    players: [],
    turn: 0,
    title: '',
    Title: function() {
      return gm.session.title.replace(/(-|^)([^-]?)/g, function(_, prep, letter) {
        return (prep && ' ') + letter.toUpperCase();
      });
    }
  };
  gm.clientStatus = 0;
  gm.newGame = newGame;
  gm.getGame = getGame;
  gm.getPlayers = getPlayers;
  gm.getNumberOfPlayers = () => gm.session.players.length;
  gm.addPlayer = addPlayer;
  gm.getTurn = getTurn;
  gm.turnChange = turnChange;
  gm.getCurrentPlayer = getCurrentPlayer;
  gm.getHandByPlayer = getHandByPlayer;
  gm.getTableByPlayer = getTableByPlayer;
  gm.giveCardToPlayer = giveCardToPlayer;

  function newGame(settings) {
    settings.turn = 0;
    gm.clientStatus = 1; // Set to Host
    // Create new game
    return GameResource.save(settings)
    .$promise
    .then(function(result) {
      gm.session.title = result.title,
      gm.session.mode = result.mode,
      gm.session.turn = 0,
      gm.session.players = result.players;

      return $q.resolve(result);
    });
  }

  function getGame(full) {
    full = full || 1;
    /*

    */
    // console.log(gm.session.title);
    if(!gm.session.title) {
      return $q.reject('No title found');
    }

    return GameResource.get({
      'gameID': gm.session.title,
      'full': full
    }).$promise
    .then(function(result) {
      if(result.players) {
        console.log('UPDATED PLAYERS');
        gm.session.players = result.players;
      }
      if(result.eventDeck) {
        gm.session.eventDeck = result.eventDeck;
      }
      gm.session.eventCard = result.eventCard;
      gm.session.mode = result.mode;
      gm.session.turn = result.turn;

      return $q.resolve(result);
    });
  }

  function getPlayers() {
    getGame()
    .then(function() {
      return gm.session.players;
    });
  }

  function addPlayer(name) {
    // console.log(gm.session.title);
    const Players = $resource('api/players/:title', {
      'title': gm.session.title
    });

    return Players.save({name: name}).$promise
    .then(function(result) {
      return getPlayers();
    });
  }

  function getCurrentPlayer() {
    getGame()
    .then(function() {
      return gm.session.players[gm.session.turn];
    });
  }

  function getTurn() {
    getGame()
    .then(function() {
      return gm.session.turn;
    });
  }

  function turnChange(player) {
    player = player || (gm.session.turn + 1) % gm.session.players.length;
    gm.session.turn = player;
    const Players = $resource('api/games/:title', {
      'title': gm.session.title
    }, {
      'update': {
        'method': 'PUT',
        'params': {
          'turn': player,
          'title': gm.session.title
        }
      }
    });

    return Players.update()
    .$promise
    .then(function(data) {
      return getGame('0')
      .then(function() {
        return data;
      });
    });

  }

  function giveCardToPlayer(card, player) {
    console.log(player);
    console.log(card);

    const Players = $resource('api/games/:title', {
      'title': gm.session.title
    }, {
      'update': {
        'method': 'PUT',
        'params': {
          'hand': player,
          'title': gm.session.title
        }
      }
    });

    return Players.update(card)
    .$promise
    .then(function(data) {
      return getGame()
      .then(function() {
        return data;
      });
    });
  }

  function getHandByPlayer(id) {
    const player = gm.session.players[id];
    if(player && player.hand) {}
    else {return;}

    const hand = [];
    for (let i = 0; i < player.hand.length; i++) {
      if (player.hand[i].type === 'trap') {
        hand.push(player.hand[i]);
      }
    }
    return hand;
  }

  function getTableByPlayer(id) {
    const player = gm.session.players[id];
    if(player && player.hand) {}
    else {return;}

    const table = [];
    for (let i = 0; i < player.hand.length; i++) {
      if (player.hand[i].type === 'status') {
        table.push(player.hand[i]);
      }
    }
    return table;
  }

  function getEventDeck() {

  }
}
