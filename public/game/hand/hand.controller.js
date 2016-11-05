angular
  .module('HandCtrl', [])
  .controller('HandController', [
    '$scope',
    '$mdBottomSheet',
    'DialogService',
    'players',
    'selectedPlayer',
    'turn',
    HandController
  ]);

function HandController($scope, $mdBottomSheet, DialogService, players, selectedPlayer, turn) {
  var vm = this;
  vm.players = players;
  vm.hand = hand;
  vm.handClick = handClick;

  function hand() {
    //Should display all status and trap cards of current player
    //And all status cards of players when not their turn
    if (selectedPlayer == turn) {
      return players[selectedPlayer].hand;
    } else {
      var hand = [];
      for (var i = 0; i < players[selectedPlayer].hand.length; i++) {
        if (players[selectedPlayer].hand[i].type != "trap") {
          hand.push(players[selectedPlayer].hand[i]);
        }
      }
      return hand;
    }

  }

  function handClick(item) {
    DialogService.showHandInput(selectedPlayer, item);
  }
}
