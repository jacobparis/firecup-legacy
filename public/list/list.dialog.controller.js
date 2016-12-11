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
  dm.listThemes = listThemes;

  dm.deck = getDeck;

  $scope.$watch('vm.selected[0]', function(newVal, oldVal) {
    console.log(newVal);
    if(!newVal) {return;}
    dm.rule = {
      primary: newVal.primary,
      secondary: newVal.secondary,
      theme: newVal.theme
    };
  });

  function getDeck() {
    const type = vm.cardTypes[vm.card.type];

    if(type === 'action') {return 'smite';}
    if(type === 'status') {return 'smite';}
    if(type === 'event') {return 'event';}
    if(type === 'trap') {return 'event';}

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
