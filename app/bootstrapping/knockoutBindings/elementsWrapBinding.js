define(['knockout', 'jquery', 'durandal/composition'], function (ko, $, composition) {

    ko.bindingHandlers.elementsWrap = {
        init: function (element) {
            wrapElement(element);
        },

        update: function (element) {
            wrapElement(element);
        }
    };

    function wrapElement(element) {
        var $element = $(element),
                imageWrapper = '<figure class="image-wrapper"></figure>',
                tableWrapper = '<figure class="table-wrapper"></figure>';

        $('img', $element).each(function (index, image) {
            var $image = $(image),
                $wrapper = $(imageWrapper).css('float', $image[0].style.cssFloat);

            if ($image.closest('.cropped-image').length > 0) {
                return;
            }

            // moved to css, because of IE11 crash on Windows 10 => .image-wrapper img {height:auto!important;float:none!important;}
            //$image.height('auto');
            //$image.css('float', 'none');
            //
            $image.wrap($wrapper);
        });

        $('table', $element).each(function (index, table) {
            var $table = $(table),
                $wrapper = $(tableWrapper).css('text-align', $table.attr('align'));
            $table.attr('align', 'center');
            $table.wrap($wrapper);
        });
    }

    composition.addBindingHandler('elementsWrap');

});