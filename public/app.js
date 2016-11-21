angular.module('app', [
  'ngRoute',
  'ngResource',
  'ngMaterial',
  'md.data.table',
  'appRoutes',
  'Home',
  'Card',
  'Game',
  'List',
  'DialogService',
  'HandCtrl'
])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('red')
      .accentPalette('orange');
  });
