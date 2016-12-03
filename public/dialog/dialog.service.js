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
  this.showConfirm = showConfirm;
  this.showCustom = showCustom;
  this.showHandInput = showHandInput;
  this.showSmiteInput = showSmiteInput;

  function showAlert(context) {
    const alert = $mdDialog.alert()
      .textContent(context.text)
      .ariaLabel(context.text)
      .clickOutsideToClose(true)
      .ok('I\'m ready!');

    // Most alerts don't need titles
    if (context.title) {
      alert.title(context.title);
    }

    return $mdDialog.show(alert);
  }

  function showPrompt(context) {
    const alert = $mdDialog.prompt()
      .textContent(context.text)
      .ariaLabel(context.input)
      .placeholder(context.input)
      .clickOutsideToClose(false)
      .ok(context.confirm);

    // Most alerts don't need titles
    if (context.title) {
      alert.title(context.title);
    }

    if (context.cancel) {
      alert.clickOutsideToClose(true);
      alert.cancel(context.cancel);
    }
    return $mdDialog.show(alert);
  }

  function showConfirm(context) {
    const confirm = $mdDialog.confirm()
      .textContent(context.text)
      .ok(context.confirm)
      .cancel(context.cancel);

    if (context.title) {
      confirm.title(context.title);
    }

    return $mdDialog.show(confirm);
  }

  function showCustom(alert) {
    return $mdDialog.show(alert);
  }

  function showHandInput(player, card) {
    const alert = {
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

  function showSmiteInput(scope) {
    const alert = {
      controller: 'SmiteInputController',
      controllerAs: 'sm',
      scope: scope,
      preserveScope: true,
      templateUrl: 'game/smite/smite.input.template.html',
      clickOutsideToClose: true,
      bindToController: true
    };

    return $mdDialog.show(alert);
  }
}
