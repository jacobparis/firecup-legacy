angular
  .module('Game')
  .controller('SmiteInputController', [
    '$scope',
    '$mdDialog',
    'DialogService',
    'PlayerService',
    SmiteInputController
  ]);

function SmiteInputController($scope, $mdDialog, DialogService, PlayerService) {
  var sm = this;

  sm.players = function () { return PlayerService.getPlayers(); };
  sm.selectPlayer = selectPlayer;
  sm.selectedPlayer = $scope.vm.selectedPlayer; // $scope.pvm.selectedPlayer;
  sm.autoselect = autoselect;
  sm.cancel = $mdDialog.cancel;
  sm.smitePlayer = smitePlayer;
  console.log($scope);
  function selectPlayer(player) {
    $scope.vm.autoSmite = false;
    sm.selectedPlayer = player;
    console.log($scope.vm.autoSmite);
  }

  function autoselect() {
    //sm.auto updates after this function
    sm.selectedPlayer = $scope.vm.selectedPlayer;
  }

  function cancel() {
    console.log(card);
    $mdDialog.cancel();
  }

  function smitePlayer() {
    $scope.vm.smiteCard.user = sm.players()[sm.selectedPlayer];
    console.log($scope.vm.smiteCard.user);
    $mdDialog.cancel();
  }
}
