/** @license AutobahnJS - http://autobahn.ws
 *
 * Copyright 2011, 2012 Tavendo GmbH.
 * Licensed under the MIT License.
 * See license text at http://www.opensource.org/licenses/mit-license.php
 *
 * AutobahnJS includes code from:
 *
 * when - http://cujojs.com
 *
 * (c) copyright B Cavalier & J Hann
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Crypto-JS - http://code.google.com/p/crypto-js/
 *
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * Licensed under the New BSD License at:
 * http://code.google.com/p/crypto-js/wiki/License
 * 
 * console-normalizer - https://github.com/Zenovations/console-normalizer
 *
 * (c) 2012 by Zenovations.
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */

// needed to load when.js in legacy environments
// https://github.com/cujojs/when
if (!window.define) {
   window.define = function (factory) {
      try {
         delete window.define;
      }
      catch (e) {
         window.define = void 0;
      } // IE
      window.when = factory();
   };
   window.define.amd = {};
}


(function(console) {
   /*********************************************************************************************
    * Make sure console exists because IE blows up if it's not open and you attempt to access it
    * Create some dummy functions if we need to, so we don't have to if/else everything
    *********************************************************************************************/
   console||(console = window.console = {
      // all this "a, b, c, d, e" garbage is to make the IDEs happy, since they can't do variable argument lists
      /**
       * @param a
       * @param [b]
       * @param [c]
       * @param [d]
       * @param [e]
       */
      log: function(a, b, c, d, e) {},
      /**
       * @param a
       * @param [b]
       * @param [c]
       * @param [d]
       * @param [e]
       */
      info: function(a, b, c, d, e) {},
      /**
       * @param a
       * @param [b]
       * @param [c]
       * @param [d]
       * @param [e]
       */
      warn: function(a, b, c, d, e) {},
      /**
       * @param a
       * @param [b]
       * @param [c]
       * @param [d]
       * @param [e]
       */
      error: function(a, b, c, d, e) {}
   });

   // le sigh, IE, oh IE, how we fight... fix Function.prototype.bind as needed
   if (!Function.prototype.bind) {
      //credits: taken from bind_even_never in this discussion: https://prototype.lighthouseapp.com/projects/8886/tickets/215-optimize-bind-bindaseventlistener#ticket-215-9
      Function.prototype.bind = function(context) {
         var fn = this, args = Array.prototype.slice.call(arguments, 1);
         return function(){
            return fn.apply(context, Array.prototype.concat.apply(args, arguments));
         };
      };
   }

   // IE 9 won't allow us to call console.log.apply (WTF IE!) It also reports typeof(console.log) as 'object' (UNH!)
   // but together, those two errors can be useful in allowing us to fix stuff so it works right
   if( typeof(console.log) === 'object' ) {
      // Array.forEach doesn't work in IE 8 so don't try that :(
      console.log = Function.prototype.call.bind(console.log, console);
      console.info = Function.prototype.call.bind(console.info, console);
      console.warn = Function.prototype.call.bind(console.warn, console);
      console.error = Function.prototype.call.bind(console.error, console);
   }

   /**
    * Support group and groupEnd functions
    */
   ('group' in console) ||
   (console.group = function(msg) {
      console.info("\n--- "+msg+" ---\n");
   });
   ('groupEnd' in console) ||
   (console.groupEnd = function() {
      console.log("\n");
   });

   /**
    * Support time and timeEnd functions
    */
   ('time' in console) ||
   (function() {
      var trackedTimes = {};
      console.time = function(msg) {
         trackedTimes[msg] = new Date().getTime();
      };
      console.timeEnd = function(msg) {
         var end = new Date().getTime(), time = (msg in trackedTimes)? end - trackedTimes[msg] : 0;
         console.info(msg+': '+time+'ms')
      }
   }());

})(window.console);
/** @license MIT License (c) copyright 2011-2013 original author or authors */

/**
 * A lightweight CommonJS Promises/A and when() implementation
 * when is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 * @version 2.2.1
 */
