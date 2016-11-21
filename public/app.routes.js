angular
  .module('appRoutes', [])
  .config([
    '$routeProvider',
    '$locationProvider',
    Routes
  ]);

function Routes($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'home/home.view.html',
      controller: 'HomeController',
      controllerAs: 'vm'
    })
    .when('/cards', {
      templateUrl: 'card/card.view.html',
      controller: 'CardController',
      controllerAs: 'vm'
    })
    .when('/game', {
      templateUrl: 'game/game.view.html',
      controller: 'GameController',
      controllerAs: 'vm'
    })
    .when('/list', {
      templateUrl: 'list/list.view.html',
      controller: 'ListController',
      controllerAs: 'vm'
    });

  $locationProvider.html5Mode(true);
}
