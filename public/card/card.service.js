angular
  .module('CardService', [])
  .service('DeckResource', ['$resource', DeckResource])
  .service('DeckService', DeckService);

function DeckResource($resource) {
  return $resource('/api/decks/:deckId', {
    deckId: '@deckId'
  });
}

function DeckService(DeckResource) {
  this.getDeck = getDeck;

  function getDeck(deck) {
    return DeckResource.query({
        "deckId": deck
      })
      .$promise;
  }
}
