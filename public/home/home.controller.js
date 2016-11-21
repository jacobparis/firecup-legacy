angular
  .module('Home', [])
  .controller('HomeController',[
    '$scope',
    '$mdMedia',
    HomeController
  ]);

function HomeController($scope, $mdMedia) {
  $scope.$mdMedia = $mdMedia;
  var vm = this;
  Analytics.trackPage('/');
}
