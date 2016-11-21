angular.module('app', [
  'ngRoute',
  'ngResource',
  'ngMaterial',
  'md.data.table',
  'angular-google-analytics',
  'appRoutes',
  'Home',
  'Card',
  'Game',
  'List',
  'DialogService',
  'HandCtrl'
])
  .config([
    '$mdThemingProvider',
    'AnalyticsProvider',
    Config
  ]);

  function Config($mdThemingProvider, AnalyticsProvider) {
    $mdThemingProvider.theme('default')
    .primaryPalette('red')
    .accentPalette('orange');

    AnalyticsProvider.setAccount({
      "tracker": 'UA-74937612-2',
      "name": 'tracker1',
      "trackEvent": true
    });
  }