(function(define, global) { 'use strict';
define(function () {

	// Public API

	when.promise   = promise;    // Create a pending promise
	when.resolve   = resolve;    // Create a resolved promise
	when.reject    = reject;     // Create a rejected promise
	when.defer     = defer;      // Create a {promise, resolver} pair

	when.join      = join;       // Join 2 or more promises

	when.all       = all;        // Resolve a list of promises
	when.map       = map;        // Array.map() for promises
	when.reduce    = reduce;     // Array.reduce() for promises
	when.settle    = settle;     // Settle a list of promises

	when.any       = any;        // One-winner race
	when.some      = some;       // Multi-winner race

	when.isPromise = isPromise;  // Determine if a thing is a promise


	/**
	 * Register an observer for a promise or immediate value.
	 *
	 * @param {*} promiseOrValue
	 * @param {function?} [onFulfilled] callback to be called when promiseOrValue is
	 *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
	 *   will be invoked immediately.
	 * @param {function?} [onRejected] callback to be called when promiseOrValue is
	 *   rejected.
	 * @param {function?} [onProgress] callback to be called when progress updates
	 *   are issued for promiseOrValue.
	 * @returns {Promise} a new {@link Promise} that will complete with the return
	 *   value of callback or errback or the completion value of promiseOrValue if
	 *   callback and/or errback is not supplied.
	 */
	function when(promiseOrValue, onFulfilled, onRejected, onProgress) {
		// Get a trusted promise for the input promiseOrValue, and then
		// register promise handlers
		return resolve(promiseOrValue).then(onFulfilled, onRejected, onProgress);
	}

	/**
	 * Trusted Promise constructor.  A Promise created from this constructor is
	 * a trusted when.js promise.  Any other duck-typed promise is considered
	 * untrusted.
	 * @constructor
	 * @name Promise
	 */
	function Promise(then, inspect) {
		this.then = then;
		this.inspect = inspect;
	}

	Promise.prototype = {
		/**
		 * Register a rejection handler.  Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		otherwise: function(onRejected) {
			return this.then(undef, onRejected);
		},

		/**
		 * Ensures that onFulfilledOrRejected will be called regardless of whether
		 * this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
		 * receive the promises' value or reason.  Any returned value will be disregarded.
		 * onFulfilledOrRejected may throw or return a rejected promise to signal
		 * an additional error.
		 * @param {function} onFulfilledOrRejected handler to be called regardless of
		 *  fulfillment or rejection
		 * @returns {Promise}
		 */
		ensure: function(onFulfilledOrRejected) {
			return this.then(injectHandler, injectHandler)['yield'](this);

			function injectHandler() {
				return resolve(onFulfilledOrRejected());
			}
		},

		/**
		 * Shortcut for .then(function() { return value; })
		 * @param  {*} value
		 * @return {Promise} a promise that:
		 *  - is fulfilled if value is not a promise, or
		 *  - if value is a promise, will fulfill with its value, or reject
		 *    with its reason.
		 */
		'yield': function(value) {
			return this.then(function() {
				return value;
			});
		},

		/**
		 * Assumes that this promise will fulfill with an array, and arranges
		 * for the onFulfilled to be called with the array as its argument list
		 * i.e. onFulfilled.apply(undefined, array).
		 * @param {function} onFulfilled function to receive spread arguments
		 * @return {Promise}
		 */
		spread: function(onFulfilled) {
			return this.then(function(array) {
				// array may contain promises, so resolve its contents.
				return all(array, function(array) {
					return onFulfilled.apply(undef, array);
				});
			});
		},

		/**
		 * Shortcut for .then(onFulfilledOrRejected, onFulfilledOrRejected)
		 * @deprecated
		 */
		always: function(onFulfilledOrRejected, onProgress) {
			return this.then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress);
		}
	};

	/**
	 * Returns a resolved promise. The returned promise will be
	 *  - fulfilled with promiseOrValue if it is a value, or
	 *  - if promiseOrValue is a promise
	 *    - fulfilled with promiseOrValue's value after it is fulfilled
	 *    - rejected with promiseOrValue's reason after it is rejected
	 * @param  {*} value
	 * @return {Promise}
	 */
	function resolve(value) {
		return promise(function(resolve) {
			resolve(value);
		});
	}

	/**
	 * Returns a rejected promise for the supplied promiseOrValue.  The returned
	 * promise will be rejected with:
	 * - promiseOrValue, if it is a value, or
	 * - if promiseOrValue is a promise
	 *   - promiseOrValue's value after it is fulfilled
	 *   - promiseOrValue's reason after it is rejected
	 * @param {*} promiseOrValue the rejected value of the returned {@link Promise}
	 * @return {Promise} rejected {@link Promise}
	 */
	function reject(promiseOrValue) {
		return when(promiseOrValue, rejected);
	}

	/**
	 * Creates a {promise, resolver} pair, either or both of which
	 * may be given out safely to consumers.
	 * The resolver has resolve, reject, and progress.  The promise
	 * has then plus extended promise API.
	 *
	 * @return {{
	 * promise: Promise,
	 * resolve: function:Promise,
	 * reject: function:Promise,
	 * notify: function:Promise
	 * resolver: {
	 *	resolve: function:Promise,
	 *	reject: function:Promise,
	 *	notify: function:Promise
	 * }}}
	 */
	function defer() {
		var deferred, pending, resolved;

		// Optimize object shape
		deferred = {
			promise: undef, resolve: undef, reject: undef, notify: undef,
			resolver: { resolve: undef, reject: undef, notify: undef }
		};

		deferred.promise = pending = promise(makeDeferred);

		return deferred;

		function makeDeferred(resolvePending, rejectPending, notifyPending) {
			deferred.resolve = deferred.resolver.resolve = function(value) {
				if(resolved) {
					return resolve(value);
				}
				resolved = true;
				resolvePending(value);
				return pending;
			};

			deferred.reject  = deferred.resolver.reject  = function(reason) {
				if(resolved) {
					return resolve(rejected(reason));
				}
				resolved = true;
				rejectPending(reason);
				return pending;
			};

			deferred.notify  = deferred.resolver.notify  = function(update) {
				notifyPending(update);
				return update;
			};
		}
	}

	/**
	 * Creates a new promise whose fate is determined by resolver.
	 * @param {function} resolver function(resolve, reject, notify)
	 * @returns {Promise} promise whose fate is determine by resolver
	 */
	function promise(resolver) {
		return _promise(resolver, monitorApi.PromiseStatus && monitorApi.PromiseStatus());
	}

	/**
	 * Creates a new promise, linked to parent, whose fate is determined
	 * by resolver.
	 * @param {function} resolver function(resolve, reject, notify)
	 * @param {Promise?} status promise from which the new promise is begotten
	 * @returns {Promise} promise whose fate is determine by resolver
	 * @private
	 */
	function _promise(resolver, status) {
		var self, value, handlers = [];

		self = new Promise(then, inspect);

		// Call the provider resolver to seal the promise's fate
		try {
			resolver(promiseResolve, promiseReject, promiseNotify);
		} catch(e) {
			promiseReject(e);
		}

		// Return the promise
		return self;

		/**
		 * Register handlers for this promise.
		 * @param [onFulfilled] {Function} fulfillment handler
		 * @param [onRejected] {Function} rejection handler
		 * @param [onProgress] {Function} progress handler
		 * @return {Promise} new Promise
		 */
		function then(onFulfilled, onRejected, onProgress) {
			var next = _promise(function(resolve, reject, notify) {
				// if not resolved, push onto handlers, otherwise execute asap
				// but not in the current stack
				handlers ? handlers.push(run) : enqueue(function() { run(value); });

				function run(p) {
					p.then(onFulfilled, onRejected, onProgress)
						.then(resolve, reject, notify);
				}

			}, status && status.observed());

			return next;
		}

		function inspect() {
			return value ? value.inspect() : toPendingState();
		}

		/**
		 * Transition from pre-resolution state to post-resolution state, notifying
		 * all listeners of the ultimate fulfillment or rejection
		 * @param {*|Promise} val resolution value
		 */
		function promiseResolve(val) {
			if(!handlers) {
				return;
			}

			value = coerce(val);
			scheduleHandlers(handlers, value);
			handlers = undef;

			if (status) {
				value.then(
					function () { status.fulfilled(); },
					function(r) { status.rejected(r); }
				);
			}
		}

		/**
		 * Reject this promise with the supplied reason, which will be used verbatim.
		 * @param {*} reason reason for the rejection
		 */
		function promiseReject(reason) {
			promiseResolve(rejected(reason));
		}

		/**
		 * Issue a progress event, notifying all progress listeners
		 * @param {*} update progress event payload to pass to all listeners
		 */
		function promiseNotify(update) {
			if(handlers) {
				scheduleHandlers(handlers, progressing(update));
			}
		}
	}

	/**
	 * Coerces x to a trusted Promise
	 *
	 * @private
	 * @param {*} x thing to coerce
	 * @returns {Promise} Guaranteed to return a trusted Promise.  If x
	 *   is trusted, returns x, otherwise, returns a new, trusted, already-resolved
	 *   Promise whose resolution value is:
	 *   * the resolution value of x if it's a foreign promise, or
	 *   * x if it's a value
	 */
	function coerce(x) {
		if(x instanceof Promise) {
			return x;
		}

		if (!(x === Object(x) && 'then' in x)) {
			return fulfilled(x);
		}

		return promise(function(resolve, reject, notify) {
			enqueue(function() {
				try {
					// We must check and assimilate in the same tick, but not the
					// current tick, careful only to access promiseOrValue.then once.
					var untrustedThen = x.then;

					if(typeof untrustedThen === 'function') {
						fcall(untrustedThen, x, resolve, reject, notify);
					} else {
						// It's a value, create a fulfilled wrapper
						resolve(fulfilled(x));
					}

				} catch(e) {
					// Something went wrong, reject
					reject(e);
				}
			});
		});
	}

	/**
	 * Create an already-fulfilled promise for the supplied value
	 * @private
	 * @param {*} value
	 * @return {Promise} fulfilled promise
	 */
	function fulfilled(value) {
		var self = new Promise(function (onFulfilled) {
			try {
				return typeof onFulfilled == 'function'
					? coerce(onFulfilled(value)) : self;
			} catch (e) {
				return rejected(e);
			}
		}, function() {
			return toFulfilledState(value);
		});

		return self;
	}

	/**
	 * Create an already-rejected promise with the supplied rejection reason.
	 * @private
	 * @param {*} reason
	 * @return {Promise} rejected promise
	 */
	function rejected(reason) {
		var self = new Promise(function (_, onRejected) {
			try {
				return typeof onRejected == 'function'
					? coerce(onRejected(reason)) : self;
			} catch (e) {
				return rejected(e);
			}
		}, function() {
			return toRejectedState(reason);
		});

		return self;
	}

	/**
	 * Create a progress promise with the supplied update.
	 * @private
	 * @param {*} update
	 * @return {Promise} progress promise
	 */
	function progressing(update) {
		var self = new Promise(function (_, __, onProgress) {
			try {
				return typeof onProgress == 'function'
					? progressing(onProgress(update)) : self;
			} catch (e) {
				return progressing(e);
			}
		});

		return self;
	}

	/**
	 * Schedule a task that will process a list of handlers
	 * in the next queue drain run.
	 * @private
	 * @param {Array} handlers queue of handlers to execute
	 * @param {*} value passed as the only arg to each handler
	 */
	function scheduleHandlers(handlers, value) {
		enqueue(function() {
			var handler, i = 0;
			while (handler = handlers[i++]) {
				handler(value);
			}
		});
	}

	/**
	 * Determines if promiseOrValue is a promise or not
	 *
	 * @param {*} promiseOrValue anything
	 * @returns {boolean} true if promiseOrValue is a {@link Promise}
	 */
	function isPromise(promiseOrValue) {
		return promiseOrValue && typeof promiseOrValue.then === 'function';
	}

	/**
	 * Initiates a competitive race, returning a promise that will resolve when
	 * howMany of the supplied promisesOrValues have resolved, or will reject when
	 * it becomes impossible for howMany to resolve, for example, when
	 * (promisesOrValues.length - howMany) + 1 input promises reject.
	 *
	 * @param {Array} promisesOrValues array of anything, may contain a mix
	 *      of promises and values
	 * @param howMany {number} number of promisesOrValues to resolve
	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
	 * @returns {Promise} promise that will resolve to an array of howMany values that
	 *  resolved first, or will reject with an array of
	 *  (promisesOrValues.length - howMany) + 1 rejection reasons.
	 */
	function some(promisesOrValues, howMany, onFulfilled, onRejected, onProgress) {

		return when(promisesOrValues, function(promisesOrValues) {

			return promise(resolveSome).then(onFulfilled, onRejected, onProgress);

			function resolveSome(resolve, reject, notify) {
				var toResolve, toReject, values, reasons, fulfillOne, rejectOne, len, i;

				len = promisesOrValues.length >>> 0;

				toResolve = Math.max(0, Math.min(howMany, len));
				values = [];

				toReject = (len - toResolve) + 1;
				reasons = [];

				// No items in the input, resolve immediately
				if (!toResolve) {
					resolve(values);

				} else {
					rejectOne = function(reason) {
						reasons.push(reason);
						if(!--toReject) {
							fulfillOne = rejectOne = identity;
							reject(reasons);
						}
					};

					fulfillOne = function(val) {
						// This orders the values based on promise resolution order
						values.push(val);
						if (!--toResolve) {
							fulfillOne = rejectOne = identity;
							resolve(values);
						}
					};

					for(i = 0; i < len; ++i) {
						if(i in promisesOrValues) {
							when(promisesOrValues[i], fulfiller, rejecter, notify);
						}
					}
				}

				function rejecter(reason) {
					rejectOne(reason);
				}

				function fulfiller(val) {
					fulfillOne(val);
				}
			}
		});
	}

	/**
	 * Initiates a competitive race, returning a promise that will resolve when
	 * any one of the supplied promisesOrValues has resolved or will reject when
	 * *all* promisesOrValues have rejected.
	 *
	 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
	 *      of {@link Promise}s and values
	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
	 * @returns {Promise} promise that will resolve to the value that resolved first, or
	 * will reject with an array of all rejected inputs.
	 */
	function any(promisesOrValues, onFulfilled, onRejected, onProgress) {

		function unwrapSingleResult(val) {
			return onFulfilled ? onFulfilled(val[0]) : val[0];
		}

		return some(promisesOrValues, 1, unwrapSingleResult, onRejected, onProgress);
	}

	/**
	 * Return a promise that will resolve only once all the supplied promisesOrValues
	 * have resolved. The resolution value of the returned promise will be an array
	 * containing the resolution values of each of the promisesOrValues.
	 * @memberOf when
	 *
	 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
	 *      of {@link Promise}s and values
	 * @param {function?} [onFulfilled] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onRejected] DEPRECATED, use returnedPromise.then()
	 * @param {function?} [onProgress] DEPRECATED, use returnedPromise.then()
	 * @returns {Promise}
	 */
	function all(promisesOrValues, onFulfilled, onRejected, onProgress) {
		return _map(promisesOrValues, identity).then(onFulfilled, onRejected, onProgress);
	}

	/**
	 * Joins multiple promises into a single returned promise.
	 * @return {Promise} a promise that will fulfill when *all* the input promises
	 * have fulfilled, or will reject when *any one* of the input promises rejects.
	 */
	function join(/* ...promises */) {
		return _map(arguments, identity);
	}

	/**
	 * Settles all input promises such that they are guaranteed not to
	 * be pending once the returned promise fulfills. The returned promise
	 * will always fulfill, except in the case where `array` is a promise
	 * that rejects.
	 * @param {Array|Promise} array or promise for array of promises to settle
	 * @returns {Promise} promise that always fulfills with an array of
	 *  outcome snapshots for each input promise.
	 */
	function settle(array) {
		return _map(array, toFulfilledState, toRejectedState);
	}

	/**
	 * Promise-aware array map function, similar to `Array.prototype.map()`,
	 * but input array may contain promises or values.
	 * @param {Array|Promise} array array of anything, may contain promises and values
	 * @param {function} mapFunc map function which may return a promise or value
	 * @returns {Promise} promise that will fulfill with an array of mapped values
	 *  or reject if any input promise rejects.
	 */
	function map(array, mapFunc) {
		return _map(array, mapFunc);
	}

	/**
	 * Internal map that allows a fallback to handle rejections
	 * @param {Array|Promise} array array of anything, may contain promises and values
	 * @param {function} mapFunc map function which may return a promise or value
	 * @param {function?} fallback function to handle rejected promises
	 * @returns {Promise} promise that will fulfill with an array of mapped values
	 *  or reject if any input promise rejects.
	 */
	function _map(array, mapFunc, fallback) {
		return when(array, function(array) {

			return promise(resolveMap);

			function resolveMap(resolve, reject, notify) {
				var results, len, toResolve, i;

				// Since we know the resulting length, we can preallocate the results
				// array to avoid array expansions.
				toResolve = len = array.length >>> 0;
				results = [];

				if(!toResolve) {
					resolve(results);
					return;
				}

				// Since mapFunc may be async, get all invocations of it into flight
				for(i = 0; i < len; i++) {
					if(i in array) {
						resolveOne(array[i], i);
					} else {
						--toResolve;
					}
				}

				function resolveOne(item, i) {
					when(item, mapFunc, fallback).then(function(mapped) {
						results[i] = mapped;

						if(!--toResolve) {
							resolve(results);
						}
					}, reject, notify);
				}
			}
		});
	}

	/**
	 * Traditional reduce function, similar to `Array.prototype.reduce()`, but
	 * input may contain promises and/or values, and reduceFunc
	 * may return either a value or a promise, *and* initialValue may
	 * be a promise for the starting value.
	 *
	 * @param {Array|Promise} promise array or promise for an array of anything,
	 *      may contain a mix of promises and values.
	 * @param {function} reduceFunc reduce function reduce(currentValue, nextValue, index, total),
	 *      where total is the total number of items being reduced, and will be the same
	 *      in each call to reduceFunc.
	 * @returns {Promise} that will resolve to the final reduced value
	 */
	function reduce(promise, reduceFunc /*, initialValue */) {
		var args = fcall(slice, arguments, 1);

		return when(promise, function(array) {
			var total;

			total = array.length;

			// Wrap the supplied reduceFunc with one that handles promises and then
			// delegates to the supplied.
			args[0] = function (current, val, i) {
				return when(current, function (c) {
					return when(val, function (value) {
						return reduceFunc(c, value, i, total);
					});
				});
			};

			return reduceArray.apply(array, args);
		});
	}

	// Snapshot states

	/**
	 * Creates a fulfilled state snapshot
	 * @private
	 * @param {*} x any value
	 * @returns {{state:'fulfilled',value:*}}
	 */
	function toFulfilledState(x) {
		return { state: 'fulfilled', value: x };
	}

	/**
	 * Creates a rejected state snapshot
	 * @private
	 * @param {*} x any reason
	 * @returns {{state:'rejected',reason:*}}
	 */
	function toRejectedState(x) {
		return { state: 'rejected', reason: x };
	}

	/**
	 * Creates a pending state snapshot
	 * @private
	 * @returns {{state:'pending'}}
	 */
	function toPendingState() {
		return { state: 'pending' };
	}

	//
	// Utilities, etc.
	//

	var reduceArray, slice, fcall, nextTick, handlerQueue,
		setTimeout, funcProto, call, arrayProto, monitorApi, undef;

	//
	// Shared handler queue processing
	//
	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for
	// next-tick conflation.

	handlerQueue = [];

	/**
	 * Enqueue a task. If the queue is not currently scheduled to be
	 * drained, schedule it.
	 * @param {function} task
	 */
	function enqueue(task) {
		if(handlerQueue.push(task) === 1) {
			nextTick(drainQueue);
		}
	}

	/**
	 * Drain the handler queue entirely, being careful to allow the
	 * queue to be extended while it is being processed, and to continue
	 * processing until it is truly empty.
	 */
	function drainQueue() {
		var task, i = 0;

		while(task = handlerQueue[i++]) {
			task();
		}

		handlerQueue = [];
	}

	//
	// Capture function and array utils
	//
	/*global setImmediate,process,vertx*/

	// Allow attaching the monitor to when() if env has no console
	monitorApi = typeof console != 'undefined' ? console : when;

	// capture setTimeout to avoid being caught by fake timers used in time based tests
	setTimeout = global.setTimeout;
	// Prefer setImmediate, cascade to node, vertx and finally setTimeout
	nextTick = typeof setImmediate === 'function' ? setImmediate.bind(global)
		: typeof process === 'object' && process.nextTick ? process.nextTick
		: typeof vertx === 'object' ? vertx.runOnLoop // vert.x
			: function(task) { setTimeout(task, 0); }; // fallback

	// Safe function calls
	funcProto = Function.prototype;
	call = funcProto.call;
	fcall = funcProto.bind
		? call.bind(call)
		: function(f, context) {
			return f.apply(context, slice.call(arguments, 2));
		};

	// Safe array ops
	arrayProto = [];
	slice = arrayProto.slice;

	// ES5 reduce implementation if native not available
	// See: http://es5.github.com/#x15.4.4.21 as there are many
	// specifics and edge cases.  ES5 dictates that reduce.length === 1
	// This implementation deviates from ES5 spec in the following ways:
	// 1. It does not check if reduceFunc is a Callable
	reduceArray = arrayProto.reduce ||
		function(reduceFunc /*, initialValue */) {
			/*jshint maxcomplexity: 7*/
			var arr, args, reduced, len, i;

			i = 0;
			arr = Object(this);
			len = arr.length >>> 0;
			args = arguments;

			// If no initialValue, use first item of array (we know length !== 0 here)
			// and adjust i to start at second item
			if(args.length <= 1) {
				// Skip to the first real element in the array
				for(;;) {
					if(i in arr) {
						reduced = arr[i++];
						break;
					}

					// If we reached the end of the array without finding any real
					// elements, it's a TypeError
					if(++i >= len) {
						throw new TypeError();
					}
				}
			} else {
				// If initialValue provided, use it
				reduced = args[1];
			}

			// Do the actual reduce
			for(;i < len; ++i) {
				if(i in arr) {
					reduced = reduceFunc(reduced, arr[i], i, arr);
				}
			}

			return reduced;
		};

	function identity(x) {
		return x;
	}

	return when;
});
})(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(); },
	this
);

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {
        function F() {}

        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init')) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {
            },

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }());

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else if (thatWords.length > 0xffff) {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            } else {
                // Copy all words at once
                thisWords.push.apply(thisWords, thatWords);
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push((Math.random() * 0x100000000) | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (doFlush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512/32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math));

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var C_enc = C.enc;

    /**
     * Base64 encoding strategy.
     */
    var Base64 = C_enc.Base64 = {
        /**
         * Converts a word array to a Base64 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;

            // Clamp excess bits
            wordArray.clamp();

            // Convert
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                }
            }

            // Add padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                while (base64Chars.length % 4) {
                    base64Chars.push(paddingChar);
                }
            }

            return base64Chars.join('');
        },

        /**
         * Converts a Base64 string to a word array.
         *
         * @param {string} base64Str The Base64 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
         */
        parse: function (base64Str) {
            // Shortcuts
            var base64StrLength = base64Str.length;
            var map = this._map;

            // Ignore padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                var paddingIndex = base64Str.indexOf(paddingChar);
                if (paddingIndex != -1) {
                    base64StrLength = paddingIndex;
                }
            }

            // Convert
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
                    var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
                    words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
                    nBytes++;
                }
            }

            return WordArray.create(words, nBytes);
        },

        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    };
}());

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var C_algo = C.algo;

    /**
     * HMAC algorithm.
     */
    var HMAC = C_algo.HMAC = Base.extend({
        /**
         * Initializes a newly created HMAC.
         *
         * @param {Hasher} hasher The hash algorithm to use.
         * @param {WordArray|string} key The secret key.
         *
         * @example
         *
         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
         */
        init: function (hasher, key) {
            // Init hasher
            hasher = this._hasher = new hasher.init();

            // Convert string to WordArray, else assume WordArray already
            if (typeof key == 'string') {
                key = Utf8.parse(key);
            }

            // Shortcuts
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;

            // Allow arbitrary length keys
            if (key.sigBytes > hasherBlockSizeBytes) {
                key = hasher.finalize(key);
            }

            // Clamp excess bits
            key.clamp();

            // Clone key for inner and outer pads
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();

            // Shortcuts
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;

            // XOR keys with pad constants
            for (var i = 0; i < hasherBlockSize; i++) {
                oKeyWords[i] ^= 0x5c5c5c5c;
                iKeyWords[i] ^= 0x36363636;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

            // Set initial values
            this.reset();
        },

        /**
         * Resets this HMAC to its initial state.
         *
         * @example
         *
         *     hmacHasher.reset();
         */
        reset: function () {
            // Shortcut
            var hasher = this._hasher;

            // Reset
            hasher.reset();
            hasher.update(this._iKey);
        },

        /**
         * Updates this HMAC with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {HMAC} This HMAC instance.
         *
         * @example
         *
         *     hmacHasher.update('message');
         *     hmacHasher.update(wordArray);
         */
        update: function (messageUpdate) {
            this._hasher.update(messageUpdate);

            // Chainable
            return this;
        },

        /**
         * Finalizes the HMAC computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The HMAC.
         *
         * @example
         *
         *     var hmac = hmacHasher.finalize();
         *     var hmac = hmacHasher.finalize('message');
         *     var hmac = hmacHasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Shortcut
            var hasher = this._hasher;

            // Compute HMAC
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

            return hmac;
        }
    });
}());

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function (Math) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Initialization and round constants tables
    var H = [];
    var K = [];

    // Compute constants
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    // Reusable object
    var W = [];

    /**
     * SHA-256 hash algorithm.
     */
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            // Computation
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                   (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                   (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();

            // Return final computed hash
            return this._hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA256('message');
     *     var hash = CryptoJS.SHA256(wordArray);
     */
    C.SHA256 = Hasher._createHelper(SHA256);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA256(message, key);
     */
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var WordArray = C_lib.WordArray;
    var C_algo = C.algo;
    var SHA1 = C_algo.SHA1;
    var HMAC = C_algo.HMAC;

    /**
     * Password-Based Key Derivation Function 2 algorithm.
     */
    var PBKDF2 = C_algo.PBKDF2 = Base.extend({
        /**
         * Configuration options.
         *
         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
         * @property {Hasher} hasher The hasher to use. Default: SHA1
         * @property {number} iterations The number of iterations to perform. Default: 1
         */
        cfg: Base.extend({
            keySize: 128/32,
            hasher: SHA1,
            iterations: 1
        }),

        /**
         * Initializes a newly created key derivation function.
         *
         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
         *
         * @example
         *
         *     var kdf = CryptoJS.algo.PBKDF2.create();
         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
         */
        init: function (cfg) {
            this.cfg = this.cfg.extend(cfg);
        },

        /**
         * Computes the Password-Based Key Derivation Function 2.
         *
         * @param {WordArray|string} password The password.
         * @param {WordArray|string} salt A salt.
         *
         * @return {WordArray} The derived key.
         *
         * @example
         *
         *     var key = kdf.compute(password, salt);
         */
        compute: function (password, salt) {
            // Shortcut
            var cfg = this.cfg;

            // Init HMAC
            var hmac = HMAC.create(cfg.hasher, password);

            // Initial values
            var derivedKey = WordArray.create();
            var blockIndex = WordArray.create([0x00000001]);

            // Shortcuts
            var derivedKeyWords = derivedKey.words;
            var blockIndexWords = blockIndex.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;

            // Generate key
            while (derivedKeyWords.length < keySize) {
                var block = hmac.update(salt).finalize(blockIndex);
                hmac.reset();

                // Shortcuts
                var blockWords = block.words;
                var blockWordsLength = blockWords.length;

                // Iterations
                var intermediate = block;
                for (var i = 1; i < iterations; i++) {
                    intermediate = hmac.finalize(intermediate);
                    hmac.reset();

                    // Shortcut
                    var intermediateWords = intermediate.words;

                    // XOR intermediate with block
                    for (var j = 0; j < blockWordsLength; j++) {
                        blockWords[j] ^= intermediateWords[j];
                    }
                }

                derivedKey.concat(block);
                blockIndexWords[0]++;
            }
            derivedKey.sigBytes = keySize * 4;

            return derivedKey;
        }
    });

    /**
     * Computes the Password-Based Key Derivation Function 2.
     *
     * @param {WordArray|string} password The password.
     * @param {WordArray|string} salt A salt.
     * @param {Object} cfg (Optional) The configuration options to use for this computation.
     *
     * @return {WordArray} The derived key.
     *
     * @static
     *
     * @example
     *
     *     var key = CryptoJS.PBKDF2(password, salt);
     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
     */
    C.PBKDF2 = function (password, salt, cfg) {
        return PBKDF2.create(cfg).compute(password, salt);
    };
}());

/** @license MIT License (c) 2011-2013 Copyright Tavendo GmbH. */

/**
 * AutobahnJS - http://autobahn.ws
 *
 * A lightweight implementation of
 *
 *   WAMP (The WebSocket Application Messaging Protocol) - http://wamp.ws
 *
 * Provides asynchronous RPC/PubSub over WebSocket.
 *
 * Copyright 2011-2013 Tavendo GmbH. Licensed under the MIT License.
 * See license text at http://www.opensource.org/licenses/mit-license.php
 */

/*global console: false, MozWebSocket: false, when: false, CryptoJS: false */

"use strict";


/** @define {string} */
var AUTOBAHNJS_VERSION = '?.?.?';

/** @define {boolean} */
var AUTOBAHNJS_DEBUG = true;



var ab = window.ab = {};

ab._version = AUTOBAHNJS_VERSION;


/**
 * Fallbacks for browsers lacking
 *
 *    Array.prototype.indexOf
 *    Array.prototype.forEach
 *
 * most notably MSIE8.
 *
 * Source:
 *    https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
 *    https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
 */
(function () {
   if (!Array.prototype.indexOf) {
      Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
         "use strict";
         if (this === null) {
            throw new TypeError();
         }
         var t = new Object(this);
         var len = t.length >>> 0;
         if (len === 0) {
            return -1;
         }
         var n = 0;
         if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n !== n) { // shortcut for verifying if it's NaN
               n = 0;
            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
               n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
         }
         if (n >= len) {
            return -1;
         }
         var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
         for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
               return k;
            }
         }
         return -1;
      };
   }

   if (!Array.prototype.forEach) {

      Array.prototype.forEach = function (callback, thisArg) {

         var T, k;

         if (this === null) {
            throw new TypeError(" this is null or not defined");
         }

         // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
         var O = new Object(this);

         // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
         // 3. Let len be ToUint32(lenValue).
         var len = O.length >>> 0; // Hack to convert O.length to a UInt32

         // 4. If IsCallable(callback) is false, throw a TypeError exception.
         // See: http://es5.github.com/#x9.11
         if ({}.toString.call(callback) !== "[object Function]") {
            throw new TypeError(callback + " is not a function");
         }

         // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
         if (thisArg) {
            T = thisArg;
         }

         // 6. Let k be 0
         k = 0;

         // 7. Repeat, while k < len
         while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

               // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
               kValue = O[k];

               // ii. Call the Call internal method of callback with T as the this value and
               // argument list containing kValue, k, and O.
               callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
         }
         // 8. return undefined
      };
   }

})();


