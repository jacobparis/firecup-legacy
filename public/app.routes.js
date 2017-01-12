angular
  .module('app')
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    'AnalyticsProvider',
    Routes
  ]);

function Routes($stateProvider, $urlRouterProvider, $locationProvider, AnalyticsProvider) {
  AnalyticsProvider.trackUrlParams(true);

  $locationProvider.html5Mode(true);
  $stateProvider
    .state('cards', {
      url: '/cards/',
      templateUrl: 'card/card.view.html',
      controller: 'CardController',
      controllerAs: 'vm'
    })
    .state('game', {
      url: '/game/:title?',
      templateUrl: 'game/game.view.html',
      controller: 'GameController',
      controllerAs: 'vm',
    })
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'game/game.onboard.html',
      controller: 'OnboardController',
      controllerAs: 'vm'
    })
    .state('list', {
      url: '/list/',
      templateUrl: 'list/list.view.html',
      controller: 'ListController',
      controllerAs: 'vm'
    });

}
