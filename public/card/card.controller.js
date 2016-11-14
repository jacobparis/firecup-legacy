angular
  .module('Card', [])
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
  vm.card.type = 'event';

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
      "type": vm.card.type,
      "reqs": vm.card.reqs
    };

    if(vm.card.secondary) {
      card.secondary = vm.card.secondary;
    }

    if(vm.card.theme) {
      card.theme = vm.card.theme;
    }

    if(vm.card.type == "event") {
      card.model = vm.card.model;
    }

    console.log(card);
    DeckService.postCard(card);

    getCards();
  }

  function getCards() {
    if (vm.cardTypes[vm.card.deck] == "event") {
      DeckService.getDeck('event')
        .then(function(deck) {
          vm.cards = deck;
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
