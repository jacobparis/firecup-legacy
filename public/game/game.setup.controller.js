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
  const vm = this;
  $scope.game = GameManager;
  $scope.$location = $location;
  $scope.tokens = TOKENS;
  vm.createGame = createGame;
  vm.joinGame = joinGame;
  vm.logout = logout;
  vm.showNSFW = false;

  vm.mode = 0;
  vm.themes = ['classic'];
  vm.selectTheme = selectTheme;
  vm.settings = [
    {
      'name': 'Firecup',
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
    const id = vm.themes.indexOf(theme);

    if(id > -1) {vm.themes.splice(id, 1);}

    else {vm.themes.push(theme);}

    console.log(vm.themes);
  }

  vm.facebook = {
    fbLogin: false,
    name: 'friend!',
    id: 0,
    picture: ''
  };

  vm.login = login;
  vm.logout = logout;

  function checkLoginStatus() {
    console.log('Check login status');
    return new Promise(function(resolve) {
      Facebook.getLoginStatus(resolve);
    })
    .then(function(response) {
      if(response.status !== 'connected') {
        console.log('not connected');
        vm.facebook = {};
        return Promise.reject();
      }

      vm.facebook.fbLogin = true;
      return Promise.all([
        FBService.getUser(),
        FBService.getProfilePicture()
      ])
      .then(function(results) {
        console.log(results);
        vm.facebook.name = results[0].name;
        vm.facebook.id = results[0].id;
        vm.facebook.picture = results[1].data.url;
      });
    });
  }
  function logout() {
    Facebook.logout(function(response) {
      checkLoginStatus()
      .then(loadPlayers)
      .then(console.log, function() {
        console.log(vm.players);
        console.log(vm.facebook);
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
      console.log(vm.settings);
      console.log($stateParams.mode);
      vm.mode = _.findIndex(vm.settings, {name: $stateParams.mode});
    }

    if($stateParams.themes && $stateParams.themes.length) {
      vm.themes = $stateParams.themes;
      console.log(vm.themes);
    }
  }
  function joinGame(result) {
    const title = (result || '').replace(/[\s+-]/g, '-').replace(/[^\w-]/g, '').toLowerCase();
    $state.go('game', {title: title}, {reload: true});
  }

  function createGame() {
    console.log('Create');

    return GameManager.newGame(Object.assign(vm.settings[vm.mode], {
      theme: vm.themes
    }))
    .then(function(result) {
      $state.go('gameSettings', {title: result.title});
    });
  }

}
