angular.module('app', [
  'ngRoute',
  'ngResource',
  'ngMaterial',
  'appRoutes',
  'Home',
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
