angular
  .module('CardCtrl', [])
  .controller('CardController', [
    '$scope',
    'DeckResource',
    CardController
  ]);

function CardController($scope, DeckResource) {
  var vm = this;
  vm.tagline = 'Nothing beats a pocket protector!';

  vm.cards = DeckResource.query('event');
}
