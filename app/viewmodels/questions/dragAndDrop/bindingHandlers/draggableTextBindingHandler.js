define(['knockout'], function (ko) {
    'use strict';

    ko.bindingHandlers.draggableText = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var allBindings = allBindingsAccessor();
            var scope = ko.utils.unwrapObservable(allBindings.scope) || 'question';
            var $element = $(element);
			
			$element.css('touch-action','none');
            $element.draggable({
                appendTo: '.application-wrapper',
                containment: '.application-wrapper',
                scope: scope,
                revert: 'invalid',
                helper: 'clone',
                start: function () {
                    $element.css({ visibility: 'hidden' });
                },
                stop: function () {
                    $element.css({ visibility: 'visible' });
                }
            });
        }
    };
});