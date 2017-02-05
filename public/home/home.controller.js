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
  const vm = this;
  Analytics.trackPage('/');

  $scope.trackEvent = Analytics.trackEvent;

  vm.navigate = navigate;
  vm.open = open;
  vm.joinGame = joinGame;

  vm.activity;
  $scope.selected = '';

  function navigate(elem) {
    Analytics.trackEvent('navigate', elem);

    $scope.selected = elem;

  }

  function open(tag) {
    if($scope.selected === tag) {
      $scope.selected = '';
    }
    else {
      $scope.selected = tag;
    }

  }

  function joinGame() {
    console.log('Join' + vm.gamecode);
    $state.go('game', {title: vm.gamecode});
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
