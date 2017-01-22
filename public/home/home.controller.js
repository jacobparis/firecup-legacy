angular
  .module('Home', [])
  .controller('HomeController', [
    '$scope',
    '$state',
    '$mdMedia',
    'Analytics',
    HomeController
  ]);

function HomeController($scope, $state, $mdMedia, Analytics) {
  $scope.$mdMedia = $mdMedia;
  const vm = this;
  Analytics.trackPage('/');

  vm.playFirecup = playFirecup;

  function playFirecup() {
    $state.go('gameSetup', {mode: 'firecup'});
  }
}
