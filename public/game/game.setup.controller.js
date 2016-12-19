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
  $scope.url = $location.absUrl;
  dm.createGame = createGame;
  dm.players = [];
  dm.loadPlayers = loadPlayers;
  dm.addPlayer = addPlayer;
  dm.savePlayer = savePlayer;
  dm.linkPlayer = linkPlayer;

  dm.confirmPlayers = confirmPlayers;
  dm.newPlayerName;

  dm.cancel = cancel;
  dm.settings = {
    'mode': 0
  };

  dm.modes = [
    {
      'name': 'Classic',
      'desc': 'An enhanced version of the game known widely by names like King\'s Cup, Sociables, Ring of Fire, Circle of Death, and many more.',
      'settings': {

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
    Facebook.getLoginStatus(function(response) {
      console.log(response);
    });
  }
  function createGame() {
    console.log('Create');
    $mdDialog.hide(dm.settings);
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
