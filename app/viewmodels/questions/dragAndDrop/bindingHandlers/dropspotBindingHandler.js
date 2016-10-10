define(['knockout', 'durandal/composition'], function (ko, composition) {
    'use strict';

    ko.bindingHandlers.dropspot = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var value = valueAccessor();
            var allBindings = allBindingsAccessor();

            var left = ko.utils.unwrapObservable(value.x);
            var top = ko.utils.unwrapObservable(value.y);
            var scope = ko.utils.unwrapObservable(allBindings.scope) || 'question';

            $('.ui-draggable')
                .on('dragstart', function (event, ui) {
                    $(element).addClass('active');
                    $(this).closest('.drag-and-drop-text-dropspot').removeClass('dropped');

                    if ($(element).children('.drag-and-drop-text-draggable').length) {
                        return;
                    }

                    $(element).css('min-width', ui.helper.outerWidth());
                    $(element).height(ui.helper.outerHeight());

                });
                $('html').on('mouseup', function (event, ui) {
                    $(element).removeClass('active');
                    $(element).css('min-width', '');
                    $(element).css('height', '');
                    $(this).closest('.drag-and-drop-text-dropspot').addClass('dropped');
                });

            $(element).droppable({
                accept: function (arg) {
                    if ($(element).find(arg).length) {
                        return true;
                    }

                    return $(element).find('.drag-and-drop-text-draggable').length == 0;
                },
                tolerance: 'intersect',
                scope: scope,
                drop: function (e, ui) {
                    var text = ko.dataFor(ui.draggable.get(0));

                    ui.draggable.css('left', '').css('top', '').appendTo(this);

                    if (ko.isWriteableObservable(value.text)) {
                        text.placed(true);
                        value.text(text);
                        text.dropSpot = value;
                        $(element).addClass('dropped');
                    }
                }
            });

            $(element).css('left', left + 'px').css('top', top + 'px');
        },
        update: function (element, valueAccessor) {
            var value = valueAccessor(),
                text = ko.utils.unwrapObservable(value.text),
                $draggableTextContainer = $('.drag-and-drop-text-draggable-container'),
                draggableTextClass = '.drag-and-drop-text-draggable',
                draggableContainerMessageClass = '.drag-and-drop-text-draggable-container-message';

            if (text) {
                
                var $textChildren = $draggableTextContainer.children(draggableTextClass);
                $.each($textChildren, function (index, item) {
                    var data = ko.dataFor(item);
                    if (data.text === text.text && data.placed() && $(element).children('.drag-and-drop-text-draggable').length ==0) {
                        data.dropSpot = value;
                        $(item).css('left', '').css('top', '').appendTo($(element));
                    }
                });
                if ($draggableTextContainer.children(draggableTextClass).length) {
                    $draggableTextContainer.children(draggableContainerMessageClass).hide();
                } else {
                    $draggableTextContainer.addClass('empty');
                    $draggableTextContainer.children(draggableContainerMessageClass).show();
                }
            } else {
                $(element).closest('.drag-and-drop-text-dropspot').removeClass('dropped');
                $(element).children(draggableTextClass).css('left', '').css('top', '').appendTo($draggableTextContainer);
                $draggableTextContainer.removeClass('empty');
                $draggableTextContainer.children(draggableContainerMessageClass).hide();
            }
        }
    };
    composition.addBindingHandler('dropspot');
});