(function(angular) {
  'use strict';

    angular.module('sampleAppModule', ['terminalPanel'])
    .controller('sampleAppController', function ($scope, $interval, $rootScope) {
        var count = 0;

        $scope.dummyText = "Hi, this is terminal text.";

        $scope.nextMessageViaEvent = function (id) {
            var event;

            if (undefined !== id) {
                event = 'terminalPanel.' + id + ':change';
            } else {
                event = 'terminalPanel:change';
            }
            $rootScope.$broadcast(event, {
                msg: getNextMessage()
            });
        };

        $scope.nextMessageViaBinding = function (id) {
            $scope.dummyText = getNextMessage();
        };

        function getNextMessage() {
            return "Hi there, I'm typing message number " + (++count) +
                ". I know you don't care about the message to be honest"
                ;
        }
    });
})(angular);
