angular
  .module('List')
  .controller('ListDialogController', [
    '$scope',
    '$q',
    '$mdDialog',
    '$mdMedia',
    ListDialogController
  ]);

function ListDialogController($scope, $q, $mdDialog, $mdMedia) {
  $scope.$mdMedia = $mdMedia;
  let vm;
  if($scope.vm) {
    vm = $scope.vm;
  }
  else {
    vm = $scope.vm = $scope.$parent.vm;
  }

  const dm = this;
  console.log($scope);
  dm.cancel = $mdDialog.cancel;
  dm.create = create;

  dm.rule = {};
  if(vm.selected.length > 0) {
    dm.rule = {
      primary: vm.selected[0].primary,
      secondary: vm.selected[0].secondary,
      theme: vm.selected[0].theme
    };
  }
  dm.listThemes = listThemes;

  dm.deck = getDeck;

  function getDeck() {
    const type = vm.cardTypes[vm.card.type];

    if(type == 'action') {return 'smite';}
    if(type == 'status') {return 'smite';}
    if(type == 'event') {return 'event';}
    if(type == 'trap') {return 'event';}

  }
  function listThemes(query) {
    const themes = [
      'animals',
      'food',
      'music',
      'party',
      'sports',
      'internet',
      'language',
      'history',
      'movies'
    ];

    const results = query ? themes.filter(createFilterFor(query)) : themes;
    const deferred = $q.defer();
    deferred.resolve(results);
    return deferred.promise;
    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      const lowercaseQuery = angular.lowercase(query);

      return function filterFn(term) {
        return (term.indexOf(lowercaseQuery) === 0);
      };
    }
  }

  function create() {
    $mdDialog.hide(dm.rule);
  }

}
