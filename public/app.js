angular.module('app', [
  'ngRoute',
  'ngResource',
  'ngMaterial',
  'ui.router',
  'md.data.table',
  'angular-google-analytics',
  'facebook',
  'material.components.expansionPanels',
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
    'FacebookProvider',
    Config
  ]);

function Config($mdThemingProvider, AnalyticsProvider, FacebookProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('red')
    .accentPalette('orange');

  AnalyticsProvider.setAccount({
    'tracker': 'UA-74937612-2',
    'name': 'tracker1',
    'trackEvent': true
  });

  TOKENS = {
    fb: '1891222457802172'
  };
  FacebookProvider.init(TOKENS.fb);
}
