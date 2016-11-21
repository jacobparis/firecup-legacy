angular
  .module('List')
  .controller('ListDialogController', [
    '$scope',
    '$q',
    '$mdDialog',
    ListDialogController
  ]);

function ListDialogController($scope, $q, $mdDialog) {
  var dm = this;

  dm.cancel = $mdDialog.cancel;
  dm.create = create;
  dm.rule = {};
  dm.listThemes = listThemes;

  function listThemes(query) {
    var themes = [
      'party',
      'sports',
      'internet',
      'language',
      'history',
      'movies'
    ];

    var results = query ? themes.filter(createFilterFor(query)) : themes;
    var deferred = $q.defer();
    deferred.resolve(results);
    return deferred.promise;
    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(term) {
        return (term.indexOf(lowercaseQuery) === 0);
      };
    }
  }

  function create() {
    $mdDialog.hide(dm.rule);
  }


}
