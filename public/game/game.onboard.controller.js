angular
  .module('Game')
  .controller('OnboardController', [
    '$scope',
    'Socket',
    'Facebook',
    'FBService',
    'DialogService',
    'GameManager',
    OnboardController
  ]);

function OnboardController($scope, Socket, Facebook, FBService, DialogService, GameManager) {
  const vm = this;
  $scope.Facebook = Facebook;
  vm.facebook = {
    fbLogin: false,
    name: 'friend!',
    id: 0,
    picture: ''
  };

  vm.logout = logout;
  vm.login = login;

  (function() {
    checkLoginStatus();
  })();

  function checkLoginStatus() {
    console.log('Check login status');
    return Facebook.getLoginStatus(function(response) {
      if(response.status === 'connected') {
        vm.facebook.fbLogin = true;
        return FBService.getUser('me')
        .then(function(result) {
          vm.facebook.name = result.name;
          vm.facebook.id = result.id;
          console.log(result);
          FBService.getProfilePicture()
          .then(function(pic) {
            console.log(pic);
            vm.facebook.picture = pic.data.url;
          });
        });
      }
      vm.facebook.fbLogin = false;
    });
  }
  function logout() {
    Facebook.logout(function(response) {
      checkLoginStatus()
      .then(console.log);
    });
  }

  function login() {
    Facebook.login(function(response) {
      checkLoginStatus()
      .then(console.log);
    });
  }
}
