angular
  .module('Game')
  .controller('GameSetupController', [
    '$scope',
    '$q',
    '$mdDialog',
    '$state',
    '$stateParams',
    '$location',
    'Socket',
    'Facebook',
    'FBService',
    'GameManager',
    GameSetupController
  ]);
function GameSetupController($scope, $q, $mdDialog, $state, $stateParams, $location, Socket, Facebook, FBService, GameManager) {
  const dm = this;
  $scope.game = GameManager;
  $scope.$location = $location;
  $scope.tokens = TOKENS;
  dm.createGame = createGame;
  dm.joinGame = joinGame;
  dm.logout = logout;
  dm.showNSFW = false;

  dm.mode = 0;
  dm.themes = ['classic'];
  dm.selectTheme = selectTheme;
  dm.settings = [
    {
      'name': 'Firecup',
      'img': 'assets/img/firecupgameicon.png',
      'desc': 'An enhanced version of Firecup Lite that lets you draw trap cards and use them to burn your friends.',
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
      'name': 'Firecup Lite',
      'img': 'assets/img/firecupliteicon.png',
      'desc': 'The original party classic! Play rounds of minigames and burn the losers with elaborate drinking methods and persistent status effects.',
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
      'name': 'Firetraps',
      'img': 'assets/img/firetrapsicon.png',
      'desc': 'Each player gets 6 trap cards with actions on them. When another player triggers your trap, burn them and grab a new card.',
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
      'name': 'Firetraps Lite',
      'img': 'assets/img/firetrapsliteicon.png',
      'desc': 'A simpler variant of Firetraps without the burn cards. Great for movie nights -- if your friend triggers a trap, make them drink, but if a movie character does, EVERYONE drinks.',
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
        console.log('not connected');
        dm.facebook = {};
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

        FS.identify(results[0].id, {
          displayName: results[0].name
        });
      });
    });
  }
  function logout() {
    Facebook.logout(function(response) {
      checkLoginStatus()
      .then(loadPlayers)
      .then(console.log, function() {
        console.log(dm.players);
        console.log(dm.facebook);
        $scope.$apply();
      });
    });
  }

  function login() {
    Facebook.login(function(response) {
      checkLoginStatus();
    });
  }

  (function() {
    console.log($stateParams);
    checkLoginStatus();
    autoSetMode();
  })();

  function autoSetMode() {
    if($stateParams.mode) {
      console.log(dm.settings);
      console.log($stateParams.mode);
      dm.mode = _.findIndex(dm.settings, {name: $stateParams.mode});
    }

    if($stateParams.themes && $stateParams.themes.length) {
      dm.themes = $stateParams.themes;
      console.log(dm.themes);
    }

    if($scope.mode) {
      dm.mode = _.findIndex(dm.settings, {name: $scope.mode});
    }
  }
  function joinGame(result) {
    const title = (result || '').replace(/[\s+-]/g, '-').replace(/[^\w-]/g, '').toLowerCase();
    $state.go('game', {title: title}, {reload: true});
  }

  function createGame() {
    console.log('Create');

    return GameManager.newGame(Object.assign(dm.settings[dm.mode], {
      theme: dm.themes
    }))
    .then(function(result) {
      $state.go('welcome', {title: result.title});
    });
  }

}
