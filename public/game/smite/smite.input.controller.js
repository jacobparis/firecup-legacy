angular
  .module('Game')
  .controller('SmiteInputController', [
    '$scope',
    '$mdDialog',
    'DialogService',
    'GameManager',
    SmiteInputController
  ]);

function SmiteInputController($scope, $mdDialog, DialogService, GameManager) {
  const sm = this;
  $scope.game = GameManager;
  sm.selectPlayer = selectPlayer;
  sm.selectedPlayer = $scope.vm.selectedPlayer; // $scope.pvm.selectedPlayer;
  sm.autoselect = autoselect;
  sm.cancel = $mdDialog.cancel;
  sm.smitePlayer = smitePlayer;
  console.log($scope);
  function selectPlayer(player) {
    $scope.vm.autoSmite = false;
    sm.selectedPlayer = player;
  }

  function autoselect() {
    // sm.auto updates after this function
    sm.selectedPlayer = $scope.vm.selectedPlayer;
  }

  function cancel() {
    console.log(card);
    $mdDialog.cancel();
  }

  function smitePlayer() {
    $scope.vm.smiteCard.user = GameManager.session.players[sm.selectedPlayer];
    console.log($scope.vm.smiteCard);
    $mdDialog.cancel();
  }
}
