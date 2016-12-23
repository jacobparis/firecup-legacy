angular
  .module('List', [])
  .controller('ListController', [
    '$scope',
    '$q',
    '$mdMedia',
    'RuleService',
    'DialogService',
    'Analytics',
    ListController
  ])
  .directive('submitdialog', SubmitDialog);

function ListController($scope, $q, $mdMedia, RuleService, DialogService, Analytics) {
  Analytics.trackPage('/list');
  $scope.$mdMedia = $mdMedia;
  const vm = this;
  vm.cardTypes = [
    'action',
    'status',
    'event',
    'trap'
  ];

  vm.listOrder;
  vm.selected = [];
  vm.filter = {
    show: false,
    query: '',
    options: {}
  };

  vm.create = create;
  vm.card = {};
  vm.card.type = 0;
  vm.createRule = createRule;
  vm.getRules = getRules;

  function create(e) {
    DialogService.showCustom({
      controller: 'ListDialogController',
      controllerAs: 'dm',
      templateUrl: 'list/list.dialog.html',
      targetEvent: e,
      scope: $scope.$new(),
      preserveScope: true,
      clickOutsideToClose: true,
    }).then(saveRule, function() {
      console.log('CANCEL');
    });

  }
  function saveRule(rule) {
    if(!rule) {return $q.reject();}
    rule.type = vm.cardTypes[vm.card.type];
    if(rule.type === 'action') {rule.deck = 'burn';}
    if(rule.type === 'status') {rule.deck = 'burn';}
    if(rule.type === 'event') {rule.deck = 'event';}
    if(rule.type === 'trap') {rule.deck = 'event';}

    rule.public = true;
    return RuleService.postRule(rule);
  }

  function getRules() {
    RuleService.getRulesByType(vm.cardTypes[vm.card.type])
      .then(function(deck) {
        vm.cards = deck;
      });
  }

  function createRule() {
    console.log($scope);
    saveRule($scope.dm.rule);
    getRules();
  }
}

function SubmitDialog() {
  return {
    controller: 'ListDialogController',
    controllerAs: 'dm',
    templateUrl: 'list/list.directive.html',
    replace: true
  };
}
