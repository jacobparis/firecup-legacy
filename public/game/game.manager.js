angular
  .module('Game')
  .service('GameResource', ['$resource', GameResource])
  .service('GameManager', ['$resource', '$q', 'Socket', 'GameResource', 'DeckService', GameManager]);

function GameResource($resource) {
  return $resource('api/games/:gameID.:full', {
    'gameID': '@gameID',
  });
}
function GameManager($resource, $q, Socket, GameResource, DeckService) {
  const gm = this;
  gm.session = gm.session || cleanSession();
  gm.cleanSession = cleanSession;
  gm.clientStatus = 0;
  gm.newGame = newGame;
  gm.getGame = getGame;
  gm.getRoom = getRoom;
  gm.getBurnDeck = getBurnDeck;
  gm.getPlayers = getPlayers;
  gm.getNumberOfPlayers = gm.session.players.length;
  gm.addPlayer = addPlayer;
  gm.updatePlayer = updatePlayer;
  gm.getTurn = getTurn;
  gm.turnChange = turnChange;
  gm.getCurrentPlayer = getCurrentPlayer;
  gm.getHandByPlayer = getHandByPlayer;
  gm.getTableByPlayer = getTableByPlayer;
  gm.giveCardToPlayer = giveCardToPlayer;

  function cleanSession() {
    return {
      deviceToken: Math.random().toString(36).substr(2),
      players: [],
      turn: 0,
      title: '',
      Title: () => {
        return gm.session.title.replace(/(-|^)([^-]?)/g, function(_, prep, letter) {
          return (prep && ' ') + letter.toUpperCase();
        });
      }
    };
  }
  function newGame(settings) {
    settings.turn = 0;
    gm.clientStatus = 1; // Set to Host
    // Create new game
    return GameResource.save(settings)
    .$promise
    .then(function(result) {
      gm.session.title = result.title;
      gm.session.mode = result.mode;
      gm.session.turn = 0;
      gm.session.players = result.players;
      gm.session.totalTurns = 0;
      gm.session.facedown = true;

      return $q.resolve(result);
    });
  }

  function getRoom() {
    if(!gm.session.title) {
      return $q.reject('No title found');
    }

    return $resource('/api/games/:gameID', {
      'gameID': gm.session.title
    })
    .get()
    .$promise;
  }

  function getBurnDeck() {
    const Cards = $resource('/api/cards/deck/:deck', {
      deck: 'burn'
    });

    return Cards
    .query()
    .$promise;
  }
  function getGame(full) {
    full = full || 1;

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
      gm.session.mode = result.mode;

      gm.session.turn = result.turn;

      if(result.totalTurns !== gm.session.totalTurns) {
        gm.session.facedown = true;
        gm.session.totalTurns = result.totalTurns;
      }

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
    .then(function() {
      return getPlayers();
    });
  }

  function updatePlayer(player) {
    const Players = $resource('api/games/:title', {
      'title': gm.session.title
    }, {
      'update': {
        'method': 'PUT',
        'params': {
          'player': player.index,
          'setName': !!player.name,
          'link': !!player.link,
          'title': gm.session.title
        }
      }
    });

    return Players.update({name: player.name, deviceToken: player.deviceToken}).$promise
      .then(function() {
        console.log('Success');
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
    if(!gm.session.players) {return;}

    const player = gm.session.players[id];
    if(!player || !player.hand) { return []; }

    const hand = [];
    for (let i = 0; i < player.hand.length; i++) {
      if (player.hand[i].type === 'trap') {
        hand.push(player.hand[i]);
      }
    }
    return hand;
  }

  function getTableByPlayer(id) {
    if(!gm.session.players) {return;}

    const player = gm.session.players[id];
    if(!player || !player.hand) { return []; }

    const table = [];
    for (let i = 0; i < player.hand.length; i++) {
      if (player.hand[i].type === 'status') {
        table.push(player.hand[i]);
      }
    }
    return table;
  }
}
