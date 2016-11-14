angular
  .module('Game', [])

  .controller('GameController', [
    '$scope',
    '$q',
    '$mdDialog',
    '$mdBottomSheet',
    'DeckService',
    'DialogService',
    'PlayerService',
    GameController
  ]);

function GameController($scope, $q, $mdDialog, $mdBottomSheet, DeckService, DialogService, PlayerService) {
  //Lock scrolling hack
  angular.element(document.body).addClass("noscroll");

  var vm = this;
  /* Properties **/

  vm.turn = 0;
  vm.eventDeck = [];
  vm.consequenceDeck = [];
  vm.selectedPlayer = vm.turn;
  vm.selectedPlayerName = playerName;
  vm.selectedHand = 4;
  vm.playerNames = [];
  vm.players = PlayerService.getPlayers();
  vm.dialOpen = false;
  vm.showGridBottomSheet = showHand;
  vm.newDeck = newDeck;
  vm.click = click;
  vm.setTurn = setTurn;
  vm.setCard = setCard;
  vm.smite = smite;
  vm.hand = hand;
  vm.handClick = handClick;
  vm.startGame = activate;
  vm.startEh = false;

  activate();

  function activate() {
    showAddPlayerPrompt()
      .then(buildDecks)
      .then(firstDeal)
      .then(function() {
        vm.startEh = true;
        console.log('Game Start!');
      });

    function showAddPlayerPrompt() {
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
        vm.newDeck('consequence')
      ]);
    }

    function firstDeal() {
      newCard('event');
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
        controllerAs: 'vm',
        locals: {
          players: PlayerService.getPlayers(),
          selectedPlayer: vm.selectedPlayer,
          turn: vm.turn
        }
      })
      .then(function(clickedItem) {});
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

      if (deck == "consequence") {
        DeckService.getDeck('consequence')
          .then(function(consequenceDeck) {
            //Returns a shuffled list of all the event cards

            resolve(vm.consequenceDeck = consequenceDeck);
          });
      }
    });

  }

  /* External functions **/


  function click(e) {
    if (vm.facedown) {
      //Flip card
      vm.facedown = false;
    } else {
      if (vm.card.type == "status" ||
        vm.card.type == "trap") {
        //Take status and trap cards
        vm.setCard(vm.selectedPlayer);
      } else {
        //Discard other cards, continue to next player
        nextTurn();
        newCard('event');
      }
    }
  }


  function setTurn(player) {
    vm.turn = player;
    vm.dialOpen = false;
    vm.selectedPlayer = vm.turn;
    DialogService.showAlert({
      "text": PlayerService.getPlayer(vm.turn)
        .name + "'s turn is starting"
    });
    newCard('event');
  }



  function setCard(player) {
    vm.dialOpen = false;

    PlayerService.giveCard(player, vm.card);
    nextTurn();
    newCard('event');
  }



  function smite(player) {
    vm.dialOpen = false;
    newCard('consequence');
  }



  function hand() {
    //Should display all status and trap cards of current player
      vm.handLength = PlayerService.getHandSize(vm.selectedPlayer);
      return PlayerService.getHand(vm.selectedPlayer);
  }

  function handClick(item, index) {
    if(vm.selectedHand == index) {
      DialogService.showHandInput(vm.selectedPlayer, item);
    } else {
      vm.selectedHand = index;

    }

  }

  /* Internal functions **/

  var nextTurn = function() {
    vm.turn = (vm.turn + 1) % PlayerService.getNumberOfPlayers();
    vm.selectedPlayer = vm.turn;
    DialogService.showAlert({
      "text": PlayerService.getPlayer(vm.turn)
        .name + "'s turn is starting"
    });
    vm.hand();
  };

  var newCard = function(deck) {
    return $q(function(resolve, reject) {
      if (deck == "event") {
        vm.card = vm.eventDeck.splice(randomIndex(vm.eventDeck.length - 1), 1)[0];
        resolve(vm.card);
        vm.facedown = true;
        if (vm.eventDeck.length < 3) {
          vm.newDeck(deck);
        }
      } else if (deck == "consequence") {
        vm.card = vm.consequenceDeck.splice(randomIndex(vm.consequenceDeck.length - 1), 1)[0];
        resolve(vm.card);
        vm.facedown = true;
        if (vm.consequenceDeck.length < 3) {
          vm.newDeck(deck);
        }
      } else {
        reject(new Error(500, "No deck found."));
      }
    });
  };

}



function randomIndex(array) {
  return Math.floor(Math.random() * (array.length));
}
