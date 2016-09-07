define(['knockout'], function(ko) {
    'use strict';

    return function (validateCallback){
        var value = ko.observable('');
        value.trim = function() {
            value(ko.utils.unwrapObservable(value).trim());
        };
        value.isValid = ko.computed(validateCallback.bind(null, value));
        value.isModified = ko.observable(false);
        value.hasFocus = ko.observable(false);
        value.markAsModified = function() {
            value.isModified(true);
            return value;
        };
        return value; 
    }
});