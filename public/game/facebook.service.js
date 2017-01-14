angular
  .module('Game')
  .service('FBService', [
    'Facebook',
    '$q',
    FBService
  ]);

function FBService(Facebook, $q) {
  console.log('INIT');
  this.getUser = getUser;
  this.getProfilePicture = getProfilePicture;
  this.getFriends = getFriends;
  this.getPermissions = getPermissions;
  this.getScores = getScores;

  function getScores(id) {
    id = id || 'me';
    return $q(function(resolve, reject) {
      FB.api(
        '/' + id + '/scores',
        function(response) {
          resolve(response);
        }
      );
    });
  }
  function getUser(id) {
    id = id || 'me';
    return $q(function(resolve, reject) {
      FB.api(
        '/' + id,
        function(response) {
          resolve(response);
        }
      );
    });
  }

  function getProfilePicture(id) {
    id = id || 'me';
    return $q(function(resolve, reject) {
      FB.api(
        '/' + id + '/picture',
        function(response) {
          resolve(response);
        }
      );
    });
  }

  function getFriends(id) {
    id = id || 'me';
    return $q(function(resolve, reject) {
      FB.api(
        '/' + id + '/friends',
        function(response) {
          resolve(response);
        }
      );
    });
  }

  function getPermissions(id) {
    id = id || 'me';
    return $q(function(resolve, reject) {
      FB.api(
        '/' + id + '/permissions',
        function(response) {
          resolve(response);
        }
      );
    });
  }

}
