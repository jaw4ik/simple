define(['knockout'], function (ko) {

    ko.bindingHandlers.draggable = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var allBindings = allBindingsAccessor();
			
			$(element).css('touch-action','none');
            $(element).draggable({
                appendTo: '.application-wrapper',
                containment: '.application-wrapper',
                helper: function () {
                    return $(element)
                        .clone()
                        .addClass('handle')
                        .css({
                            width: $(this).outerWidth(),
                            height: $(this).outerHeight()
                        });
                },
                scope: ko.utils.unwrapObservable(allBindings.scope) || 'default',
                tolerance: 'pointer',
                revert: true,
                revertDuration: 0,
                start: function () {
                    $(element).hide();
                },
                stop: function () {
                    $(element).show();
                }
            });
        }
    }

})