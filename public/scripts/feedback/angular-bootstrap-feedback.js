/**
 * angular-bootstrap-feedback - User feedback form for angular with screenshot and highlighting
 * @author Robert Young
 * @version v1.0.2
 * @link https://robertyoung.github.io/angular-bootstrap-feedback/
 * @license MIT
 * This file is auto-generated. Please modify the Typescript related file.
 */
angular.module('angular.bootstrap.feedback', []);
var AngularBootstrapFeedback;
(function(AngularBootstrapFeedback) {
  const Button = (function() {
    function Button() {
      this.transclude = true;
      this.bindings = {
        options: '=?'
      };
      this.controller = ButtonController;
      this.templateUrl = 'scripts/feedback/angular.bootstrap.feedback.button.html';
    }
    return Button;
  })();
  AngularBootstrapFeedback.Button = Button;
  const ButtonController = (function() {
    function ButtonController(factory, $transclude) {
      this.factory = factory;
      this.$transclude = $transclude;
    }
    ButtonController.prototype.$onInit = function() {
      this.factory.setOptions(this.options);
    };
    ButtonController.prototype.openModal = function() {
      const _this = this;
      if (this.options.sendFeedbackButtonPressed) {
        this.options.sendFeedbackButtonPressed();
      }
      this.$transclude(function(value) {
        _this.factory.transcludedContent = value;
      });
      this.factory.openModal();
    };
    ButtonController.prototype.cancelScreenshotPressed = function() {
      if (this.factory.options.cancelScreenshotOptionsButtonPressed) {
        this.factory.options.cancelScreenshotOptionsButtonPressed();
      }
      this.factory.isScreenshotMode = false;
      this.factory.showModal();
      this.factory.destroyCanvas();
    };
    ButtonController.prototype.takeScreenshotPressed = function() {
      if (this.factory.options.takeScreenshotOptionsButtonPressed) {
        this.factory.options.takeScreenshotOptionsButtonPressed();
      }
      this.factory.takeScreenshot();
    };
    ButtonController.$inject = ['angularBootstrapFeedbackFactory', '$transclude'];
    return ButtonController;
  })();
  AngularBootstrapFeedback.ButtonController = ButtonController;
})(AngularBootstrapFeedback || (AngularBootstrapFeedback = {}));
angular
    .module('angular.bootstrap.feedback')
    .component('angularBootstrapFeedback', new AngularBootstrapFeedback.Button());
