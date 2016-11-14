angular
  .module('Card')
  .service('DeckResource', ['$resource', DeckResource])
  .service('CardResource', ['$resource', CardResource])
  .service('DeckService', DeckService);

function DeckResource($resource) {
  return $resource('/api/decks/:deckId', {
    deckId: '@deckId'
  });
}

function CardResource($resource) {
  return $resource('/api/cards/');
}

function DeckService(DeckResource, CardResource) {
  this.getDeck = getDeck;
  this.getCards = getCards;
  this.postCard = postCard;

  function getDeck(deck) {
    return DeckResource.query({
        "deckId": deck
      })
      .$promise;
  }

  function getCards(query) {
    return DeckResource.query(query);
  }

  function postCard(card) {
    return CardResource.save(card);
  }
}
