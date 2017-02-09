angular
  .module('Game')
  .controller('SettingsController', [
    '$scope',
    '$state',
    'Socket',
    'Facebook',
    'FBService',
    'DialogService',
    'GameManager',
    SettingsController
  ]);

function SettingsController($scope, $state, Socket, Facebook, FBService, DialogService, GameManager) {
  const vm = this;
  $scope.Facebook = Facebook;
  $scope.game = GameManager;
  vm.facebook = {
    fbLogin: false,
    name: 'friend!',
    id: 0,
    picture: '',
    friends: []
  };

  vm.logout = logout;
  vm.login = login;

  vm.players = [];
  vm.playerIsMe = playerIsMe;
  vm.linkPlayer = linkPlayer;
  vm.savePlayer = savePlayer;
  vm.addPlayer = addPlayer;

  vm.loadedPlayers = false;

  (function() {
    checkLoginStatus()
    .then(joinGame)
    .then(function() {
      if(vm.facebook.id) {
        // If there are already players, see if I'm one of them
        if(vm.players.length) {
          if(_.find(vm.players, {'facebook': {id: vm.facebook.id}})) {
            // I am already in the list
            return;
          }
        }
        // I am not in this game yet, add me automagically
        Socket.emit('player:add', {
          room: GameManager.session.title,
          name: vm.facebook.name,
          deviceToken: GameManager.session.deviceToken,
          facebook: {
            id: vm.facebook.id,
            url: vm.facebook.picture
          }
        });
      }
    });
  })();

  function checkLoginStatus() {
    console.log('Check login status');
    return new Promise(function(resolve) {
      Facebook.getLoginStatus(resolve);
    })
    .then(function(response) {
      if(response.status !== 'connected') {
        console.log('not connected');
        vm.facebook = {
          fbLogin: false,
          name: 'friend!',
          id: 0,
          picture: ''
        };
        $scope.$apply();
        return Promise.resolve();
      }

      vm.facebook.fbLogin = true;
      return Promise.all([
        FBService.getUser(),
        FBService.getProfilePicture(),
        FBService.getFriends()
      ])
      .catch(function(data) {
        console.log(data);
      })
      .then(function(results) {
        console.log(results);
        vm.facebook.name = results[0].name;
        vm.facebook.id = results[0].id;
        vm.facebook.picture = results[1].data.url;
        vm.facebook.friends = results[2].data;
        console.log(vm.facebook.friends);
        $scope.$apply();

        FS.identify(results[0].id, {
          displayName: results[0].name
        });
      });
    });
  }

  function logout() {
    Facebook.logout(function(response) {
      checkLoginStatus();
    });
  }

  function login() {
    Facebook.login(function(response) {
      checkLoginStatus();
    }, {'scope': 'user_friends'});
  }

  function joinGame() {
    GameManager.session.title = GameManager.session.title.toUpperCase() || $state.params.title.toUpperCase();

    Socket.emit('client:join', {
      room: GameManager.session.title
    });
    console.log('A');
    console.log($state.params);
    console.log(GameManager.session.title);
    return GameManager.getRoom()
    .then(function(room) {
      console.log(room);
      GameManager.session.mode = room.mode;
      GameManager.session.players = room.players;
      GameManager.session.title = GameManager.session.title || room.title;
      GameManager.session.settings = room.settings;
      GameManager.session.eventDeck = room.eventDeck;
      GameManager.session.totalTurns = room.totalTurns;
      GameManager.session.turn = vm.selectedPlayer = room.turn;

      if(_.find(room.settings.hands, {type: 'status'})) {
        GameManager.session.ui.status = true;
      }

      if(_.find(room.settings.hands, {type: 'traps'})) {
        GameManager.session.ui.traps = true;
      }

      console.log(GameManager.session.title);
      const token = getCookie(GameManager.session.title);
      if (token !== '') {
        GameManager.session.deviceToken = token;
        console.log('Loaded token ' + GameManager.session.deviceToken + ' from memory');
      }
      else if (token === '') {
        console.log(token);
        GameManager.session.deviceToken = Math.random().toString(36).substr(2);
        setCookie(GameManager.session.title, GameManager.session.deviceToken);
        console.log('Saved token ' + GameManager.session.deviceToken + ' to memory');
      }
      else {
        console.log('This is weird');
        console.log(token);
      }

      loadPlayers();
    });

    // Set device token cookie
    // Check cookies for device tokens
    function setCookie(cname, cvalue) {
      const d = new Date();
      d.setTime(d.getTime() + 43200000);
      const expires = 'expires=' + d.toUTCString();
      document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    }

    function getCookie(cname) {
      const name = cname.toUpperCase() + '=';
      console.log(name);
      const ca = document.cookie.split(';');
      console.log(ca);
      for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    }

  }

  function playerIsMe(player) {
    // Player is an object
    if(typeof player === 'number') {
      player = GameManager.session.players[player];
    }

    if(player.facebook && player.facebook.id === vm.facebook.id) {
      return true;
    }

    if(player.deviceToken === GameManager.session.deviceToken) {
      return true;
    }

    return false;
  }

  function savePlayer(player) {
    console.log(player);
    Socket.emit('player:update', {
      room: GameManager.session.title,
      player: player
    });
  }

  function linkPlayer(player) {
    player.deviceToken = GameManager.session.deviceToken;
    savePlayer(player);
  }

  function addPlayer() {
    console.log(GameManager.session.deviceToken);
    console.log(GameManager.session.title);
    Socket.emit('player:add', {
      room: GameManager.session.title,
      name: vm.newPlayerName,
      deviceToken: GameManager.session.deviceToken
    });

    vm.newPlayerName = '';
  }

  function loadPlayers() {
    _.each(GameManager.session.players, function(player) {
      vm.players[player.index] = player;
    });
    vm.loadedPlayers = true;
    return Promise.resolve(true);
  }

  Socket.on('player:added', function(data) {
    console.log(data);
    vm.players.push({
      index: vm.players.length,
      name: data.name,
      deviceToken: data.deviceToken,
      facebook: data.facebook
    });
  });

  Socket.on('player:updated', function(data) {
    console.log('Update Player Setup');
    vm.players[data.index] = data;
  });
}
