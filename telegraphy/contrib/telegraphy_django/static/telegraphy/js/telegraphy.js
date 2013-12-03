(function (){

    if (!('ab' in this)) {
        throw new Error("Autobahn JS not included");
    }

    if (!('jQuery' in this)) {
        throw new Error("jQuery is not included");
    }

    if ('Telegraphy' in this) {
        console.warning("Telegraphy already loaded. Skipping");
        return;
    }

    Telegraphy = (function (){

            var _session = null,
                // Event name -> [ callbacks, ... ]
                _subscriptions = {};

            function _getEventURL (eventName) {
                if (Telegraphy.EVENT_URL_PREFIX === null) {
                    throw new Error("EVENT_URL_PREFIX constant not defined");
                }
                var name = Telegraphy.EVENT_URL_PREFIX + eventName;
                console.info(name);
                return name;
            }
            /**
             * Registers an event
             */
            function register (eventName, callback) {
                var fullEventName = _getEventURL(eventName);
                var subs;
                if (!(fullEventName in _subscriptions)) {
                    subs = [];
                    _subscriptions[fullEventName] = subs;
                } else {
                    subs = _subscriptions[fullEventName];
                }
                subs.push(callback);

                if (_session !== null) {
                    // TODO: Check if session is disconnected
                    _session.subscribe(eventNameURL, callback);
                }
            }

            /**
             * Unregisters an event
             */
            function unregister (eventName) {
                throw new Error("Unregister not implemented");
                // if (eventName in _subscriptions) {
                //     // TODO
                // } else {
                //     throw new Error(eventName + "not in subscriptions");
                // }
            }


            function _subscribeRegisteredEvents () {
                console.info("Registering events on connection success");
                for (var eventNameURL in _subscriptions) {
                    var callback_list = _subscriptions[eventNameURL];
                    for (var i = 0; i < callback_list.length; i++) {
                        var callback = callback_list[i];
                        console.debug("Registering", eventNameURL, "to", callback);
                        _session.subscribe(eventNameURL, callback);
                    }
                }
            }


            function onConnectSuccess (session) {
                _session = session;
                _subscribeRegisteredEvents();

            }

            function onConnnectError (errorType, errorMessage) {
                console.error(arguments);
            }
            // Connect Telegraphy to server on document load


            function connect() {
                console.info("Making connection");
                // TODO: Check valid constants
                ab.connect(
                        Telegraphy.WS_URL,
                        onConnectSuccess,
                        onConnnectError
                );
            }

            jQuery(connect);


            return {

                register: register,
                unregister: unregister,
                getSubscriptions: function () {
                    return _subscriptions;
                },
                // Retruns Autobahn session
                getABSession: function () {
                    return _session;
                }
            };
        })();

    Telegraphy.EVENT_URL_PREFIX = null;
    Telegraphy.RPC_URL_PREFIX = null;
    Telegraphy.WS_URL = null;
})();