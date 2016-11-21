angular
  .module('List')
  .service('RuleResource', ['$resource', RuleResource])
  .service('RuleService', RuleService);


function RuleResource($resource) {
  return $resource('/api/cards/:type', {
    type: '@type'
  });
}

function RuleService(RuleResource) {
  this.getRulesByType = getRulesByType;
  this.postRule = postRule;

  function getRulesByType(type) {
    return RuleResource.query({
        "type": type
      })
      .$promise;
  }


  function postRule(rule) {
    console.log(rule);
    return RuleResource.save(rule);
  }
}
