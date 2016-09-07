define(['jquery', 'knockout', 'durandal/composition'], function ($, ko, composition) {
    ko.bindingHandlers.autosize = {
        init: function (element, valueAccessor, allBindingsAccessor, data, context) {
            autosize($(element), { setOverflowX: false, setOverflowY: false });
        },
        update: function (element, valueAccessor, allBindingsAccessor, data, context) {
            autosize.update($(element));
        }
    }

    composition.addBindingHandler('autosize');
});