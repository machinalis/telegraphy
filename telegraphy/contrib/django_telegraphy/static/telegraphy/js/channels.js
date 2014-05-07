/* globals Telegraphy, _ */
/***
 * Filtered Channels
 */

(function (Telegraphy, _) {
    "use strict";
    var channelPrototype;

    channelPrototype = {

        /**
         * Initialize mutable object propertys here
         */
        initialize: function () {
            this.callbacks = {};
        },
        /**
         * Adds a callback to map
         */
        addCallback: function (kind, f) {
            if (!_.has(this.callbacks, kind)) {
                this.callbacks[kind] = [];
            }
            this.callbacks[kind].push(f);
            return this;
        },
        /**
         * Dispatch events do filtering, be happy
         */
        wrapedHandleEvent: function () {
            return _.bind(this.handleEvent, this);
        },

        /**
         * Handle all events and dispatch
         */
        handleEvent: function (event) {
            var kind = event.meta.event_type;
            if (this.passFilter(event)) {
                this.triggerCallbacks(kind, event);
                this.triggerCallbacks('any', event);
            }
        },
        /**
         * to be implemented on different kinds of channels
         */
        passFilter: function () {
            return true;
        },

        triggerCallbacks: function (kind, event) {
            _.each(this.callbacks[kind], function (f) {
                f(event);
            });
        },
        /***
         * Does the filtering with a Django queryset simil fashion
         */
        filter: function (filterMap) {
            if (filterMap) {
                return new FilteredChannel(this, filterMap);
            } else {
                // Nothing to filter... return same channel
                return this;
            }
        },
        exclude: function (excludeMap) {
            if (excludeMap) {
                return new ExcludedChannel(this, excludeMap);
            } else {
                return this;
            }
        },
        /**
         * Attach a callback to any kind of event
         */
        onAny: function (callback) {
            return this.addCallback('any', callback);
        },
        onCreate: function (callback) {
            return this.addCallback('create', callback);
        },
        onRead: function (callback) {
            return this.addCallback('read', callback);
        },
        onUpdate: function (callback) {
            return this.addCallback('update', callback);
        },
        onDelete: function (callback) {
            return this.addCallback('delete', callback);
        }
    };

    function Channel() {
        this.initialize();
    }

    Channel.prototype = channelPrototype;

    function FilteredChannel(input, filterMap) {
        this.initialize();
        this.filterMap = filterMap;
        input.onAny(this.wrapedHandleEvent());
        this.passFilter = function (event) {
            console.log(event);
            console.log(this.filterMap);
            return true;
        };
    }

    FilteredChannel.prototype = Channel;

    function ExcludedChannel(input, excludeMap) {
        this.initialize();
        this.excludeMap = excludeMap;
        input.onAny(this.wrapedHandleEvent());

        this.passFilter = function (event) {
            console.log(event);
            console.log(this.excludeMap);
            return true;
        };
    }

    ExcludedChannel.prototype = Channel;

    Telegraphy.Channel = Channel;
    Telegraphy.FilteredChannel = FilteredChannel;
    Telegraphy.ExcludedChannel = ExcludedChannel;

    Telegraphy.subscribe = function (eventName) {
        var channel =  new Channel();
        this.register(eventName, channel.wrapedHandleEvent());
        return channel;
    };

})(Telegraphy, _);
