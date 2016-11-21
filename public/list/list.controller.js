angular
  .module('List', [])
  .controller('ListController', [
    'RuleService',
    'DialogService',
    'Analytics',
    ListController
  ]);

function ListController(RuleService, DialogService, Analytics) {
  Analytics.trackPage('/list');
  var vm = this;
  vm.cardTypes = [
    'event',
    'trap',
    'action',
    'status'
  ];

  vm.listOrder;
  vm.selected = [];
  vm.filter = {
    show: false,
    query: '',
    options: {}
  }

  vm.create = create;
  vm.card = {};
  vm.card.type = 0;

  vm.getRules = getRules;

  function create(e) {
    DialogService.showCustom({
      controller: 'ListDialogController',
      controllerAs: 'dm',
      templateUrl: 'list/list.dialog.html',
      targetEvent: e,
      clickOutsideToClose: true,
    }).then(saveRule, function () {
      console.log('CANCEL');
    });

    function saveRule(rule) {
      if(!rule) return;
      rule.type = vm.cardTypes[vm.card.type];
      rule.public = true;
      RuleService.postRule(rule);
    }
  }

  function getRules() {
    RuleService.getRulesByType(vm.cardTypes[vm.card.type])
      .then(function(deck) {
        vm.cards = deck;
      });
  }
}
