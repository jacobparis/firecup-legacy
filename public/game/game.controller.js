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
    'GameManager',
    'DeckService',
    'DialogService',
    'PlayerService',
    'Analytics',
    GameController
  ]);

function GameController($scope, $q, $mdDialog, $mdBottomSheet, $mdMedia, $state, $timeout, GameManager, DeckService, DialogService, PlayerService, Analytics) {
  Analytics.trackPage('/game');
  // Lock scrolling hack
//  angular.element(document.body).addClass("noscroll");
  $scope.$mdMedia = $mdMedia;
  $scope.game = GameManager;
  $scope.logscope = function() {
    console.log($scope);
    return true;
  };

  const vm = this;
  /* Properties **/
  vm.selectedPlayer = 0;
  vm.eventCard = {};
  vm.smiteCard = {
    facedown: true
  };
  vm.dialOpen = false;
  vm.showGridBottomSheet = showHand;

  vm.click = {x: 0, y: 0};
  vm.switchDecks = switchDecks;
  vm.otherDeck = 'SMITE';
  vm.deckChoice = 0;

  vm.drawEvent = drawEvent;
  vm.drawSmite = drawSmite;
  vm.setSmitePlayer = setSmitePlayer;
  vm.autoSmite = false;

  vm.turnChange = turnChange;

  vm.smite = smite;
  vm.startGame = activate;
  vm.startEh = false;

  activate();

  function activate() {
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
        console.log('Game Start!');
      });
    }

    function createOrJoin() {
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
      return GameManager.getGame(1)
      .then(function(result) {
        console.log(result);
        vm.smiteDeck = result.smiteDeck;
        vm.smiteCard = vm.smiteDeck.splice(randomIndex(vm.smiteDeck), 1)[0];
        vm.smiteCard.user = {
          name: ''
        };
        vm.selectedPlayer = GameManager.session.turn;
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

      return DialogService.showAlert({
        'title': 'Choose your actions carefully.',
        'text': GameManager.session.players[GameManager.session.turn].name + '\'s turn is starting'
      });
    }
  }

  function showHand() {
    $mdBottomSheet.show({
      templateUrl: 'game/hand/hand.template.html',
      controller: 'HandController',
      controllerAs: 'hm',
      scope: $scope.$new()
    });
  }

  function switchDecks(id) {
    const deckId = id || (vm.deckChoice + 1) % 2;
    console.log(deckId);
    vm.deckChoice = deckId;
    vm.otherDeck = deckId ? 'EVENT' : 'SMITE';
  }

  /* External functions **/

  function drawEvent() {
    const card = GameManager.session.eventDeck[GameManager.session.totalTurns];
    if (GameManager.session.facedown) {
      // Parse card contents
      vm.eventCard.primary = vm.parser.render(card.primary);
      vm.eventCard.secondary = vm.parser.render(card.secondary);
      vm.eventCard.type = vm.parser.render(card.type);

        // Flip card up
      GameManager.session.facedown = false;
      return;

    }
    // Take status and trap cards
    if (card.type === 'trap') {
      GameManager.giveCardToPlayer(card, GameManager.session.turn);
    }

    // Is regular card, flipped up. Continue to next player
    turnChange();
  }

  function parseEvent(turn) {
    game.session.eventDeck[game.session.totalTurns];
  }
  function setSmitePlayer(player) {
    vm.smiteCard.user = player;
  }

  function drawSmite() {
    // If no user is set
    if (!vm.smiteCard.user.name) {
      if(vm.autoSmite) {
        GameManager.giveCardToPlayer(vm.smiteCard, vm.selectedIndex);
        return;
      }

      // Just pass the selected player index to smite input
      DialogService.showSmiteInput($scope);
      return;

    }

    // Take status and trap cards
    if (vm.smiteCard.type === 'status') {
      GameManager.giveCardToPlayer(vm.smiteCard, vm.smiteCard.user.index);
    }

    // Deliver card to recipient
    // Grab new card from deck
    vm.smiteCard = vm.smiteDeck.splice(randomIndex(vm.smiteDeck), 1)[0];
    vm.smiteCard.user = {
      name: ''
    };
  }

  function smite() {
    vm.dialOpen = false;
  }

  /* Internal functions **/

  function turnChange(player) {
    GameManager.turnChange(player)
    .then(function(data) {
      console.log(data);
      vm.dialOpen = false;
      vm.selectedPlayer = Number(data.turn);
       // TODO Somehow selectedPlayer gets reset immediately in the watcher loop
      DialogService.showAlert({
        'text': GameManager.session.players[Number(data.turn)].name + '\'s turn is starting'
      });
    });
  }
}

function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
