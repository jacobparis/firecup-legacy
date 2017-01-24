angular.module('app', [
  'ngRoute',
  'ngResource',
  'ngMaterial',
  'ngMeta',
  'ui.router',
  'md.data.table',
  'angular-google-analytics',
  'angular.bootstrap.feedback',
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
  ])
  .run(['ngMeta', function(ngMeta) {
    ngMeta.init();
  }]);
function Config($mdThemingProvider, AnalyticsProvider, FacebookProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('red')
    .accentPalette('orange');

  $mdThemingProvider.theme('facebook')
    .primaryPalette('indigo');

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
