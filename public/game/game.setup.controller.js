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
    'FBService',
    'GameManager',
    GameSetupController
  ]);

function GameSetupController($scope, $q, $mdDialog, $mdMedia, $state, $location, Socket, Facebook, FBService, GameManager) {
  const dm = this;
  $scope.game = GameManager;
  $scope.$mdMedia = $mdMedia;
  $scope.$location = $location;
  $scope.tokens = TOKENS;
  dm.createGame = createGame;
  dm.multiplePlayers = false;
  dm.multipleFacebooks = false;
  dm.players = [];
  dm.playerIsMe = playerIsMe;
  dm.loadPlayers = loadPlayers;
  dm.addPlayer = addPlayer;
  dm.savePlayer = savePlayer;
  dm.linkPlayer = linkPlayer;
  dm.fbPlayer = fbPlayer;
  dm.removefbPlayer = removefbPlayer;
  dm.logout = function() {Facebook.logout();};
  dm.confirmPlayers = confirmPlayers;
  dm.newPlayerName;
  dm.showNSFW = false;

  dm.cancel = cancel;
  dm.mode = 0;
  dm.themes = ['classic'];
  dm.selectTheme = selectTheme;
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
            'visible': true,
            'len': 50
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
            'visible': true,
            'len': 50
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
            'visible': false,
            'len': 50
          }
        ]
      }
    }
  ];

  function selectTheme(theme) {
    const id = dm.themes.indexOf(theme);

    if(id > -1) {dm.themes.splice(id, 1);}

    else {dm.themes.push(theme);}

    console.log(dm.themes);
  }

  dm.facebook = {
    fbLogin: false,
    name: 'friend!',
    id: 0,
    picture: ''
  };

  dm.login = login;
  dm.logout = logout;

  function checkLoginStatus() {
    console.log('Check login status');
    return new Promise(function(resolve) {
      Facebook.getLoginStatus(resolve);
    })
    .then(function(response) {
      if(response.status !== 'connected') {
        dm.fbLogin = false;
        return Promise.reject();
      }

      dm.facebook.fbLogin = true;
      return Promise.all([
        FBService.getUser(),
        FBService.getProfilePicture()
      ])
      .then(function(results) {
        console.log(results);
        dm.facebook.name = results[0].name;
        dm.facebook.id = results[0].id;
        dm.facebook.picture = results[1].data.url;
      });
    });
  }
  function logout() {
    Facebook.logout(function(response) {
      checkLoginStatus()
      .then(loadPlayers)
      .then(console.log);
    });
  }

  function login() {
    Facebook.login(function(response) {
      checkLoginStatus()
      .then(loadPlayers)
      .then(console.log);
    });
  }

  activate();

  function activate() {
    console.log($scope);
    checkLoginStatus()
    .then(function() {
      loadPlayers();
      // If there are already players, see if I'm one of them
      if(dm.players.length) {
        const hereEh = _.filter(dm.players, {'facebook': dm.facebook.id}).length;
        if(hereEh) {
          // I am already in the list
          console.log('HERE!');

          return;
        }
      }
      console.log('not here');
      // I am not in this game yet, add me automagically
      Socket.emit('player:add', {
        room: GameManager.session.title,
        name: dm.facebook.name,
        deviceToken: GameManager.session.deviceToken,
        facebook: dm.facebook.id
      });
    })
    .catch(function(a) {
      // Player is not logged in
      loadPlayers();
    });
  }
  function createGame() {
    console.log('Create');
    const theme = {
      theme: dm.themes
    };
    $mdDialog.hide(Object.assign(dm.settings[dm.mode], theme));
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

  function playerIsMe(player) {
    // Player is an object
    if(player.facebook === dm.facebook.id) {
      return true;
    }

    if(player.deviceToken === GameManager.session.deviceToken) {
      return true;
    }

    return false;
  }
  Socket.on('player:added', function(data) {
    console.log(data);
    dm.players.push({
      index: dm.players.length,
      name: data.name,
      deviceToken: data.deviceToken
    });

    dm.multiplePlayers = _.filter(dm.players, {'deviceToken': GameManager.session.deviceToken}).length !== 1;
    console.log(dm);
  });
  function loadPlayers() {
    _.each(GameManager.session.players, function(player) {
      dm.players[player.index] = player;
    });
    $scope.$apply();
    return Promise.resolve();
  }
  function savePlayer(player) {
    console.log(player);
    Socket.emit('player:update', {
      room: GameManager.session.title,
      player: player
    });
  }

  function showPurchase() {

  }
  Socket.on('player:updated', function(data) {
    console.log('Update Player Setup');
    dm.players[data.index] = data;
    dm.multiplePlayers = _.filter(dm.players, {'deviceToken': GameManager.session.deviceToken}).length !== 1;
    dm.multipleFacebooks = _.filter(dm.players, {'facebook': GameManager.session.fb}).length > 1;

  });

  function linkPlayer(player) {
    player.deviceToken = GameManager.session.deviceToken;
    savePlayer(player);
  }

  function fbPlayer(player) {
    player.facebook = GameManager.session.fb;
    player.deviceToken = GameManager.session.deviceToken;
    savePlayer(player);

  }

  function removefbPlayer(player) {
    player.facebook = 'DELETE';
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
