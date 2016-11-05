angular.module('app', [
  'ngRoute',
  'ngResource',
  'ngMaterial',
  'appRoutes',
  'CardService',
  'CardCtrl',
  'GameCtrl',
  'GameService',
  'DialogService',
  'HandCtrl'
])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('red')
      .accentPalette('orange');
  });
