angular
  .module('Home', [])
  .controller('HomeController',[
    HomeController
  ]);

function HomeController() {
  var vm = this;

  vm.intro = "Welcome!";
}
