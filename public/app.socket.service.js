angular
  .module('app')
  .factory('Socket', ['$rootScope', SocketFactory]);

function SocketFactory($rootScope) {
  const socket = window.io.connect();
  return {
    on: function(eventName, callback) {
      console.log('on');
      socket.on(eventName, function() {
        const args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      console.log('emit');
      socket.emit(eventName, data, function() {
        const args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}