// Helper to slice out browser / version from userAgent
ab._sliceUserAgent = function (str, delim, delim2) {
   var ver = [];
   var ua = navigator.userAgent;
   var i = ua.indexOf(str);
   var j = ua.indexOf(delim, i);
   if (j < 0) {
      j = ua.length;
   }
   var agent = ua.slice(i, j).split(delim2);
   var v = agent[1].split('.');
   for (var k = 0; k < v.length; ++k) {
      ver.push(parseInt(v[k], 10));
   }
   return {name: agent[0], version: ver};
};

/**
 * Detect browser and browser version.
 */
ab.getBrowser = function () {

   var ua = navigator.userAgent;
   if (ua.indexOf("Chrome") > -1) {
      return ab._sliceUserAgent("Chrome", " ", "/");
   } else if (ua.indexOf("Safari") > -1) {
      return ab._sliceUserAgent("Safari", " ", "/");
   } else if (ua.indexOf("Firefox") > -1) {
      return ab._sliceUserAgent("Firefox", " ", "/");
   } else if (ua.indexOf("MSIE") > -1) {
      return ab._sliceUserAgent("MSIE", ";", " ");
   } else {
      return null;
   }
};


ab.getServerUrl = function (wsPath, fallbackUrl) {
   if (window.location.protocol === "file:") {
      if (fallbackUrl) {
         return fallbackUrl;
      } else {
         return "ws://127.0.0.1/ws";
      }
   } else {
      var scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      var port = window.location.port !== "" ? ':' + window.location.port : '';
      var path = wsPath ? wsPath : 'ws';
      return scheme + window.location.hostname + port + "/" + path;
   }
};


