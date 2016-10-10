define([], function() {
    "use strict";

    function OpenQuestion(){
        this.question = null;
        this.content = null;
        this.answeredText = ko.observable('');
        this.isAnswered = ko.observable(false);
        
        this.feedbackView = 'questions/openQuestion/feedback.html';  
    };

    OpenQuestion.prototype.initialize = function(question, isPreview) {
        var self = this;

        return Q.fcall(function() {
            self.question = question;
            self.content = question.content;
            self.answeredText(question.answeredText);
            self.isAnswered(question.isAnswered);
            self.isPreview = ko.observable(_.isUndefined(isPreview) ? false : isPreview);
        });
    };

    OpenQuestion.prototype.submit = function() {
        var self = this;

        return Q.fcall(function () {
            self.question.submitAnswer(self.answeredText().trim());
            self.isAnswered(true);
        });
    };

    OpenQuestion.prototype.tryAnswerAgain = function() {
        var self = this;
        
        return Q.fcall(function () {
            self.answeredText('');
            self.isAnswered(false);
        });
    };

    return OpenQuestion;
});