angular
  .module('app')
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    'AnalyticsProvider',
    'ngMetaProvider',
    Routes
  ]);

function Routes($stateProvider, $urlRouterProvider, $locationProvider, AnalyticsProvider, ngMetaProvider) {
  AnalyticsProvider.trackUrlParams(true);

  $locationProvider.html5Mode(true);
  $stateProvider
    .state('cards', {
      url: '/cards/',
      templateUrl: 'card/card.view.html',
      controller: 'CardController',
      controllerAs: 'vm'
    })
    .state('gameSetup', {
      url: '/game/',
      templateUrl: 'game/game.setup.html',
      controller: 'GameSetupController',
      controllerAs: 'vm',
      params: {
        mode: null,
        themes: []
      },
      data: {
        meta: {
          'url': 'http://firecup.ca/'
        }
      }
    })
    .state('game', {
      url: '/game/:title',
      templateUrl: 'game/game.view.html',
      controller: 'GameController',
      controllerAs: 'vm',
      data: {
        meta: {
          'url': 'http://firecup.ca/'
        }
      }
    })
    .state('gameSettings', {
      url: '/game/:title/settings',
      templateUrl: 'game/game.settings.html',
      controller: 'SettingsController',
      controllerAs: 'vm',
      data: {
        meta: {
          'url': 'http://firecup.ca/'
        }
      }
    })
    .state('welcome', {
      url: '/welcome/:title',
      templateUrl: 'game/game.onboard.html',
      controller: 'OnboardController',
      controllerAs: 'vm',
      data: {
        meta: {
          'url': 'http://firecup.ca/'
        }
      }
    })
    .state('list', {
      url: '/list/',
      templateUrl: 'list/list.view.html',
      controller: 'ListController',
      controllerAs: 'vm',
      data: {
        meta: {
          'url': 'http://firecup.ca/'
        }
      }
    })
    .state('home', {
      url: '/',
      templateUrl: 'home/home.view.html',
      controller: 'HomeController',
      controllerAs: 'vm',
      data: {
        meta: {
          'url': 'http://firecup.ca/'
        }
      }
    })
    .state('home2', {
      url: '/new/',
      templateUrl: 'home/home2.view.html',
      controller: 'HomeController',
      controllerAs: 'vm',
      data: {
        meta: {
          'url': 'http://firecup.ca/'
        }
      }
    });

}
