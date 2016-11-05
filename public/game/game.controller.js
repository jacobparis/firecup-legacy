angular
  .module('GameCtrl', [])
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
  var vm = this;
  /* Properties **/

  vm.turn = 0;
  vm.eventDeck = [];
  vm.consequenceDeck = [];
  vm.selectedPlayer = vm.turn;
  vm.players = PlayerService.getPlayers();
  vm.dialOpen = false;
  vm.showGridBottomSheet = showHand;
  vm.newDeck = newDeck;
  vm.click = click;
  vm.setTurn = setTurn;
  vm.setCard = setCard;
  vm.smite = smite;
  vm.hand = hand;
  vm.startGame = activate;

  activate();

  function activate() {
    $q.all([
        vm.newDeck('event'),
        vm.newDeck('consequence')
      ])
      .then(function() {
        newCard('event');
        DialogService.showAlert({
            "title": "Choose your actions carefully.",
            "text": PlayerService.getPlayer(vm.turn)
              .name + "'s turn is starting"
          })
          .then(function() {
            console.log('Game Start!');
          });
      });
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
    vm.handLength = PlayerService.getHandSize(vm.selectedPlayer);
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
