angular
  .module('Game')
  .controller('GameSetupController', [
    '$scope',
    '$q',
    '$mdDialog',
    '$mdMedia',
    '$state',
    'GameManager',
    GameSetupController
  ]);

function GameSetupController($scope, $q, $mdDialog, $mdMedia, $state, GameManager) {
  const dm = this;
  $scope.game = GameManager;
  $scope.$mdMedia = $mdMedia;
  dm.createGame = createGame;
  dm.players = [];
  dm.loadPlayers = loadPlayers;
  dm.addPlayer = addPlayer;
  dm.savePlayer = savePlayer;
  dm.linkPlayer = linkPlayer;

  dm.confirmPlayers = confirmPlayers;
  dm.newPlayerName;

  dm.cancel = cancel;
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
    dm.players = JSON.parse(JSON.stringify(GameManager.session.players));
  }
  function createGame() {
    console.log('Create');
    $mdDialog.hide(dm.settings);
  }

  function addPlayer() {
    GameManager.addPlayer(dm.newPlayerName)
    .then(function() {
      dm.newPlayerName = '';
      dm.players = GameManager.getPlayers();
    });
  }

  function loadPlayers() {
    dm.players = JSON.parse(JSON.stringify(GameManager.session.players));

  }
  function savePlayer(player) {
    GameManager.updatePlayer(player)
    .then(GameManager.getGame)
    .then(function(result) {
      console.log(result);
    });
  }

  function linkPlayer(player) {
    player.deviceToken = GameManager.session.deviceToken;
    player.link = true;
    savePlayer(player);
  }

  function confirmPlayers() {
    console.log('Confirm');
    const session = dm.settings;
    session.players = dm.players;
    $mdDialog.hide(session);
  }

  function cancel() {
    console.log('Cancel');
    $mdDialog.cancel(true);
    $state.go('game', {title: ''}, {reload: true});
  }
}
