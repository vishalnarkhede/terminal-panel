(function(angular) {
  'use strict';

    angular.module('terminalPanel', [])
    /**
    * terminalPanel directive creates an element or panel which looks similar to
    * terminal or command line interface.
    *     - Lookwise
    *     - typing effect
    *     - blinking cursor
    *
    * Usage of this directive is farely simple. It can be used in 2 ways:
    *
    * 1. Binding:
    *      You can bind a scopre variable of your controlle rto this directive
    *      via attribute `terminal-panel-msg`.
    *      As soon as scope variable (msg) changes, it will reflect on terminal panel.
    *      If you provide `enable-msg-queue="true"`. Then terminal panel will wait for
    *      current message being typed, to finish. And after that, it will start typing
    *      new message (from scope variable which is provided in attribute `terminal-panel-msg`).
    *
    *      Example:
    *          `<div ng-controller="demoController">
    *              <terminal-panel
    *                      terminal-panel-msg="panelMessage"
    *                      terminal-width="400px"
    *                      terminal-height="50%">
    *              </terminal-panel>
    *              <button ng-click="nextMessage()">Show next message</button>
    *          </div>`
    *
    * 2. Event:
    *      You can broadcast an event 'terminalPanel:change' or 'terminalPanel.<id>:change'.
    *      terminalPanel:change - will change the message on all the panels present on page.
    *      terminalPanel.<id>:change - will change the message on panel with id as <id>.
    *                                  <id> is provided through attribute aterminal-id`.
    *
    *      Example:
    *        $rootScope.$broadcast('terminalPanel:change', {
    *            msg: "This is the next message." +
    *               "This needs to be displayed or typed on all terminal panels on page."
    *        });
    *        $rootScope.$broadcast('terminalPanel.terminal1:change', {
    *            msg: "This is the next message." +
    *               "This needs to be displayed or typed only on terminal panel with id as 'terminal1'"
    *        });
    *
    * Following attributes are supported by this directive:
    *
    * 1. terminal-width: Width of the panel (default: 100%)
    * 2. terminal-height: Height of the panel (default: auto)
    * 3. terminal-font-size: Font size of the text on panel (default: 18px)
    * 4. terminal-text-color: Text color of the terminal panel (default: #20DF1D)
    * 5. enable-msg-queue: When message on the panel is changed, this feature will
    *                      let the previous message typing to finish first, before
    *                      typing next message. So basically, message queue will be
    *                      maintained.
    * 6. terminal-id: You can assign some unique id to terminal panel. This way
    *                 if you have multiple panels on page, and if you want to change/add
    *                 message on only one of the panel, you can do that using this id.
    *                 All you need to do is broadcast event 'terminalPanel.<id>:change'
    */
    .directive('terminalPanel', function ($window, $rootScope, $timeout, $q, $interval) {
        return {
            restrict: 'AE',
            template: '<div class="floating-box" style="{{ terminalStyle }}">{{ msg }}</div>',
            scope: {
                panelMsg: '=terminalPanelMsg'
            },
            link: function (scope, element, attrs) {
                var intervalTyping,
                    cursorInterval,
                    msgQueue = [],
                    msgQueueEnabled = attrExists('enableMsgQueue') ? attrs.enableMsgQueue : false;

                scope.terminalStyle = '';
                scope.terminalStyle += 'width: ' + (attrExists('terminalWidth') ? attrs.terminalWidth : '100%') + ';';
                if (attrExists('terminalHeight')) {
                    scope.terminalStyle += 'height: ' + attrs.terminalHeight + ';';
                }

                scope.terminalStyle += 'background-color: ' + (attrExists('terminalBackground') ? attrs.terminalBackground : 'black') + ';';
                scope.terminalStyle += 'font-size: ' + (attrExists('terminalFontSize') ? attrs.terminalFontSize : '18px') + ';';
                scope.terminalStyle += 'color: ' + (attrExists('terminalTextColor') ? attrs.terminalTextColor : '#20DF1D') + ';';
                scope.terminalStyle += 'font-family: \'Courier New\', Courier, monospace' + ';';
                scope.terminalStyle += 'padding: 10px';

                scope.$watch('panelMsg', function (newValue) {
                    instructUser(newValue);
                });

                // If you don't want to play with scope variable, then you have option,
                // to type something on panel by broadcasting one of following events.
                // User can either update text on single panel or all the panel.
                [
                    'terminalPanel.' + attrs.terminalId + ':change',
                    'terminalPanel:change',
                ].forEach(function (event) {
                    scope.$on(event, function (evt, data) {
                        instructUser(data.msg);
                    });
                });

                instructUser(scope.panelMsg);
                simulateCursor();

                function attrExists (attr) {
                    if (undefined === attrs[attr] || null === attrs[attr] || '' === attrs[attr]) {
                        return false;
                    }

                    return true;
                }
                // instructUser function takes care of entire functionality
                // of terminal simulator.
                // Function param `msgType` is reference to keys in userInstructionInventory service.
                function instructUser (message) {
                    var deferred = $q.defer(),
                        i = 0;

                    if (msgQueueEnabled) {
                        msgQueue.push(message);
                    } else {
                        msgQueue = [message];
                    }

                    if (!msgQueueEnabled && angular.isDefined(intervalTyping)) {
                        $interval.cancel(intervalTyping);
                        intervalTyping = null;
                    }

                    if (null == intervalTyping) {
                        typeMessage(0, deferred);
                    }

                    return deferred.promise;
                }

                // This is a separate function only for the sake of keeping code
                // readable and clean. This is used in instructUser function for
                // actual animation part of typing on terminal simulator window.
                function typeMessage (index, deferred) {
                    var i = 0;

                    intervalTyping = $interval(
                        function () {
                            scope.msg = msgQueue[index].substr(0, i) + "_";
                            i++;
                        }, 25, msgQueue[index].length + 1
                    );

                    intervalTyping.then(function () {
                        msgQueue.shift();
                        if (undefined === msgQueue[index]) {
                            intervalTyping = undefined;
                            deferred.resolve();
                        } else {
                            $timeout(function () {
                                typeMessage(index, deferred);
                            }, 3000);
                        }

                    }, function () {
                    });
                }

                // Following function will simulate the cursor in of terminal window
                // simulator. Here we basically trigger the indefinite cursor blinking,
                // and if someone again request the cursor, we will simply return
                // if the cursor is already present on terminal window.
                function simulateCursor () {
                    var deferred = $q.defer();

                    if (angular.isDefined(cursorInterval)) {
                        return;
                    }

                    cursorInterval = $interval(
                        function () {
                            scope.msg = toggleCursorAfterMessage(scope.msg);
                        },
                        700
                    );
                }

                // Again, this function is only there for keeping code clean and readable.
                // All this does is to either add or remove underscore from the end of
                // certain string. We will call this function for text of terminal simutor.
                function toggleCursorAfterMessage (msg) {
                    if (undefined === msg) {
                        return;
                    }

                    var endChar = msg.substring(msg.length - 1);

                    if ("_" === endChar) {
                        msg = msg.substring(0, msg.length - 1);
                    } else {
                        msg = scope.msg + "_";
                    }

                    return msg;
                }

            }
        };
    });

})(angular);
