define(['knockout'], function (ko) {
    'use strict';

    ko.bindingHandlers.scrollTop = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var time = ko.unwrap(valueAccessor());
            var $element = $(element);
            var $document = $(document);
            var isScrolling = false;
            var isEnabled = false;

            $element.hide().css('opacity', '0');
            
            $document.scroll(function() {
                var y = $(this).scrollTop();

                if (y > 0) {
                    if(!isEnabled) {
                        $element
                            .show()       
                            .animate({bottom: "+=10", opacity: '1'}, 300);

                        isEnabled = true;
                    }
                } else {
                    $element                   
                        .animate({bottom: "-=10", opacity: '0'}, 300, function(){
                                if(!isEnabled)
                                    $element.hide();
                            });

                    isEnabled = false;
                }
            }); 

            $element.bind('click', function(){
                if(!isScrolling && isEnabled){
                    isScrolling = true;

                    $('html, body').animate({scrollTop: 0}, time, function(){
                        isScrolling = false;
                    });
                }
            });
        }
    };
});