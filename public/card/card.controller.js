angular
  .module('CardCtrl', [])
  .controller('CardController', [
    'DeckService',
    CardController
  ]);

function CardController(DeckService) {
  var vm = this;
  vm.cardTypes = [
    'event',
    'consequence'
  ];
  vm.card = {};
  vm.card.type = 'category';
  vm.card.color = 'black';

  vm.eventDeck = {
    "count": 0
  };

  vm.consequenceDeck = {
    "count": 0
  };

  vm.postCard = postCard;
  vm.getCards = getCards;

  function postCard() {
    var card = {
      "deck": vm.cardTypes[vm.card.deck],
      "primary": vm.card.primary,
      "secondary": vm.card.secondary,
      "type": vm.card.type,
      "color": vm.card.color,
      "theme": vm.card.theme
    };

    console.log(card);
    DeckService.postCard(card);

    getCards();
  }

  function getCards() {
    console.log('Get Cards');
    if (vm.cardTypes[vm.card.deck] == "event") {
      DeckService.getDeck('event')
        .then(function(deck) {
          vm.cards = deck;
          console.log(vm.cards);
        });
    }

    if (vm.cardTypes[vm.card.deck] == "consequence") {
      DeckService.getDeck('consequence')
        .then(function(deck) {
          vm.cards = deck;
        });
    }
  }
}