// Logging message for unsupported browser.
ab.browserNotSupportedMessage = "Browser does not support WebSockets (RFC6455)";


// PBKDF2-base key derivation function for salted WAMP-CRA
ab.deriveKey = function (secret, extra) {
   if (extra && extra.salt) {
      var salt = extra.salt;
      var keylen = extra.keylen || 32;
      var iterations = extra.iterations || 10000;
      var key = CryptoJS.PBKDF2(secret, salt, { keySize: keylen / 4, iterations: iterations, hasher: CryptoJS.algo.SHA256 });
      return key.toString(CryptoJS.enc.Base64);
   } else {
      return secret;
   }
};


ab._idchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
ab._idlen = 16;
ab._subprotocol = "wamp";

ab._newid = function () {
   var id = "";
   for (var i = 0; i < ab._idlen; i += 1) {
      id += ab._idchars.charAt(Math.floor(Math.random() * ab._idchars.length));
   }
   return id;
};

ab._newidFast = function () {
    return Math.random().toString(36);
};

ab.log = function () {
      //console.log.apply(console, !!arguments.length ? arguments : [this]);
      if (arguments.length > 1) {
         console.group("Log Item");
         for (var i = 0; i < arguments.length; i += 1) {
            console.log(arguments[i]);
         }
         console.groupEnd();
      } else {
         console.log(arguments[0]);
      }
};

