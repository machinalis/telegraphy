/* globals Telegraphy */
(function (Telegraphy, window, document, undefined) {
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
            return tpl.replace(/{([^{}]*)}/g, function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            });
        },
        /**
         * Updates a single element, matching by id
         */
        updateElementWithField: function (ctx) {
            var element = document.getElementById(ctx.id);
            return Telegraphy.subscribe(ctx.eventName)
                .filter(ctx.filter)
                .onUpdate(function (event) {
                    element.textContent = event.data[ctx.field];
                });
        },
        /***
         * Manage a target list
         */
        manageList: function (ctx) {
            // Later explore spawning channels
            //
            return Telegraphy.subscribe(ctx.eventName)
                .onCreate(function (event) {
                    var element = document.getElementById(ctx.id),
                        li = document.createElement('li');
                    li.id = ctx.id + "_" + event.data.pk;
                    li.textContent = Telegraphy.utils.supplant(
                        ctx.format, event.data);
                    element.appendChild(li);
                })
                .onUpdate(function (event) {
                    var element = document.getElementById(
                        ctx.id + "_" + event.data.pk);
                    element.textContent = Telegraphy.utils.supplant(
                        ctx.format, event.data);
                })
                .onDelete(function (event) {
                    var element = document.getElementById(
                        ctx.id + "_" + event.data.pk);
                    element.remove();
                });
        },
        /**
         * Manages a table, in a similar fashion as list
         *
         */
        manageTable: function(ctx) {
            return Telegraphy.subscribe(ctx.eventName)
                .onCreate(function (event) {
                    var table = document.getElementById(ctx.id),
                        tr = document.createElement('tr');
                        tr.id = ctx.id + "_" + event.data.pk;
                    Telegraphy.utils.__buildTableRow(ctx, tr, event);
                    table.appendChild(tr);
                })
                .onUpdate(function (event) {
                    var tr = document.getElementById(
                        ctx.id + "_" + event.data.pk);
                    Telegraphy.utils.__buildTableRow(ctx, tr, event);
                })
                .onDelete(function (event) {
                    var element = document.getElementById(
                        ctx.id + "_" + event.data.pk);
                    element.remove();
                })
        },
        __buildTableRow: function (ctx, tr, event) {
            tr.textContent = '';
            _.each(ctx.fields, function (field) {
                var td = document.createElement('td');
                td.textContent = event.data[field];
                tr.appendChild(td);
            });
        }
    };
})(Telegraphy, window, document);