var AngularBootstrapFeedback;
(function(AngularBootstrapFeedback) {
  const ModalController = (function() {
    function ModalController(factory, $detection) {
      this.factory = factory;
      this.$detection = $detection;
      this.factory.resetScreenshot();
      this.factory.appendTransclodedContent();
    }
    ModalController.prototype.closeModal = function() {
      this.factory.closeModal();
    };
    ModalController.prototype.submitButtonPressed = function(form) {
      this.factory.closeModal();
      if (this.factory.options.submitButtonPressed) {
        this.factory.options.submitButtonPressed(form);
      }
    };
    return ModalController;
  })();
  AngularBootstrapFeedback.ModalController = ModalController;
})(AngularBootstrapFeedback || (AngularBootstrapFeedback = {}));
var AngularBootstrapFeedback;
(function(AngularBootstrapFeedback) {
  const Factory = (function() {
    function Factory($mdDialog, $mdMedia, $document, $templateCache, $timeout) {
      const _this = this;
      this.$mdDialog = $mdDialog;
      this.$mdMedia = $mdMedia;
      this.$document = $document;
      this.$templateCache = $templateCache;
      this.$timeout = $timeout;
      this.options = {};
      this.modalElementSelector = 'md-dialog.feedback';
      this.modalBackdropElementSelector = 'div[uib-modal-backdrop]';
      this.sendFeedbackElementSelector = 'div.send-feedback';
      this.modalBodyElementSelector = this.modalElementSelector + ' .screenshot';
      this.isDrawing = false;
      this.onMouseDown = function(event) {
        _this.centerX = event.pageX;
        _this.centerY = event.pageY;
        _this.ctx.beginPath();
        _this.isDrawing = true;
        _this.redraw();
      };
      this.onMouseMove = function(event) {
        if (_this.isDrawing) {
          const width = event.pageX - _this.centerX;
          const height = event.pageY - _this.centerY;
          _this.ctx.clearRect(0, 0, _this.clientWidth, _this.clientHeight);
          _this.addAlphaBackground();
          _this.ctx.clearRect(_this.centerX, _this.centerY, width, height);
          _this.redraw();
        }
      };
      this.onMouseUp = function(event) {
        _this.isDrawing = false;
        const width = event.pageX - _this.centerX;
        const height = event.pageY - _this.centerY;
        _this.ctx.fillStyle = 'rgba(0,0,0,0)';
        _this.ctx.strokeRect(_this.centerX, _this.centerY, width, height);
        _this.ctx.fillRect(_this.centerX, _this.centerY, width, height);
        const highlight = '<div class="feedback-highlight" style="position:absolute;top:' + _this.centerY + 'px;left:' + _this.centerX + 'px;width:' + width + 'px;height:' + height + 'px;z-index:30000;"></div>';
        angular.element(document.querySelector('body')).append(highlight);
        _this.redraw();
        if (_this.options.highlightDrawn) {
          _this.options.highlightDrawn(angular.element(document.querySelector(highlight)));
        }
      };
      this.isOpen = false;
    }
    Factory.prototype.hideSendFeedback = function() {
      const sendFeedback = angular.element(document.querySelector(this.sendFeedbackElementSelector));
      sendFeedback.addClass('hidden');
    };
    Factory.prototype.showSendFeedback = function() {
      const sendFeedback = angular.element(document.querySelector(this.sendFeedbackElementSelector));
      sendFeedback.removeClass('hidden');
    };
    Factory.prototype.openModal = function() {
      const _this = this;
      if (!this.isOpen) {
        this.hideSendFeedback();
        const modalSettings = {
          hasBackdrop: false,
          templateUrl: 'scripts/feedback/angular.bootstrap.feedback.html',
          controller: ['angularBootstrapFeedbackFactory', AngularBootstrapFeedback.ModalController],
          controllerAs: '$ctrl'
        };
        this.$mdDialog.show(modalSettings).then(function(instance) {
          _this.$mdDialogInstance = instance;
        }, function() {
          if (_this.options.modalDismissed) {
            _this.showSendFeedback();
            _this.options.modalDismissed();
            _this.isOpen = false;
          }
        });
        this.isOpen = true;
      }
    };
    Factory.prototype.hideModal = function() {
      if (this.isOpen) {
        const modal = angular.element(document.querySelector(this.modalElementSelector));
        const modalBackdrop = angular.element(document.querySelector(this.modalBackdropElementSelector));
        modal.addClass('hidden');
        modalBackdrop.addClass('hidden');
        this.isOpen = false;
      }
    };
    Factory.prototype.showModal = function() {
      if (!this.isOpen) {
        const modal = angular.element(document.querySelector(this.modalElementSelector));
        const modalBackdrop = angular.element(document.querySelector(this.modalBackdropElementSelector));
        modal.removeClass('hidden');
        modalBackdrop.removeClass('hidden');
        this.isOpen = true;
      }
    };
    Factory.prototype.closeModal = function() {
      console.log(this);
      if (this.isOpen) {
        this.showSendFeedback();
        this.$mdDialog.hide();
        this.destroyCanvas();
        if (this.options.modalDismissed) {
          this.options.modalDismissed();
        }
        this.isOpen = false;
      }
    };
    Factory.prototype.appendTransclodedContent = function() {
      const _this = this;
      this.$timeout(function() {
        const element = angular.element(document.querySelector(_this.modalBodyElementSelector));
        element.append(_this.transcludedContent);
      });
    };
    Factory.prototype.setOptions = function(options) {
      options = options || {};
      this.options = options;
      this.options.modalTitle = options.modalTitle || 'Feedback';
      this.options.takeScreenshotButtonText = options.takeScreenshotButtonText || 'Take Screenshot';
      this.options.submitButtonText = options.submitButtonText || 'Submit';
      this.options.sendFeedbackButtonText = options.sendFeedbackButtonText || 'Send Feedback';
      this.options.cancelScreenshotOptionsButtonText = options.cancelScreenshotOptionsButtonText || 'Cancel';
      this.options.takeScreenshotOptionsButtonText = options.takeScreenshotOptionsButtonText || 'Take Screenshot';
    };
    Factory.prototype.takeScreenshot = function() {
      const _this = this;
      const options = {
        onrendered: function(canvas) {
          _this.isScreenshotMode = false;
          _this.showModal();
          _this.destroyCanvas();
          canvas.style.width = '100%';
          canvas.style.borderRadius = '12px';
          _this.$timeout(function() {
            _this.screenshotBase64 = canvas.toDataURL();
            if (_this.options.screenshotTaken) {
              _this.options.screenshotTaken(_this.screenshotBase64, canvas);
            }
          });
        }
      };
      this.hideModal();
      this.hideSendFeedback();
      html2canvas(document.body, options);
    };
    Factory.prototype.resetScreenshot = function() {
      this.screenshotBase64 = null;
    };
    Factory.prototype.destroyCanvas = function() {
      this.removeDocumentEvents();
      const canvas = angular.element(document.querySelector('#' + Factory.CANVAS_ID));
      if (canvas) {
        canvas.remove();
      }
      const highlights = angular.element(document.querySelector('.' + Factory.FEEDBACK_HIGHLIGHT_CLASS));
      highlights.remove();
      this.ctx = null;
    };
    Factory.prototype.setupDocumentEvents = function() {
      const _this = this;
      this.$document.on('mousedown', function(event) {
        _this.onMouseDown(event);
      });
      this.$document.on('mouseup', function(event) {
        _this.onMouseUp(event);
      });
      this.$document.on('mousemove', function(event) {
        _this.onMouseMove(event);
      });
    };
    Factory.prototype.removeDocumentEvents = function() {
      this.$document.off('mousedown');
      this.$document.off('mouseup');
      this.$document.off('mousemove');
    };
    Factory.prototype.addAlphaBackground = function() {
      console.log(this);
      if (!this.ctx) {
        throw Error('User feedback context does not exist');
      }
      const body = angular.element(document.querySelector('body'));
      this.ctx.fillStyle = '#001133';
      this.ctx.fillRect(0, 0, body[0].clientWidth, body[0].clientHeight);
    };
    Factory.prototype.createCanvas = function() {
      if (!this.ctx) {
        const canvas = '<canvas id="' + Factory.CANVAS_ID + '"></canvas>';
        const body = angular.element(document.querySelector('body'));
        body.append(canvas);
        angular.element(document.querySelector('#' + Factory.CANVAS_ID)).attr({
          'width': body[0].clientWidth,
          'height': body[0].clientHeight,
          'style': 'top: 0'
        });
        const canvasElement = document.getElementById(Factory.CANVAS_ID);
        this.ctx = canvasElement.getContext('2d');
        this.setupDocumentEvents();
        this.addAlphaBackground();
      }
    };
    Factory.prototype.reset = function() {
      const canvas = document.getElementById(Factory.CANVAS_ID);
      canvas.width = canvas.width;
    };
    Factory.prototype.redraw = function() {
      const _this = this;
      const highlights = angular.element(document.querySelector('.' + Factory.FEEDBACK_HIGHLIGHT_CLASS));
      _.each(highlights, function(highlight) {
        _this.ctx.clearRect(parseInt(highlight.style.left), parseInt(highlight.style.top), parseInt(highlight.style.width), parseInt(highlight.style.height));
        _this.ctx.strokeRect(parseInt(highlight.style.left), parseInt(highlight.style.top), parseInt(highlight.style.width), parseInt(highlight.style.height));
        _this.ctx.fillRect(parseInt(highlight.style.left), parseInt(highlight.style.top), parseInt(highlight.style.width), parseInt(highlight.style.height));
      });
    };
    Factory.CANVAS_ID = 'feedback-canvas';
    Factory.FEEDBACK_HIGHLIGHT_CLASS = 'feedback-highlight';
    Factory.$inject = ['$mdDialog', '$mdMedia', '$document', '$templateCache', '$timeout'];
    return Factory;
  })();
  AngularBootstrapFeedback.Factory = Factory;
})(AngularBootstrapFeedback || (AngularBootstrapFeedback = {}));
angular.module('angular.bootstrap.feedback').service('angularBootstrapFeedbackFactory', AngularBootstrapFeedback.Factory);
var AngularBootstrapFeedback;
(function(AngularBootstrapFeedback) {
  const Screenshot = (function() {
    function Screenshot() {
      this.controller = ['angularBootstrapFeedbackFactory', ScreenshotController];
      this.templateUrl = 'scripts/feedback/angular.bootstrap.feedback.screenshot.html';
    }
    return Screenshot;
  })();
  AngularBootstrapFeedback.Screenshot = Screenshot;
  const ScreenshotController = (function() {
    function ScreenshotController(factory) {
      this.factory = factory;
    }
    ScreenshotController.prototype.takeScreenshotButtonPressed = function() {
      if (this.factory.options.takeScreenshotButtonPressed) {
        this.factory.options.takeScreenshotButtonPressed();
      }
      this.factory.showSendFeedback();
      this.factory.hideModal();
      this.factory.isScreenshotMode = true;
      this.factory.createCanvas();
    };
    return ScreenshotController;
  })();
})(AngularBootstrapFeedback || (AngularBootstrapFeedback = {}));
angular
    .module('angular.bootstrap.feedback')
    .component('angularBootstrapFeedbackScreenshot', new AngularBootstrapFeedback.Screenshot());
