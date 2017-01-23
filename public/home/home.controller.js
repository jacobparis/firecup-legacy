angular
  .module('Home', [])
  .controller('HomeController', [
    '$scope',
    '$state',
    '$mdMedia',
    'Analytics',
    HomeController
  ]);

function HomeController($scope, $state, $mdMedia, Analytics) {
  $scope.$mdMedia = $mdMedia;
  const vm = this;
  Analytics.trackPage('/');

  $scope.trackEvent = Analytics.trackEvent;

}
