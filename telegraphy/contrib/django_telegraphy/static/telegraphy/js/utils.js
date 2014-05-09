(function (Telegraphy, _) {
    "use strict";
    Telegraphy.utils = {

        /**
         * Naive templating utility
         * `tpl` is a string with braces: "Hello {name}"
         * `o` is plain javascript object , that contains IE {name: "World"}
         * this utility interpolates and return:
         *  "Hello World"
         *  Based on Douglas Crockford `supplant` function
         *  IMPORTANT: this is for basic interpolation, and maybe needs to
         *  be changed on future.
         */
        supplant: function (tpl, o) {
            return template.replace(/{([^{}]*)}/g, function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            });
        },
    };
})(Telegraphy, _);
