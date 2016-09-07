define(['jquery', 'knockout'], function ($, ko) {
    ko.bindingHandlers.textArea = {
        init: function (element, valueAccessor, allBindingsAccessor, data, context) {
            ko.bindingHandlers.autosize.init(element, valueAccessor, allBindingsAccessor, data, context);
            ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor, data, context);
        },
        update: function (element, valueAccessor, allBindingsAccessor, data, context) {
            ko.bindingHandlers.value.update(element, valueAccessor, allBindingsAccessor, data, context);
            ko.bindingHandlers.autosize.update(element, valueAccessor, allBindingsAccessor, data, context);
        }
    };
});