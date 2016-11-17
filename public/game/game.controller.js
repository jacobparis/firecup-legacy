angular
  .module('Game', [])

  .controller('GameController', [
    '$scope',
    '$q',
    '$mdDialog',
    '$mdBottomSheet',
    '$mdMedia',
    'DeckService',
    'DialogService',
    'PlayerService',
    GameController
  ]);

function GameController($scope, $q, $mdDialog, $mdBottomSheet, $mdMedia, DeckService, DialogService, PlayerService) {
  //Lock scrolling hack
//  angular.element(document.body).addClass("noscroll");
  $scope.$mdMedia = $mdMedia;
  $scope.logscope = function () {
    console.log($scope);
  };
  var vm = this;
  /* Properties **/

  vm.turn = 0;
  vm.eventDeck = [];
  vm.smiteDeck = [];
  vm.selectedPlayer = vm.turn;
  vm.selectedPlayerName = playerName;
  vm.selectedHand = 4;
  vm.playerNames = [];
  vm.players = PlayerService.getPlayers();
  vm.dialOpen = false;
  vm.showGridBottomSheet = showHand;
  vm.newDeck = newDeck;

  vm.drawEvent = drawEvent;
  vm.drawSmite = drawSmite;

  vm.turnChange = turnChange;
  vm.getRandomEventCard = getRandomEventCard;
  vm.getRandomSmiteCard = getRandomSmiteCard;

  vm.smite = smite;
  vm.startGame = activate;
  vm.startEh = false;

  activate();

  function activate() {
    showAddPlayerPrompt(true) //true means 5 random players, no dialog
      .then(buildDecks)
      .then(firstDeal)
      .then(function() {
        vm.startEh = true;
        console.log('Game Start!');
      });

    function showAddPlayerPrompt(debug) {
      if(debug) {
        return PlayerService.demoPlayers();
      }
      var prompt = {
          "text": "What is your first player's name?",
          "input": "Player Name",
          "confirm": "Add Player"
        };

      if(vm.playerNames.length > 0) {
        prompt.text = "What is the next player's name?";
        prompt.input = "Player " + (vm.playerNames.length + 1) + " Name";
        prompt.cancel = "That's everyone";
      }
      return DialogService.showPrompt(prompt).then(addPlayer, registerPlayers);
    }

    function addPlayer(name) {
      vm.playerNames.push(name);
      return showAddPlayerPrompt();
    }

    function registerPlayers() {
      return PlayerService.addPlayers(vm.playerNames);
    }

    function buildDecks() {
      console.log(vm.playerNames);
      return $q.all([
        vm.newDeck('event'),
        vm.newDeck('smite')
      ]);
    }

    function firstDeal() {
      getRandomEventCard().then(function (card) {
        vm.eventCard = card;
      });

      getRandomSmiteCard().then(function (card) {
        vm.smiteCard = card;
      });

      return DialogService.showAlert({
        "title": "Choose your actions carefully.",
        "text": PlayerService.getPlayer(vm.turn)
          .name + "'s turn is starting"
      });
    }
  }

  function playerName() {
    return PlayerService.getPlayer(vm.selectedPlayer).name;
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

  function newDeck(deck) {
    return $q(function(resolve, reject) {
      if (deck == "event") {
        DeckService.getDeck('event')
          .then(function(eventDeck) {
            //Returns a shuffled list of all the event cards
            resolve(vm.eventDeck = eventDeck);
          });
      }

      if (deck == "smite") {
        DeckService.getDeck('smite')
          .then(function(smiteDeck) {
            //Returns a shuffled list of all the event cards

            resolve(vm.smiteDeck = smiteDeck);
          });
      }
    });

  }

  /* External functions **/


  function drawEvent(e) {
    if (vm.eventCard.facedown) {
      vm.eventCard.facedown = false;
      return;
    }
    //Take status and trap cards
    if (vm.eventCard.type == "trap") {
      PlayerService.giveCard(vm.selectedPlayer, vm.eventCard);
      return turnChange();
    }

    getRandomEventCard().then(function (card) {
      vm.eventCard = card;
      return turnChange();
    });
  }

  function drawSmite(e) {
    if (vm.smiteCard.facedown) {
      vm.smiteCard.facedown = false;
      return;
    }

    //Take status and trap cards
    if (vm.smiteCard.type == "status") {
      PlayerService.giveCard(vm.selectedPlayer, vm.smiteCard);
      return;
    }

    getRandomSmiteCard().then(function (card) {
      vm.smiteCard = card;
    });
  }



  function smite(player) {
    vm.dialOpen = false;

    getRandomSmiteCard().then(function (card) {
      vm.smiteCard = card;
    });
  }

  /* Internal functions **/

  function turnChange(player) {
      player = player || (vm.turn + 1) % PlayerService.getNumberOfPlayers();
      vm.turn = player;
      vm.dialOpen = false;
      vm.selectedPlayer = vm.turn;
      DialogService.showAlert({
        "text": PlayerService.getPlayer(vm.turn)
        .name + "'s turn is starting"
      });

      getRandomEventCard()
      .then(function (card) {
        vm.eventCard = card;
      });
  }

  function getRandomEventCard() {
    return $q(function(resolve, reject) {
      var card = vm.eventDeck.splice(randomIndex(vm.eventDeck.length - 1), 1)[0];
      card.facedown = true;

      //Shuffle deck if low
      if (vm.eventDeck.length < 3) {
        vm.newDeck(deck);
      }

      resolve(card);
    });
  }

  function getRandomSmiteCard() {
    return $q(function(resolve, reject) {
      var card = vm.smiteDeck.splice(randomIndex(vm.smiteDeck.length - 1), 1)[0];
      card.facedown = true;

      //Shuffle deck if low
      if (vm.smiteDeck.length < 3) {
        vm.newDeck(deck);
      }

      resolve(card);
    });
  }
}



function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
