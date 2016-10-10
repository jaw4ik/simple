define(['browserSupport'], function (browserSupport) {
    "use strict";

    function SingleSelectImage() {
        var self = this;

        this.canHover = !browserSupport.isMobileDevice;
        this.question = null;

        this.content = null;
        this.isAnswered = ko.observable(false);
        this.answers = null;
        this.checkedAnswerId = ko.observable(null);
    };

    SingleSelectImage.prototype.checkItem = function(item) {
            if (this.isAnswered()) {
                return;
            }
            
            this.checkedAnswerId(item.id);
        };

    SingleSelectImage.prototype.initialize = function(question, isPreview) {
        var self = this;

        return Q.fcall(function () {
            self.question = question;
            self.checkedAnswerId(question.checkedAnswerId);

            self.content = question.content;
            self.isAnswered(question.isAnswered);
            self.isPreview = ko.observable(_.isUndefined(isPreview) ? false : isPreview);
            self.answers = _.map(question.answers, function (answer) {
                return {
                    id: answer.id,
                    image: answer.image,
                    isChecked: ko.observable(answer.isChecked)
                };
            });
        });
    };

    SingleSelectImage.prototype.submit = function() {
        var self = this;

        return Q.fcall(function () {
            self.question.submitAnswer(self.checkedAnswerId());

            self.isAnswered(true);
        });
    };

    SingleSelectImage.prototype.tryAnswerAgain = function() {
        var self = this;
        
        return Q.fcall(function () {
            self.checkedAnswerId(null);

            self.isAnswered(false);
        });
    };

    return SingleSelectImage;
});