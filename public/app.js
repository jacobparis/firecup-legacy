angular.module('app', [
  'ngRoute',
  'ngResource',
  'ngMaterial',
  'appRoutes',
  'Home',
  'Card',
  'Game',
  'DialogService',
  'HandCtrl'
])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('red')
      .accentPalette('orange');
  });
