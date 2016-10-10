define(function () {

    ko.bindingHandlers.fontScale = {
        init: function (element, valueAccessor) {
            var $element = $(element);
            var text = ko.unwrap(valueAccessor());

            $element.text(text);

            if(text.length > 100) {
                /*
                    Formula description:

                    Max text length = 255 symbols;
                    Min text length = 100 symbols;
                    maxLen - minLen = 155; 

                    coeficient = 1 - (length - minLen) / 155;

                    Max font size = 1.385;
                    Min font size = 0.65;
                    maxFont - minFont = 0.825;

                    Max line height = 38;
                    Min line height = 25;
                    maxLHeight - minLHeight = 13;

                    Result font size = coeficient * 0.825 + minFont;
                    Result line height = coeficient * 13 + minLHeight;
                */

                var coef = 1 - (text.length - 100) / 155;

                var fSize = coef * 0.825 + 0.8;
                var lHeight = coef * 13 + 25;

                $element.css('fontSize', fSize + 'em');
                $element.css('lineHeight', lHeight + 'px');
            } else {
                $element.css('fontSize', '1.385em');
                $element.css('lineHeight', '38px');
            }
        }
    };
});