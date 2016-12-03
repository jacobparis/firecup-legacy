angular
  .module('HandCtrl', [])
  .controller('HandController', [
    '$scope',
    '$mdBottomSheet',
    'DialogService',
    'GameManager',
    HandController
  ])
  .directive('handsheet', HandDirective);

function HandController($scope, $mdBottomSheet, DialogService, GameManager) {
  const hm = this;
  hm.hand = hand;
  hm.handCards = 0;
  hm.table = table;
  hm.tableCards = 0;
  hm.handClick = handClick;
  $scope.logscope = function() {
    console.log($scope);
    return true;
  };

  $scope.game = GameManager;

  $scope.$watch('$parent.vm.selectedPlayer', function(delta, prime) {
    hand();
    table();
  });

  $scope.$watch('$parent.vm.smiteCard.user', function(delta, prime) {
    hand();
    table();
  });

  function hand() {
    // Should display all status and trap cards of current player
    const player = $scope.$parent.vm.selectedPlayer;
    const hand = GameManager.getHandByPlayer(player);

    if(hand) {
      hm.handCards = hand.length;
    }
    return hand;
  }

  function table() {
    const player = $scope.$parent.vm.selectedPlayer;
    if(GameManager.session.players[player]) {
      const table = GameManager.session.players[player].hand;
      hm.tableCards = table.length;
    }
    return table;
  }

  function handClick(item) {
    console.log(item);
    DialogService.showHandInput($scope.$parent.vm.selectedPlayer, item);
  }
}

function HandDirective() {
  return {
    templateUrl: 'game/hand/hand.template.html',
    controller: 'HandController',
    controllerAs: 'hm',
    scope: {
      selectedPlayer: '@',
      turn: '@'
    }
  };
}
