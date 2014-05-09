/* globals Telegraphy, _ */
/***
 * Filtered Channels
 */

(function (Telegraphy, _) {
    "use strict";
    var channelPrototype, LOOKUP_SEP = "__";

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
        this.q = new Q(filterMap);
        input.onAny(this.wrapedHandleEvent());
        this.passFilter = function (event) {
            return this.q.check(event.data);
        };
    }

    FilteredChannel.prototype = channelPrototype;

    function ExcludedChannel(input, excludeMap) {
        this.initialize();
        this.q = new Q(excludeMap);
        input.onAny(this.wrapedHandleEvent());

        this.passFilter = function (event) {
            return ! this.q.check(event.data);
        };
    }

    ExcludedChannel.prototype = channelPrototype;

    Telegraphy.Channel = Channel;
    Telegraphy.FilteredChannel = FilteredChannel;
    Telegraphy.ExcludedChannel = ExcludedChannel;

    Telegraphy.subscribe = function (eventName) {
        var channel =  new Channel();
        this.register(eventName, channel.wrapedHandleEvent());
        return channel;
    };

    /**
     * lookups needed for
     *
     */
    var lookups = {
        exact: function (field, value, obj) {
            return obj[field] === value;
        },
 /*       iexact: function (field, value, obj) {
            return
        },
        contains: function (field, value, obj) {

        },
        icontains: function (field, value, obj) {

        },

*/
        in: function (field, value_list, obj) {
            return _.contains(value_list, obj[field]);
        },
        gt: function (field, value, obj) {
            return obj[field] > value;
        },
        gte: function (field, value, obj) {
            return obj[field] >= value;
        },
        lt: function (field, value, obj) {
            return obj[field] < value;
        },
        lte: function (field, value, obj) {
            return obj[field] <= value;
        },
        /*
        startswith: function (field, value, obj) {

        },
        istartswith: function (field, value, obj) {

        },
        endswith: function (field, value, obj) {
        },
        iendswith: function (field, value, obj) {
        },
        range: function (field, value, obj) {
        },
        regex: function (field, regex, obj) {
        },
        iregex: function (field, regex, obj) {

        },
         */
    };

    var qProto = {
        /**
         * Parse the key and value and return a partial function
         */
        initLookups: function (map) {
            this.lookups = _.map(map, this.extractLookup, this);
        },
        extractLookup: function (value, key) {
            var parts = key.split(LOOKUP_SEP);
            if (parts.length === 1) {
                return _.partial(lookups.exact, parts[0], value);
            } else if (parts.length === 2) {
                return _.partial(lookups[parts[1]], parts[0], value);
            } else {
                throw new Error("Invalid lookup:" + key);
            }
        },
        /**
         * returns true if object passes all provided rules
         */
        check: function (obj, or) {
            if (or === true) {
                return this.checkOr(obj);
            }
            return this.checkAnd(obj);
        },
        /**
         * Check that all individual lookups are true
         */
        checkAnd: function (obj) {
            return _.reduce(this.lookups, function (prev, f) {
                return prev && f(obj);
            }, true);
        },
        /**
         * Check that at least one lookup is true
         */
        checkOr: function (obj) {
            return _.some(this.lookups, function (f) {
                return f(obj);
            });
        }
    };

    function Q(kwargs) {
        this.initLookups(kwargs);
    }
    Q.prototype = qProto;

})(Telegraphy, _);
