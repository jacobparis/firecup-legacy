angular
  .module('Game', [])

  .controller('GameController', [
    '$scope',
    '$q',
    '$mdDialog',
    '$mdBottomSheet',
    '$mdMedia',
    '$state',
    '$timeout',
    'Socket',
    'GameManager',
    'DeckService',
    'DialogService',
    'PlayerService',
    'Analytics',
    GameController
  ]);

function GameController($scope, $q, $mdDialog, $mdBottomSheet, $mdMedia, $state, $timeout, Socket, GameManager, DeckService, DialogService, PlayerService, Analytics) {
  Analytics.trackPage('/game');
  // Lock scrolling hack
//  angular.element(document.body).addClass("noscroll");
  $scope.$mdMedia = $mdMedia;
  $scope.game = GameManager;
  $scope.thisDevice = {'deviceToken': ''};
  $scope._ = _;
  $scope.log = function(log) {
    console.log(log);
    return true;
  };

  const vm = this;
  /* Properties **/
  vm.selectedPlayer = 0;
  vm.eventCard = {};
  vm.burnCard = [];
  vm.dialOpen = false;
  vm.showHand = showHand;

  vm.click = {x: 0, y: 0};
  vm.switchDecks = switchDecks;
  vm.otherDeck = 'BURN';
  vm.deckId = 0;

  vm.drawEvent = drawEvent;
  vm.drawBurn = drawBurn;

  vm.turnChange = turnChange;
  vm.alertTurn = alertTurn;
  vm.startGame = activate;
  vm.startEh = false;

  Socket.on('client:joined', function(data) {
    console.log('User joined');
  });

  activate();

  function activate() {
    vm.startEh = false;
    if($state.params.title.length === 0) {
      createOrJoin()
      .then(showCreateDialog, showJoinPrompt);
    }
    else {
      joinGame()
      .then(showAddPlayers)
      .then(setupParser)
      .then(firstDeal)
      .then(function() {
        vm.startEh = true;
        $scope.thisDevice = function(index) {
          if(index == -1) {return false;}
          if(!vm.startEh) {return false;}
          return GameManager.session.players[index].deviceToken === GameManager.session.deviceToken;
        };

        const deck = _.find(GameManager.session.settings.decks, {'visible': true});
        vm.deckChoice = deck ? deck.type : '';
        console.log('Game Start!');
      });
    }

    function createOrJoin() {
      GameManager.session = GameManager.cleanSession();
      const prompt = {
        'text': 'Join an existing game or create a new one?',
        'cancel': 'Join',
        'confirm': 'Create'
      };

      return DialogService.showConfirm(prompt);
    }
    function showCreateDialog() {
      // Decide to join a game or create a new one
      const dialog = {
        controller: 'GameSetupController',
        controllerAs: 'dm',
        templateUrl: 'game/game.setup.html',
        clickOutsideToClose: true,
      };

      return DialogService.showCustom(dialog)
        .then(registerNewGame);
      // If joining, connect and sync then startEh
      // If creating, begin setup
    }

    function registerNewGame(settings) {
      console.log(settings);
      return GameManager.newGame(settings)
      .then(function(result) {
        $state.go('game', {title: result.title});
      });
    }

    function joinGame() {
      GameManager.session.title = GameManager.session.title || $state.params.title;

      Socket.emit('client:join', {
        room: GameManager.session.title
      });

      return GameManager.getRoom()
      .then(function(room) {
        console.log(room);
        GameManager.session.mode = room.mode;
        GameManager.session.players = room.players;
        GameManager.session.settings = room.settings;
        GameManager.session.eventDeck = room.eventDeck;
        GameManager.session.totalTurns = room.totalTurns;
        GameManager.session.turn = vm.selectedPlayer = room.turn;
      });
    }

    function showJoinPrompt() {
      // Decide to join a game or create a new one
      const prompt = {
        'text': 'What room would you like to join?',
        'input': 'Room Name',
        'confirm': 'Join Room',
        'cancel': 'Back'
      };

      return DialogService.showPrompt(prompt)
        .catch(() => $q.resolve())
        .then(function(result) {
          const title = (result || '').replace(/[\s+-]/g, '-').replace(/[^\w-]/g, '').toLowerCase();
          $state.go('game', {title: title}, {reload: true});
        });
    }

    function showAddPlayers(e) {
      // Decide to join a game or create a new one
      const dialog = {
        controller: 'GameSetupController',
        controllerAs: 'dm',
        templateUrl: 'game/game.setup.players.html',
        scope: $scope.$new(),
        targetEvent: e
      };

      return DialogService.showCustom(dialog)
        .then(function(doc) {
          console.log(doc);
        });
      // If joining, connect and sync then startEh
      // If creating, begin setup
    }

    function setupParser() {
      vm.parser = new Parser();
      vm.parser.addRule('RANDOM', function(tag, history, source) {
        if(!source.data) {return false;}
        return _.sample(source.data, 1);
      });
      vm.parser.addRule('PLAYER1', function(tag, history) {
        // Return PLAYERA if already used
        const existing = _.find(history, function(record) {
          return record.match === 'PLAYER1';
        });

        if (existing && existing.text) {
          return existing.text;
        }

        const myName = GameManager.session.players[GameManager.session.turn].name;
        let playerName = myName;

        while(playerName === myName) {
          playerName = GameManager.session.players[randomIndex(GameManager.session.players)].name;
        }
        return playerName;
      });

      vm.parser.addRule('PLAYER2', function(tag, history) {
        // Return tag if already used
        const existing = _.find(history, function(record) {
          return record.match === 'PLAYER2';
        });

        if(existing && existing.text) {
          return existing.text;
        }

        // Return random that is not used
        let blacklist = _.filter(history, function(record) {
          return record.match === 'PLAYER1';
        });

        if(blacklist.length === 0) {
          blacklist = [{text: ''}];
        }

        const myName = GameManager.session.players[GameManager.session.turn].name;
        let name = blacklist[0].text;
        while(name === blacklist[0].text || name === myName) {
          name = GameManager.session.players[randomIndex(GameManager.session.players)].name;
        }
        return name;
      });

      vm.parser.addRule('ME', function(tag) {
        // Return player at random
        return GameManager.session.players[GameManager.session.turn].name;
      });

      vm.parser.addRule('NEXTPLAYER', function(tag) {
        // Return player at random
        const len = GameManager.session.players.length;
        return GameManager.session.players[(GameManager.session.turn + 1) % len].name;
      });

      vm.parser.addRule('PREVPLAYER', function(tag) {
        // Return player at random
        const len = GameManager.session.players.length;
        return GameManager.session.players[(GameManager.session.turn + len - 1) % len].name;
      });
    }
    function firstDeal() {
      console.log(GameManager);
      console.log($scope);
      Socket.emit('player:ready', {
        'room': GameManager.session.title
      }, function(room) {
        // Bind data to local client
        GameManager.session.players = room.players;
        GameManager.session.eventDeck = room.eventDeck;
        GameManager.session.settings = room.settings;
        GameManager.session.mode = room.mode;
        GameManager.session.turn = room.turn;
        GameManager.session.facedown = true;

        if(GameManager.session.settings.takeTurns) {
          return DialogService.showAlert({
            'title': 'Choose your actions carefully.',
            'text': GameManager.session.players[GameManager.session.turn].name + '\'s turn is starting'
          })
          .then(function() {
            vm.selectedPlayer = room.turn;

          });
        }

        return Promise.resolve()
        .then(function() {
          vm.selectedPlayer = _.find(GameManager.session.players, {'deviceToken': GameManager.session.deviceToken}).index;
        });
      });

    }
  }

  function showHand() {
    if($mdMedia('gt-xs') || GameManager.session.deviceToken !== GameManager.session.players[GameManager.session.turn].deviceToken) {
      // Should already have hand visible
      return;
    }
    $mdBottomSheet.show({
      templateUrl: 'game/hand/hand.template.html',
      controller: 'HandController',
      controllerAs: 'hm',
      scope: $scope.$new()
    });
  }

  function switchDecks(id) {
    const decks = _.filter(GameManager.session.settings.decks, {'visible': true});
    vm.deckId = id || (vm.deckId + 1) % decks.length || 0;
    console.log(deckId);
    vm.deckChoice = decks[deckId].type;
    vm.otherDeck = deckId ? 'EVENT' : 'BURN'; // TODO make dynamic
  }

  /* External functions **/

  function drawEvent() {
    const card = GameManager.session.eventDeck[GameManager.session.totalTurns];
    if (GameManager.session.facedown) {
      // Parse card contents
      vm.eventCard.primary = vm.parser.render(card.primary, card);
      vm.eventCard.secondary = vm.parser.render(card.secondary, card);
      vm.eventCard.type = vm.parser.render(card.type, card);

        // Flip card up
      GameManager.session.facedown = false;
      return;

    }
    // Take status and trap cards
    if (card.type === 'trap') {
      Socket.emit('player:update', {
        room: GameManager.session.title,
        player: {
          index: GameManager.session.turn,
          pushCard: angular.toJson(card)
        }
      });
    }

    // Is regular card, flipped up. Continue to next player
    turnChange();
  }

  function drawBurn() {
    // Burning someone else
    if(!vm.burnCard.length) {
      // We can burn multiples now, so reset to the event deck automagically
      DialogService.showBurnInput($scope)
      .then(function() {
        vm.deckChoice = 0;
      });
      return;
    }

    // Handling own burn card

    // Flip face up
    if (vm.burnCard[0].facedown) {
      vm.burnCard[0].facedown = false;
      return;
    }

    // Take status and trap cards
    if (vm.burnCard[0].type === 'status') {
      GameManager.giveCardToPlayer(vm.burnCard[0], vm.burnCard[0].player);
    }

    // Remove top card
    vm.burnCard.splice(0, 1);

    // Bring up dialog if there's another card waiting
    if(vm.burnCard.length) {
      DialogService.showAlert({
        'text': GameManager.session.players[vm.burnCard[0].player].name + ' has been burned!'
      });
    }
  }

  function alertTurn() {
    return DialogService.showAlert({
      'text': 'It is ' + GameManager.session.players[GameManager.session.turn].name + '\'s turn.'
    });
  }
  function turnChange(index) {
    // If index is not set, select next player automagically
    index = index || (GameManager.session.turn + 1) % GameManager.session.players.length;
    Socket.emit('turn:set', {
      room: GameManager.session.title,
      index: index
    });
  }

  Socket.on('turn:changed', function(data) {
    console.log('on turn changed');
    vm.dialOpen = false;
    vm.selectedPlayer = data.turn;
    GameManager.session.turn = data.turn;
    GameManager.session.totalTurns = data.totalTurns;
    GameManager.session.facedown = true;
    // Is this account on my device?
    if(GameManager.session.deviceToken === GameManager.session.players[data.turn].deviceToken) {
      alertTurn();
    }
  });

  Socket.on('player:burned', function(cards) {
    console.log('On Player Burned');

    vm.burnCard = [];
    _.each(cards, function(card) {
      if(GameManager.session.deviceToken === GameManager.session.players[card.player].deviceToken) {
        // Target Player is on this device

        vm.burnCard.push(card);

        if(!card.empty) {
          _.last(vm.burnCard).facedown = true;
        }
      }
    });

    // TODO make empty cards work for multiple players
    if(vm.burnCard.length) {
      DialogService.showAlert({
        'text': GameManager.session.players[vm.burnCard[0].player].name + ' has been burned!'
      })
      .then(function() {
        if(vm.burnCard[0].empty) {
          vm.burnCard.splice(0, 1);
        }
      });
    }
  });

  Socket.on('player:updated', function(data) {
    console.log('Update Player');
    console.log(data);

    let player = GameManager.session.players[data.index];
    player = Object.assign(player, data);

    // If YOUR TURN and YOU HAVE STARTED THE GAME
    if(player.deviceToken === GameManager.session.deviceToken && vm.startEh) {
      // Check hand and table lengths
      // The hand (trap cards) should be no more than default 6
      const hand = GameManager.getHandByPlayer(data.index);
      if(hand.length > _.find(GameManager.session.settings.hands, {'type': 'trap'}).max) {
        DialogService.showAlert({
          'text': player.name + ' has more than ' + _.find(GameManager.session.settings.hands, {'type': 'trap'}).max + ' trap cards! Please discard one.'
        }).then(function() {
          vm.selectedPlayer = data.index;
          showHand();
        });
      }

      // The table (status cards) should be no more than default 3
      const table = GameManager.getTableByPlayer(data.index);
      if(table.length > _.find(GameManager.session.settings.hands, {'type': 'status'}).max) {
        DialogService.showAlert({
          'text': player.name + ' has more than ' + _.find(GameManager.session.settings.hands, {'type': 'status'}).max + ' status cards! Please discard one.'
        }).then(function() {
          vm.selectedPlayer = data.index;
          showHand();
        });
      }
    }
  });
}

function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