ab._debugrpc = false;
ab._debugpubsub = false;
ab._debugws = false;
ab._debugconnect = false;

ab.debug = function (debugWamp, debugWs, debugConnect) {
   if ("console" in window) {
      ab._debugrpc = debugWamp;
      ab._debugpubsub = debugWamp;
      ab._debugws = debugWs;
      ab._debugconnect = debugConnect;
   } else {
      throw "browser does not support console object";
   }
};

ab.version = function () {
   return ab._version;
};

ab.PrefixMap = function () {

   var self = this;
   self._index = {};
   self._rindex = {};
};

ab.PrefixMap.prototype.get = function (prefix) {

   var self = this;
   return self._index[prefix];
};

ab.PrefixMap.prototype.set = function (prefix, uri) {

   var self = this;
   self._index[prefix] = uri;
   self._rindex[uri] = prefix;
};

ab.PrefixMap.prototype.setDefault = function (uri) {

   var self = this;
   self._index[""] = uri;
   self._rindex[uri] = "";
};

ab.PrefixMap.prototype.remove = function (prefix) {

   var self = this;
   var uri = self._index[prefix];
   if (uri) {
      delete self._index[prefix];
      delete self._rindex[uri];
   }
};

ab.PrefixMap.prototype.resolve = function (curie, pass) {

   var self = this;

   // skip if not a CURIE
   var i = curie.indexOf(":");
   if (i >= 0) {
      var prefix = curie.substring(0, i);
      if (self._index[prefix]) {
         return self._index[prefix] + curie.substring(i + 1);
      }
   }

   // either pass-through or null
   if (pass === true) {
      return curie;
   } else {
      return null;
   }
};

ab.PrefixMap.prototype.shrink = function (uri, pass) {

   var self = this;

   for (var i = uri.length; i > 0; i -= 1) {
      var u = uri.substring(0, i);
      var p = self._rindex[u];
      if (p) {
         return p + ":" + uri.substring(i);
      }
   }

   // either pass-through or null
   if (pass === true) {
      return uri;
   } else {
      return null;
   }
};


ab._MESSAGE_TYPEID_WELCOME        = 0;
ab._MESSAGE_TYPEID_PREFIX         = 1;
ab._MESSAGE_TYPEID_CALL           = 2;
ab._MESSAGE_TYPEID_CALL_RESULT    = 3;
ab._MESSAGE_TYPEID_CALL_ERROR     = 4;
ab._MESSAGE_TYPEID_SUBSCRIBE      = 5;
ab._MESSAGE_TYPEID_UNSUBSCRIBE    = 6;
ab._MESSAGE_TYPEID_PUBLISH        = 7;
ab._MESSAGE_TYPEID_EVENT          = 8;

ab.CONNECTION_CLOSED = 0;
ab.CONNECTION_LOST = 1;
ab.CONNECTION_RETRIES_EXCEEDED = 2;
ab.CONNECTION_UNREACHABLE = 3;
ab.CONNECTION_UNSUPPORTED = 4;
ab.CONNECTION_UNREACHABLE_SCHEDULED_RECONNECT = 5;
ab.CONNECTION_LOST_SCHEDULED_RECONNECT = 6;

ab.Deferred = when.defer;
//ab.Deferred = jQuery.Deferred;

ab._construct = function (url, protocols) {
   if ("WebSocket" in window) {
      // Chrome, MSIE, newer Firefox
      if (protocols) {
         return new WebSocket(url, protocols);
      } else {
         return new WebSocket(url);
      }
   } else if ("MozWebSocket" in window) {
      // older versions of Firefox prefix the WebSocket object
      if (protocols) {
         return new MozWebSocket(url, protocols);
      } else {
         return new MozWebSocket(url);
      }
   } else {
      return null;
   }
};

