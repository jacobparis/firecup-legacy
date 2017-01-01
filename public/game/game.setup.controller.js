angular
  .module('Game')
  .controller('GameSetupController', [
    '$scope',
    '$q',
    '$mdDialog',
    '$mdMedia',
    '$state',
    '$location',
    'Socket',
    'Facebook',
    'GameManager',
    GameSetupController
  ]);

function GameSetupController($scope, $q, $mdDialog, $mdMedia, $state, $location, Socket, Facebook, GameManager) {
  const dm = this;
  $scope.game = GameManager;
  $scope.$mdMedia = $mdMedia;
  $scope.$location = $location;
  $scope.tokens = TOKENS;
  dm.createGame = createGame;
  dm.players = [];
  dm.multiplePlayers = false;
  dm.loadPlayers = loadPlayers;
  dm.addPlayer = addPlayer;
  dm.savePlayer = savePlayer;
  dm.linkPlayer = linkPlayer;

  dm.confirmPlayers = confirmPlayers;
  dm.newPlayerName;

  dm.cancel = cancel;
  dm.mode = 0;
  dm.settings = [
    {
      'name': 'Firecup',
      'desc': 'An enhanced version of the game known widely by names like King\'s Cup, Sociables, Ring of Fire, Circle of Death, and many more.',
      'settings': {
        'shareDevice': true,
        'takeTurns': true,
        'hands': [
          {
            'type': 'trap',
            'min': 0,
            'max': 6,
            'public': false,
            'singleUse': true
          },
          {
            'type': 'status',
            'min': 0,
            'max': 3,
            'public': true
          }
        ],
        'decks': [
          {
            'type': 'event',
            'contents': ['event', 'trap'],
            'turn': true,
            'visible': true
          },
          {
            'type': 'burn',
            'contents': ['status', 'action'],
            'turn': false,
            'visible': true
          }
        ]
      }
    },
    {
      'name': 'Traps',
      'desc': 'Each player gets 6 trap cards. When another player activates your trap, make them draw a burn card. If they correctly guess what your trap card is, replace it with a new one.',
      'settings': {
        'shareDevice': false,
        'takeTurns': false,
        'hands': [
          {
            'type': 'trap',
            'min': 6,
            'max': 6,
            'public': false
          }
        ],
        'decks': [
          {
            'type': 'event',
            'contents': ['trap'],
            'turn': false,
            'visible': false
          },
          {
            'type': 'burn',
            'contents': ['action'],
            'turn': false,
            'visible': true
          }
        ]
      }
    },
    {
      'name': 'Traps Lite',
      'desc': 'Just like regular Traps rules, but with no Burn cards. If someone triggers your trap, make them take a drink. This variant is great for movie nights -- when someone in the movie triggers your trap, replace it with a new one and everyone takes a drink.',
      'settings': {
        'shareDevice': false,
        'takeTurns': false,
        'hands': [
          {
            'type': 'trap',
            'min': 6,
            'max': 6,
            'public': false
          }
        ],
        'decks': [
          {
            'type': 'event',
            'contents': ['trap'],
            'turn': false,
            'visible': false
          }
        ]
      }
    }
  ];

  dm.socials = [
    {
      'name': 'Facebook',
      'image': 'FB-f-Logo__blue_50.png'
    }
  ];
  $scope.login = function() {
      // From now on you can use the Facebook service just as Facebook api says
    Facebook.login(function(response) {
        // Do something with response.
    });
  };

  $scope.getLoginStatus = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        $scope.loggedIn = true;
      }
      else {
        $scope.loggedIn = false;
      }
    });
  };

  $scope.me = function() {
    Facebook.api('/me', function(response) {
      $scope.user = response;
    });
  };

  activate();

  function activate() {
    dm.players = JSON.parse(JSON.stringify(GameManager.session.players));
    dm.multiplePlayers = _.filter(dm.players, {'deviceToken': GameManager.session.deviceToken}).length !== 1;
    console.log($scope);
    console.log($location.absUrl());
    Facebook.getLoginStatus(function(response) {
      console.log(response);
    });
  }
  function createGame() {
    console.log('Create');
    $mdDialog.hide(dm.settings[dm.mode]);
  }

  function addPlayer() {
    console.log(GameManager.session.deviceToken);
    Socket.emit('player:add', {
      room: GameManager.session.title,
      name: dm.newPlayerName,
      deviceToken: GameManager.session.deviceToken
    });

    dm.newPlayerName = '';
  }

  Socket.on('player:added', function(data) {
    console.log(data);
    dm.players.push({
      index: dm.players.length,
      name: data.name,
      deviceToken: data.deviceToken
    });

    dm.multiplePlayers = _.filter(dm.players, {'deviceToken': GameManager.session.deviceToken}).length !== 1;
  });
  function loadPlayers() {
    dm.players = JSON.parse(JSON.stringify(GameManager.session.players));

  }
  function savePlayer(player) {
    console.log(player);
    Socket.emit('player:update', {
      room: GameManager.session.title,
      player: player
    });
  }

  Socket.on('player:updated', function(data) {
    console.log('Update Player Setup');
    dm.players[data.index] = data;
    dm.multiplePlayers = _.filter(dm.players, {'deviceToken': GameManager.session.deviceToken}).length !== 1;
  });

  function linkPlayer(player) {
    player.deviceToken = GameManager.session.deviceToken;
    savePlayer(player);

  }

  function confirmPlayers() {
    console.log('Confirm');
    const session = dm.settings;
    session.players = dm.players;
    $mdDialog.hide(session);
  }

  function cancel() {
    console.log('Cancel');
    $mdDialog.cancel(true);
    $state.go('game', {title: ''}, {reload: true});
  }
}
