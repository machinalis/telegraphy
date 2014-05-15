/* globals Telegraphy, _ */
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
                .onDelete(_.bind(this.__deleteElement, ctx));
        },
        /**
         * Manages a table, in a similar fashion as list
         *
         */
        manageTable: function (ctx) {
            return Telegraphy.subscribe(ctx.eventName)
                .onCreate(_.bind(this.__addRow, ctx))
                .onUpdate(_.bind(this.__updateRow, ctx))
                .onDelete(_.bind(this.__deleteElement, ctx));
        },

        manageFilteredTable: function (ctx) {
            return Telegraphy.subscribe(ctx.eventName).filter(ctx.filter)
                .onCreate(_.bind(this.__addRow, ctx))
                .onUpdate(_.bind(this.__updateRow, ctx))
                .onDelete(_.bind(this.__deleteElement, ctx));
        },

        manageExcludedTable: function (ctx) {
            return Telegraphy.subscribe(ctx.eventName).exclude(ctx.exclude)
                .onCreate(_.bind(this.__addRow, ctx))
                .onUpdate(_.bind(this.__updateRow, ctx))
                .onDelete(_.bind(this.__deleteElement, ctx));
        },

        manageFixedTable: function (ctx) {
            return Telegraphy.subscribe(ctx.eventName).filter({pk__in: ctx.pks})
                .onUpdate(_.bind(this.__updateRow, ctx))
                .onDelete(_.bind(this.__deleteElement, ctx));
        },

        __buildTableRow: function (ctx, tr, event) {
            tr.textContent = '';
            _.each(ctx.fields, function (field) {
                var td = document.createElement('td');
                td.textContent = event.data[field];
                tr.appendChild(td);
            });
        },

        /**
         * Adds a new row to a table, has to be called, binded to config ctx
         */
        __addRow: function (event) {
            var table = document.getElementById(this.id),
                tr = document.createElement('tr');
            tr.id = this.id + "_" + event.data.pk;
            Telegraphy.utils.__buildTableRow(this, tr, event);
            table.children[0].appendChild(tr);
        },
        __updateRow: function (event) {
            var tr = document.getElementById(
                    this.id + "_" + event.data.pk);
            Telegraphy.utils.__buildTableRow(this, tr, event);
        },
        __deleteElement: function (event) {
            var element = document.getElementById(
                    this.id + "_" + event.data.pk);
            element.remove();
            if (this.pks) {
                _.remove(this.pks, function (value) {return value === event.data.pk; });
            }
        },
        /**
         * Manages a bootstrap progress bar
         */
        manageProgressBar: function (ctx) {
            var $element = $('#' + ctx.id);
            return Telegraphy.subscribe(ctx.eventName)
                .filter(ctx.filter)
                .onUpdate(function (event) {
                    var value = event.data[ctx.field],
                        percentage = value * 100 / ctx.max;
                    $element.text(value + ctx.suffix)
                        .css({width: percentage + "%"})
                        .attr('aria-valuenow', value);
                });

        }
    };
})(Telegraphy, window, document);