ab.Session = function (wsuri, onopen, onclose, options) {

   var self = this;

   self._wsuri = wsuri;
   self._options = options;
   self._websocket_onopen = onopen;
   self._websocket_onclose = onclose;

   self._websocket = null;
   self._websocket_connected = false;

   self._session_id = null;
   self._wamp_version = null;
   self._server = null;

   self._calls = {};
   self._subscriptions = {};
   self._prefixes = new ab.PrefixMap();

   self._txcnt = 0;
   self._rxcnt = 0;

   if (self._options && self._options.skipSubprotocolAnnounce) {
      self._websocket = ab._construct(self._wsuri);
   } else {
      self._websocket = ab._construct(self._wsuri, [ab._subprotocol]);
   }

   if (!self._websocket) {
      if (onclose !== undefined) {
         onclose(ab.CONNECTION_UNSUPPORTED);
         return;
      } else {
         throw ab.browserNotSupportedMessage;
      }
   }

   self._websocket.onmessage = function (e)
   {
      if (ab._debugws) {
         self._rxcnt += 1;
         console.group("WS Receive");
         console.info(self._wsuri + "  [" + self._session_id + "]");
         console.log(self._rxcnt);
         console.log(e.data);
         console.groupEnd();
      }

      var o = JSON.parse(e.data);
      if (o[1] in self._calls)
      {
         if (o[0] === ab._MESSAGE_TYPEID_CALL_RESULT) {

            var dr = self._calls[o[1]];
            var r = o[2];

            if (ab._debugrpc && dr._ab_callobj !== undefined) {
               console.group("WAMP Call", dr._ab_callobj[2]);
               console.timeEnd(dr._ab_tid);
               console.group("Arguments");
               for (var i = 3; i < dr._ab_callobj.length; i += 1) {
                  var arg = dr._ab_callobj[i];
                  if (arg !== undefined) {
                     console.log(arg);
                  } else {
                     break;
                  }
               }
               console.groupEnd();
               console.group("Result");
               console.log(r);
               console.groupEnd();
               console.groupEnd();
            }

            dr.resolve(r);
         }
         else if (o[0] === ab._MESSAGE_TYPEID_CALL_ERROR) {

            var de = self._calls[o[1]];
            var uri_ = o[2];
            var desc_ = o[3];
            var detail_ = o[4];

            if (ab._debugrpc && de._ab_callobj !== undefined) {
               console.group("WAMP Call", de._ab_callobj[2]);
               console.timeEnd(de._ab_tid);
               console.group("Arguments");
               for (var j = 3; j < de._ab_callobj.length; j += 1) {
                  var arg2 = de._ab_callobj[j];
                  if (arg2 !== undefined) {
                     console.log(arg2);
                  } else {
                     break;
                  }
               }
               console.groupEnd();
               console.group("Error");
               console.log(uri_);
               console.log(desc_);
               if (detail_ !== undefined) {
                  console.log(detail_);
               }
               console.groupEnd();
               console.groupEnd();
            }

            if (detail_ !== undefined) {
               de.reject({uri: uri_, desc: desc_, detail: detail_});
            } else {
               de.reject({uri: uri_, desc: desc_});
            }
         }
         delete self._calls[o[1]];
      }
      else if (o[0] === ab._MESSAGE_TYPEID_EVENT)
      {
         var subid = self._prefixes.resolve(o[1], true);
         if (subid in self._subscriptions) {

            var uri2 = o[1];
            var val = o[2];

            if (ab._debugpubsub) {
               console.group("WAMP Event");
               console.info(self._wsuri + "  [" + self._session_id + "]");
               console.log(uri2);
               console.log(val);
               console.groupEnd();
            }

            self._subscriptions[subid].forEach(function (callback) {

               callback(uri2, val);
            });
         }
         else {
            // ignore unsolicited event!
         }
      }
      else if (o[0] === ab._MESSAGE_TYPEID_WELCOME)
      {
         if (self._session_id === null) {
            self._session_id = o[1];
            self._wamp_version = o[2];
            self._server = o[3];

            if (ab._debugrpc || ab._debugpubsub) {
               console.group("WAMP Welcome");
               console.info(self._wsuri + "  [" + self._session_id + "]");
               console.log(self._wamp_version);
               console.log(self._server);
               console.groupEnd();
            }

            // only now that we have received the initial server-to-client
            // welcome message, fire application onopen() hook
            if (self._websocket_onopen !== null) {
               self._websocket_onopen();
            }
         } else {
            throw "protocol error (welcome message received more than once)";
         }
      }
   };

   self._websocket.onopen = function (e)
   {
      // check if we can speak WAMP!
      if (self._websocket.protocol !== ab._subprotocol) {

         if (typeof self._websocket.protocol === 'undefined') {
            // i.e. Safari does subprotocol negotiation (broken), but then
            // does NOT set the protocol attribute of the websocket object (broken)
            //
            if (ab._debugws) {
               console.group("WS Warning");
               console.info(self._wsuri);
               console.log("WebSocket object has no protocol attribute: WAMP subprotocol check skipped!");
               console.groupEnd();
            }
         }
         else if (self._options && self._options.skipSubprotocolCheck) {
            // WAMP subprotocol check disabled by session option
            //
            if (ab._debugws) {
               console.group("WS Warning");
               console.info(self._wsuri);
               console.log("Server does not speak WAMP, but subprotocol check disabled by option!");
               console.log(self._websocket.protocol);
               console.groupEnd();
            }
         } else {
            // we only speak WAMP .. if the server denied us this, we bail out.
            //
            self._websocket.close(1000, "server does not speak WAMP");
            throw "server does not speak WAMP (but '" + self._websocket.protocol + "' !)";
         }
      }
      if (ab._debugws) {
         console.group("WAMP Connect");
         console.info(self._wsuri);
         console.log(self._websocket.protocol);
         console.groupEnd();
      }
      self._websocket_connected = true;
   };

   self._websocket.onerror = function (e)
   {
      // FF fires this upon unclean closes
      // Chrome does not fire this
   };

   self._websocket.onclose = function (e)
   {
      if (ab._debugws) {
         if (self._websocket_connected) {
            console.log("Autobahn connection to " + self._wsuri + " lost (code " + e.code + ", reason '" + e.reason + "', wasClean " + e.wasClean + ").");
         } else {
            console.log("Autobahn could not connect to " + self._wsuri + " (code " + e.code + ", reason '" + e.reason + "', wasClean " + e.wasClean + ").");
         }
      }

      // fire app callback
      if (self._websocket_onclose !== undefined) {
         if (self._websocket_connected) {
            if (e.wasClean) {
               // connection was closed cleanly (closing HS was performed)
               self._websocket_onclose(ab.CONNECTION_CLOSED, "WS-" + e.code + ": " + e.reason);
            } else {
               // connection was closed uncleanly (lost without closing HS)
               self._websocket_onclose(ab.CONNECTION_LOST);
            }
         } else {
            // connection could not be established in the first place
            self._websocket_onclose(ab.CONNECTION_UNREACHABLE);
         }
      }

      // cleanup - reconnect requires a new session object!
      self._websocket_connected = false;
      self._wsuri = null;
      self._websocket_onopen = null;
      self._websocket_onclose = null;
      self._websocket = null;
   };

   self.log = function () {
      if (self._options && 'sessionIdent' in self._options) {
         console.group("WAMP Session '" + self._options.sessionIdent + "' [" + self._session_id + "]");
      } else {
         console.group("WAMP Session " + "[" + self._session_id + "]");
      }
      for (var i = 0; i < arguments.length; ++i) {
         console.log(arguments[i]);
      }
      console.groupEnd();
   };
};


ab.Session.prototype._send = function (msg) {

   var self = this;

   if (!self._websocket_connected) {
      throw "Autobahn not connected";
   }

   var rmsg;
	switch(true)
	{
      // In the event that prototype library is in existance run the toJSON method prototype provides
      // else run the standard JSON.stringify
      // this is a very clever problem that causes json to be double-quote-encoded.
		case window.Prototype && typeof top.window.__prototype_deleted === 'undefined':
		case typeof msg.toJSON === 'function':
			rmsg = msg.toJSON();
			break;

      // we could do instead
      // msg.toJSON = function(){return msg};
      // rmsg = JSON.stringify(msg);
		default:
			rmsg = JSON.stringify(msg);
	}

   self._websocket.send(rmsg);
   self._txcnt += 1;

   if (ab._debugws) {
      console.group("WS Send");
      console.info(self._wsuri + "  [" + self._session_id + "]");
      console.log(self._txcnt);
      console.log(rmsg);
      console.groupEnd();
   }
};


