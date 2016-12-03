angular
  .module('Game')
  .controller('GameSetupController', [
    '$scope',
    '$q',
    '$mdDialog',
    'GameManager',
    GameSetupController
  ]);

function GameSetupController($scope, $q, $mdDialog, GameManager) {
  const dm = this;
  $scope.game = GameManager;
  dm.createGame = createGame;
  dm.players = [];
  dm.addPlayer = addPlayer;
  dm.confirmPlayers = confirmPlayers;
  dm.newPlayerName;

  dm.cancel = $mdDialog.cancel;
  dm.settings = {
    'mode': 0
  };

  dm.modes = [
    {
      'name': 'Classic',
      'desc': 'An enhanced version of the game known widely by names like King\'s Cup, Sociables, Ring of Fire, Circle of Death, and many more.',
      'settings': {

      }
    }
  ];

  activate();

  function activate() {
    GameManager.getGame()
      .then(function(result) {
        if(!result) {return;}

        dm.players = result.players;
      },
      function() {
        dm.players = [];
      });
  }
  function createGame() {
    $mdDialog.hide(dm.settings);
  }

  function addPlayer() {
    GameManager.addPlayer(dm.newPlayerName)
    .then(function() {
      dm.newPlayerName = '';
      dm.players = GameManager.getPlayers();
    });
  }

  function confirmPlayers() {
    const session = dm.settings;
    session.players = dm.players;
    $mdDialog.hide(session);
  }
}
