angular
  .module('HandCtrl')
  .controller('HandInputController', [
    '$scope',
    '$mdDialog',
    'DialogService',
    'PlayerService',
    'player',
    'card',
    HandInputController
  ]);

function HandInputController($scope, $mdDialog, DialogService, PlayerService, player, card) {
  var vm = this;
  vm.otherPlayers = OtherPlayers;
  vm.openPlayerMenu = openPlayerMenu;
  vm.cancel = cancel;
  vm.discard = discard;
  vm.giveCard = giveCard;

  function OtherPlayers() {
    var players = PlayerService.getPlayers();
    var otherPlayers = players.slice(0);
    otherPlayers.splice(player, 1);
    return otherPlayers;
  }

  function openPlayerMenu($mdOpenMenu, ev) {
    console.log('yeah');
    originatorEv = ev;
    $mdOpenMenu(ev);
  }

  function cancel() {
    console.log(card);
    $mdDialog.cancel();
  }

  function discard() {
    PlayerService.discard(player, card);

    $mdDialog.cancel();
  }

  function giveCard(id) {
    PlayerService.giveCard(id, card);
    PlayerService.discard(player, card);
    $mdDialog.cancel();
  }


}
