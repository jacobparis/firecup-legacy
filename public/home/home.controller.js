angular
  .module('Home', [])
  .controller('HomeController', [
    '$scope',
    '$state',
    '$mdMedia',
    'Analytics',
    HomeController
  ])
  .directive('createGame', CreateGame);

function HomeController($scope, $state, $mdMedia, Analytics) {
  $scope.$mdMedia = $mdMedia;
  $scope.selected;
  const vm = this;
  Analytics.trackPage('/');

  $scope.trackEvent = Analytics.trackEvent;

  vm.navigate = navigate;

  $scope.selected = '';

  function navigate(elem) {
    Analytics.trackEvent('navigate', elem);

    $scope.selected = elem;

  }
}

function CreateGame() {
  return {
    controller: 'GameSetupController',
    controllerAs: 'dm',
    templateUrl: 'home/home.directive.create.html',
    scope: {
      mode: '@mode'
    },
    replace: true
  };
}
