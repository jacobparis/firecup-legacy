angular
  .module('DialogService', [])
  .service('DialogService', [
    '$q',
    '$mdDialog',
    DialogService
  ]);

function DialogService($q, $mdDialog) {
  this.showAlert = showAlert;
  this.showPrompt = showPrompt;
  this.showHandInput = showHandInput;

  function showAlert(context) {
    var alert = $mdDialog.alert()
      .textContent(context.text)
      .ariaLabel(context.text)
      .clickOutsideToClose(true)
      .ok("I'm ready!");

    //Most alerts don't need titles
    if (context.title)
      alert.title(context.title);

    return $mdDialog.show(alert);
  }

  function showPrompt(context) {
    var alert = $mdDialog.prompt()
      .textContent(context.text)
      .ariaLabel(context.input)
      .placeholder(context.input)
      .clickOutsideToClose(false)
      .ok(context.confirm);

    //Most alerts don't need titles
    if (context.title)
      alert.title(context.title);

    if (context.cancel) {
      alert.clickOutsideToClose(true)
      alert.cancel(context.cancel);
    }
    return $mdDialog.show(alert);
  }

  function showHandInput(player, card) {
    var alert = {
      controller: 'HandInputController',
      controllerAs: 'vm',
      templateUrl: 'game/hand/hand.input.template.html',
      clickOutsideToClose: true,
      locals: {
        player: player,
        card: card

      },
      bindToController: true
    };

    return $mdDialog.show(alert);
  }
}
