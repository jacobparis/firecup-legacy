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
  this.getInvitableFriends = getInvitableFriends;
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
        resolve
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

  function getInvitableFriends(id) {
    id = id || 'me';
    return $q(function(resolve, reject) {
      FB.api(
        '/' + id + '/invitable_friends',
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