ab.Session.prototype.close = function () {

   var self = this;

   if (self._websocket_connected) {
      self._websocket.close();
   } else {
      //throw "Autobahn not connected";
   }
};


ab.Session.prototype.sessionid = function () {

   var self = this;
   return self._session_id;
};


ab.Session.prototype.wsuri = function () {

   var self = this;
   return self._wsuri;
};


ab.Session.prototype.shrink = function (uri, pass) {

   var self = this;
   if (pass === undefined) pass = true;
   return self._prefixes.shrink(uri, pass);
};


ab.Session.prototype.resolve = function (curie, pass) {

   var self = this;
   if (pass === undefined) pass = true;
   return self._prefixes.resolve(curie, pass);
};


ab.Session.prototype.prefix = function (prefix, uri) {

   var self = this;

/*
   if (self._prefixes.get(prefix) !== undefined) {
      throw "prefix '" + prefix + "' already defined";
   }
*/

   self._prefixes.set(prefix, uri);

   if (ab._debugrpc || ab._debugpubsub) {
      console.group("WAMP Prefix");
      console.info(self._wsuri + "  [" + self._session_id + "]");
      console.log(prefix);
      console.log(uri);
      console.groupEnd();
   }

   var msg = [ab._MESSAGE_TYPEID_PREFIX, prefix, uri];
   self._send(msg);
};


ab.Session.prototype.call = function () {

   var self = this;

   var d = new ab.Deferred();
   var callid;
   while (true) {
      callid = ab._newidFast();
      if (!(callid in self._calls)) {
         break;
      }
   }
   self._calls[callid] = d;

   var procuri = self._prefixes.shrink(arguments[0], true);
   var obj = [ab._MESSAGE_TYPEID_CALL, callid, procuri];
   for (var i = 1; i < arguments.length; i += 1) {
      obj.push(arguments[i]);
   }

   self._send(obj);

   if (ab._debugrpc) {
      d._ab_callobj = obj;
      d._ab_tid = self._wsuri + "  [" + self._session_id + "][" + callid + "]";
      console.time(d._ab_tid);
      console.info();
   }

   if (d.promise.then) {
      // whenjs has the actual user promise in an attribute
      return d.promise;
   } else {
      return d;
   }
};


ab.Session.prototype.subscribe = function (topicuri, callback) {

   var self = this;

   // subscribe by sending WAMP message when topic not already subscribed
   //
   var rtopicuri = self._prefixes.resolve(topicuri, true);
   if (!(rtopicuri in self._subscriptions)) {

      if (ab._debugpubsub) {
         console.group("WAMP Subscribe");
         console.info(self._wsuri + "  [" + self._session_id + "]");
         console.log(topicuri);
         console.log(callback);
         console.groupEnd();
      }

      var msg = [ab._MESSAGE_TYPEID_SUBSCRIBE, topicuri];
      self._send(msg);

      self._subscriptions[rtopicuri] = [];
   }

   // add callback to event listeners list if not already in list
   //
   var i = self._subscriptions[rtopicuri].indexOf(callback);
   if (i === -1) {
      self._subscriptions[rtopicuri].push(callback);
   }
   else {
      throw "callback " + callback + " already subscribed for topic " + rtopicuri;
   }
};


ab.Session.prototype.unsubscribe = function (topicuri, callback) {

   var self = this;

   var rtopicuri = self._prefixes.resolve(topicuri, true);
   if (!(rtopicuri in self._subscriptions)) {
      throw "not subscribed to topic " + rtopicuri;
   }
   else {
      var removed;
      if (callback !== undefined) {
         var idx = self._subscriptions[rtopicuri].indexOf(callback);
         if (idx !== -1) {
            removed = callback;
            self._subscriptions[rtopicuri].splice(idx, 1);
         }
         else {
            throw "no callback " + callback + " subscribed on topic " + rtopicuri;
         }
      }
      else {
         removed = self._subscriptions[rtopicuri].slice();
         self._subscriptions[rtopicuri] = [];
      }

      if (self._subscriptions[rtopicuri].length === 0) {

         delete self._subscriptions[rtopicuri];

         if (ab._debugpubsub) {
            console.group("WAMP Unsubscribe");
            console.info(self._wsuri + "  [" + self._session_id + "]");
            console.log(topicuri);
            console.log(removed);
            console.groupEnd();
         }

         var msg = [ab._MESSAGE_TYPEID_UNSUBSCRIBE, topicuri];
         self._send(msg);
      }
   }
};


ab.Session.prototype.publish = function () {

   var self = this;

   var topicuri = arguments[0];
   var event = arguments[1];

   var excludeMe = null;
   var exclude = null;
   var eligible = null;

   var msg = null;

   if (arguments.length > 3) {

      if (!(arguments[2] instanceof Array)) {
         throw "invalid argument type(s)";
      }
      if (!(arguments[3] instanceof Array)) {
         throw "invalid argument type(s)";
      }

      exclude = arguments[2];
      eligible = arguments[3];
      msg = [ab._MESSAGE_TYPEID_PUBLISH, topicuri, event, exclude, eligible];

   } else if (arguments.length > 2) {

      if (typeof(arguments[2]) === 'boolean') {

         excludeMe = arguments[2];
         msg = [ab._MESSAGE_TYPEID_PUBLISH, topicuri, event, excludeMe];

      } else if (arguments[2] instanceof Array) {

         exclude = arguments[2];
         msg = [ab._MESSAGE_TYPEID_PUBLISH, topicuri, event, exclude];

      } else {
         throw "invalid argument type(s)";
      }

   } else {

      msg = [ab._MESSAGE_TYPEID_PUBLISH, topicuri, event];
   }

   if (ab._debugpubsub) {
      console.group("WAMP Publish");
      console.info(self._wsuri + "  [" + self._session_id + "]");
      console.log(topicuri);
      console.log(event);

      if (excludeMe !== null) {
         console.log(excludeMe);
      } else {
         if (exclude !== null) {
            console.log(exclude);
            if (eligible !== null) {
               console.log(eligible);
            }
         }
      }
      console.groupEnd();
   }

   self._send(msg);
};


// allow both 2-party and 3-party authentication/authorization
// for 3-party: let C sign, but let both the B and C party authorize

ab.Session.prototype.authreq = function (appkey, extra) {
   return this.call("http://api.wamp.ws/procedure#authreq", appkey, extra);
};

ab.Session.prototype.authsign = function (challenge, secret) {
   if (!secret) {
      secret = "";
   }

   return CryptoJS.HmacSHA256(challenge, secret).toString(CryptoJS.enc.Base64);
};

ab.Session.prototype.auth = function (signature) {
   return this.call("http://api.wamp.ws/procedure#auth", signature);
};


ab._connect = function (peer) {

   // establish session to WAMP server
   var sess = new ab.Session(peer.wsuri,

      // fired when session has been opened
      function() {

         peer.connects += 1;
         peer.retryCount = 0;

         // we are connected .. do awesome stuff!
         peer.onConnect(sess);
      },

      // fired when session has been closed
      function(code, reason) {

         var stop = null;

         switch (code) {

            case ab.CONNECTION_CLOSED:
               // the session was closed by the app
               peer.onHangup(code, "Connection was closed properly [" + reason + "]");
               break;

            case ab.CONNECTION_UNSUPPORTED:
               // fatal: we miss our WebSocket object!
               peer.onHangup(code, "Browser does not support WebSocket.");
               break;

            case ab.CONNECTION_UNREACHABLE:

               peer.retryCount += 1;

               if (peer.connects === 0) {

                  // the connection could not be established in the first place
                  // which likely means invalid server WS URI or such things
                  peer.onHangup(code, "Connection could not be established.");

               } else {

                  // the connection was established at least once successfully,
                  // but now lost .. sane thing is to try automatic reconnects
                  if (peer.retryCount <= peer.options.maxRetries) {

                     // notify the app of scheduled reconnect
                     stop = peer.onHangup(ab.CONNECTION_UNREACHABLE_SCHEDULED_RECONNECT,
                                          "Connection unreachable - scheduled " + peer.retryCount + "th reconnect to occur in " + (peer.options.retryDelay / 1000) + " second(s).",
                                          {delay: peer.options.retryDelay,
                                           retries: peer.retryCount,
                                           maxretries: peer.options.maxRetries});

                     if (!stop) {
                        if (ab._debugconnect) {
                            console.log("Connection unreachable - retrying (" + peer.retryCount + ") ..");
                        }
                        window.setTimeout(ab._connect, peer.options.retryDelay, peer);
                     } else {
                        if (ab._debugconnect) {
                            console.log("Connection unreachable - retrying stopped by app");
                        }
                        peer.onHangup(ab.CONNECTION_RETRIES_EXCEEDED, "Number of connection retries exceeded.");
                     }

                  } else {
                     peer.onHangup(ab.CONNECTION_RETRIES_EXCEEDED, "Number of connection retries exceeded.");
                  }
               }
               break;

            case ab.CONNECTION_LOST:

               peer.retryCount += 1;

               if (peer.retryCount <= peer.options.maxRetries) {

                  // notify the app of scheduled reconnect
                  stop = peer.onHangup(ab.CONNECTION_LOST_SCHEDULED_RECONNECT,
                                       "Connection lost - scheduled " + peer.retryCount + "th reconnect to occur in " + (peer.options.retryDelay / 1000) + " second(s).",
                                       {delay: peer.options.retryDelay,
                                        retries: peer.retryCount,
                                        maxretries: peer.options.maxRetries});

                  if (!stop) {
                     if (ab._debugconnect) {
                         console.log("Connection lost - retrying (" + peer.retryCount + ") ..");
                     }
                     window.setTimeout(ab._connect, peer.options.retryDelay, peer);
                  } else {
                     if (ab._debugconnect) {
                         console.log("Connection lost - retrying stopped by app");
                     }
                     peer.onHangup(ab.CONNECTION_RETRIES_EXCEEDED, "Connection lost.");
                  }
               } else {
                  peer.onHangup(ab.CONNECTION_RETRIES_EXCEEDED, "Connection lost.");
               }
               break;

            default:
               throw "unhandled close code in ab._connect";
         }
      },

      peer.options // forward options to session class for specific WS/WAMP options
   );
};


