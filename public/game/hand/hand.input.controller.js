angular
  .module('HandCtrl')
  .controller('HandInputController', [
    '$scope',
    '$mdDialog',
    'DialogService',
    'GameManager',
    'Socket',
    'player',
    'card',
    HandInputController
  ]);

function HandInputController($scope, $mdDialog, DialogService, GameManager, Socket, player, card) {
  const vm = this;
  vm.otherPlayers = OtherPlayers;
  vm.openPlayerMenu = openPlayerMenu;
  vm.cancel = cancel;
  vm.discard = discard;
  vm.giveCard = giveCard;

  function OtherPlayers() {
    const players = GameManager.session.players;
    const otherPlayers = players.slice(0);
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
    Socket.emit('player:update', {
      room: GameManager.session.title,
      player: {
        index: player,
        pullCard: card._id
      }
    });
    $mdDialog.cancel();
  }

  function giveCard(id) {
    console.log(id);
    Socket.emit('player:update', {
      room: GameManager.session.title,
      player: {
        index: id,
        pushCard: angular.toJson(card)
      }
    });
    discard();
  }

}
