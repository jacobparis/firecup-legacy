angular
  .module('Game')
  .controller('OnboardController', [
    '$scope',
    'Socket',
    'DialogService',
    'GameManager',
    OnboardController
  ]);

function OnboardController($scope, Socket, DialogService, GameManager) {
  const vm = this;

}