ab.connect = function (wsuri, onconnect, onhangup, options) {

   var peer = {};
   peer.wsuri = wsuri;

   if (!options) {
      peer.options = {};
   } else {
      peer.options = options;
   }

   if (peer.options.retryDelay === undefined) {
      peer.options.retryDelay = 5000;
   }

   if (peer.options.maxRetries === undefined) {
      peer.options.maxRetries = 10;
   }

   if (peer.options.skipSubprotocolCheck === undefined) {
      peer.options.skipSubprotocolCheck = false;
   }

   if (peer.options.skipSubprotocolAnnounce === undefined) {
      peer.options.skipSubprotocolAnnounce = false;
   }

   if (!onconnect) {
      throw "onConnect handler required!";
   } else {
      peer.onConnect = onconnect;
   }

   if (!onhangup) {
      peer.onHangup = function (code, reason, detail) {
         if (ab._debugconnect) {
             console.log(code, reason, detail);
         }
      };
   } else {
      peer.onHangup = onhangup;
   }

   peer.connects = 0; // total number of successful connects
   peer.retryCount = 0; // number of retries since last successful connect

   ab._connect(peer);
};


ab.launch = function (appConfig, onOpen, onClose) {

   function Rpc(session, uri) {
      return function() {
         var args = [uri];
         for (var j = 0; j < arguments.length; ++j) {
            args.push(arguments[j]);
         }
         //arguments.unshift(uri);
         return ab.Session.prototype.call.apply(session, args);
      };
   }

   function createApi(session, perms) {
      session.api = {};
      for (var i = 0; i < perms.rpc.length; ++i) {
         var uri = perms.rpc[i].uri;

         var _method = uri.split("#")[1];
         var _class = uri.split("#")[0].split("/");
         _class = _class[_class.length - 1];

         if (!(_class in session.api)) {
            session.api[_class] = {};
         }

         session.api[_class][_method] = new Rpc(session, uri);
      }
   }

   ab.connect(appConfig.wsuri,

      // connection established handler
      function (session) {
         if (!appConfig.appkey || appConfig.appkey === "") {
            // Authenticate as anonymous ..
            session.authreq().then(function () {
               session.auth().then(function (permissions) {
                  //createApi(session, permissions);
                  if (onOpen) {
                     onOpen(session);
                  } else if (ab._debugconnect) {
                     session.log('Session opened.');
                  }
               }, session.log);
            }, session.log);
         } else {
            // Authenticate as appkey ..
            session.authreq(appConfig.appkey, appConfig.appextra).then(function (challenge) {

               var signature = null;

               if (typeof(appConfig.appsecret) === 'function') {
                  signature = appConfig.appsecret(challenge);
               } else {
                  // derive secret if salted WAMP-CRA
                  var secret = ab.deriveKey(appConfig.appsecret, JSON.parse(challenge).authextra);

                  // direct sign
                  signature = session.authsign(challenge, secret);
               }

               session.auth(signature).then(function (permissions) {
                  //createApi(session, permissions);
                  if (onOpen) {
                     onOpen(session);
                  } else if (ab._debugconnect) {
                     session.log('Session opened.');
                  }
               }, session.log);
            }, session.log);
         }
      },

      // connection lost handler
      function (code, reason, detail) {
         if (onClose) {
            onClose(code, reason, detail);
         } else if (ab._debugconnect) {
            ab.log('Session closed.', code, reason, detail);
         }
      },

      // WAMP session config
      appConfig.sessionConfig
   );
};

ab._UA_FIREFOX = new RegExp(".*Firefox/([0-9+]*).*")
ab._UA_CHROME = new RegExp(".*Chrome/([0-9+]*).*")
ab._UA_CHROMEFRAME = new RegExp(".*chromeframe/([0-9]*).*")
ab._UA_WEBKIT = new RegExp(".*AppleWebKit/([0-9+\.]*)\w*.*")
ab._UA_WEBOS = new RegExp(".*webOS/([0-9+\.]*)\w*.*")

ab._matchRegex = function(s, r) {
	var m = r.exec(s)
	if (m) return m[1]
	return m
};

ab.lookupWsSupport = function() {
	var ua = navigator.userAgent;

	// Internet Explorer
	if (ua.indexOf("MSIE") > -1) {
		if (ua.indexOf("MSIE 10") > -1)
			return [true,true,true]
		if (ua.indexOf("chromeframe") > -1) {
			var v = parseInt(ab._matchRegex(ua, ab._UA_CHROMEFRAME))
			if (v >= 14)
				return [true,false,true]
			return [false,false,false]
		}
		if (ua.indexOf("MSIE 8") > -1 || ua.indexOf("MSIE 9") > -1)
			return [true,true,true]
		return [false,false,false]
	}

	// Firefox
	else if (ua.indexOf("Firefox") > -1) {
		var v = parseInt(ab._matchRegex(ua, ab._UA_FIREFOX))
		if (v) {
			if (v >= 7)
				return [true,false,true]
			if (v >= 3)
				return [true,true,true]
			return [false,false,true]
		}
		return [false,false,true]

	}

	// Safari
	else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") == -1) {
		var v = ab._matchRegex(ua, ab._UA_WEBKIT)
		if (v) {
			if (ua.indexOf("Windows") > -1 && v == "534+") // Not sure about this test ~RMH
				return [true,false,true]
			if (ua.indexOf("Macintosh") > -1) {
				v = v.replace("+","").split(".")
				if ((parseInt(v[0]) == 535 && parseInt(v[1]) >= 24) || parseInt(v[0]) > 535)
					return [true,false,true]
			}
			if (ua.indexOf("webOS") > -1) {
				v = ab._matchRegex(ua, ab._UA_WEBOS).split(".")
				if (parseInt(v[0]) == 2)
					return [false,true,true]
				return [false,false,false]
			}
			return [true,true,true]
		}
		return [false,false,false]
	}

	// Chrome
	else if (ua.indexOf("Chrome") > -1) {
		var v = parseInt(ab._matchRegex(ua, ab._UA_CHROME))
		if (v) {
			if (v >= 14)
				return [true,false,true]
			if (v >= 4)
				return [true,true,true]
			return [false,false,true]
		}
		return [false,false,false]
	}

	// Android
	else if (ua.indexOf("Android") > -1) {
		// Firefox Mobile
		if (ua.indexOf("Firefox") > -1)
			return [true,false,true]
		// Chrome for Android
		else if (ua.indexOf("CrMo") > -1)
			return [true,false,true]
		// Opera Mobile
		else if (ua.indexOf("Opera") > -1)
			return [false,false,true]
		// Android Browser
		else if (ua.indexOf("CrMo") > -1)
			return [true,true,true]
		return [false,false,false]
	}

	// iOS
	else if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1 || ua.indexOf("iPod") > -1)
		return [false,false,true]

	// Unidentified
	return [false,false,false]


};

