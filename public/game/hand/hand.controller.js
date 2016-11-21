angular
  .module('HandCtrl', [])
  .controller('HandController', [
    '$scope',
    '$mdBottomSheet',
    'DialogService',
    'PlayerService',
    HandController
  ])
  .directive('handsheet', HandDirective);

function HandController($scope, $mdBottomSheet, DialogService, PlayerService) {
  var hm = this;
  hm.hand = hand;
  hm.handCards = 0;
  hm.table = table;
  hm.tableCards = 0;
  hm.handClick = handClick;
  $scope.logscope = function () {
    console.log("HAND: " + $scope);
  };

  $scope.$watch('$parent.vm.selectedPlayer', function (delta, prime) {
    hand();
    table();
  });

  $scope.$watch('$parent.vm.smiteCard.user', function (delta, prime) {
    hand();
    table();
  });

  function hand() {
    //Should display all status and trap cards of current player
    var player = $scope.$parent.vm.selectedPlayer;
    var hand = PlayerService.getHand(player);
    hm.handCards = hand.length;
    return hand;
  }

  function table() {
    var player = $scope.$parent.vm.selectedPlayer;
    var table = PlayerService.getTable(player);
    hm.tableCards = table.length;
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
