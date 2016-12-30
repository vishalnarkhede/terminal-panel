# terminal-panel

terminalPanel directive creates an element or panel which looks similar to

terminal or command line interface.
    - Lookwise
    - typing effect
    - blinking cursor

Usage of this directive is farely simple. It can be used in 2 ways:

1. **Binding**:
     You can bind a scopre variable of your controlle rto this directive
     via attribute `terminal-panel-msg`.
     As soon as scope variable (msg) changes, it will reflect on terminal panel.
     If you provide `enable-msg-queue="true"`. Then terminal panel will wait for
     current message being typed, to finish. And after that, it will start typing
     new message (from scope variable which is provided in attribute `terminal-panel-msg`).
     Example:
````html
    <div ng-controller="demoController">
       <terminal-panel
               terminal-panel-msg="panelMessage"
               terminal-width="400px"
               terminal-height="50%">
       </terminal-panel>
       <button ng-click="nextMessage()">Show next message</button>
    </div>
````
2. **Event**:
     You can broadcast an event 'terminalPanel:change' or 'terminalPanel.<id>:change'.
     terminalPanel:change - will change the message on all the panels present on page.
     terminalPanel.<id>:change - will change the message on panel with id as <id>.
                                 <id> is provided through attribute aterminal-id`.
     Example:
````javascript
       $rootScope.$broadcast('terminalPanel:change', {
           msg: "This is the next message." +
              "This needs to be displayed or typed on all terminal panels on page."
       });
       $rootScope.$broadcast('terminalPanel.terminal1:change', {
           msg: "This is the next message." +
              "This needs to be displayed or typed only on terminal panel with id as 'terminal1'"
       });
````
Following attributes are supported by this directive:

1. **terminal-width**: Width of the panel (default: 100%)
2. **terminal-height**: Height of the panel (default: auto)
3. **terminal-font-size**: Font size of the text on panel (default: 18px)
4. **terminal-text-color**: Text color of the terminal panel (default: #20DF1D)
5. **enable-msg-queue**: When message on the panel is changed, this feature will
                     let the previous message typing to finish first, before
                     typing next message. So basically, message queue will be
                     maintained.
6. **terminal-id**: You can assign some unique id to terminal panel. This way
                if you have multiple panels on page, and if you want to change/add
                message on only one of the panel, you can do that using this id.
                All you need to do is broadcast event 'terminalPanel.<id>:change'
