angular
  .module('Home', [])
  .controller('HomeController',[
    '$scope',
    '$mdMedia',
    'Analytics',
    HomeController
  ]);

function HomeController($scope, $mdMedia, Analytics) {
  $scope.$mdMedia = $mdMedia;
  var vm = this;
  Analytics.trackPage('/');
}
