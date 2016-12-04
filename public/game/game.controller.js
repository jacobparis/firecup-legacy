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
  vm.smiteCard = {};
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
    if($state.params.title.length == 0) {
      createOrJoin()
      .then(showCreateDialog, showJoinPrompt);
    }
    else {
      joinGame()
      .then(showAddPlayers)
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
    function showCreateDialog(e) {
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
    })
    .then(function(clickedItem) {
    });
  }

  function switchDecks(id) {
    const deckId = id || (vm.deckChoice + 1) % 2;
    console.log(deckId);
    vm.deckChoice = deckId;
    vm.otherDeck = deckId ? 'EVENT' : 'SMITE';
  }

  /* External functions **/

  function drawEvent(e) {
    if (GameManager.session.eventCard.facedown) {
      GameManager.session.eventCard.facedown = false;
      return;
    }
    // Take status and trap cards
    if (GameManager.session.eventCard.type === 'trap') {
      GameManager.giveCardToPlayer(GameManager.session.eventCard, GameManager.session.turn);
      return turnChange();
    }

    // Is regular card, flipped up. Continue to next player
    return turnChange();
  }

  function setSmitePlayer(player) {
    vm.smiteCard.user = player;
  }

  function drawSmite($mdOpenMenu, e) {
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

  function smite(player) {
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
