define(['knockout', 'viewmodels/questions/scenarioQuestion/components/branchtrackProvider'], function (ko, branchtrackProvider) {
    "use strict";

    function ScenarioQuestion(){
        this.question = null;
        this.content = null;
        this.embedCode = ko.observable(null);
        this.isAnswered = ko.observable(false);
        this.isCorrect = ko.observable(false);
        
        this.feedbackView = 'questions/scenarioQuestion/feedback.html';
        this.customSubmitViewModel = 'viewmodels/questions/scenarioQuestion/submitQuestion';
    };

    ScenarioQuestion.prototype.initialize = function(question, isPreview) {
        var self = this;

        return Q.fcall(function () {
            self.question = question;
            self.content = question.content;
            self.embedCode(question.embedCode);
            self.isAnswered(question.isAnswered);
            self.isCorrect(question.isCorrectAnswered);
            self.isPreview = ko.observable(_.isUndefined(isPreview) ? false : isPreview);
            branchtrackProvider.init(question.projectId, question.masteryScore);
        });
    }

    ScenarioQuestion.prototype.submit = function() {
        var self = this;

        return Q.fcall(function () {
            self.question.submitAnswer(branchtrackProvider.score());
            self.isAnswered(true);
        });
    }

    ScenarioQuestion.prototype.tryAnswerAgain = function() {
        var self = this;
        
        return Q.fcall(function () {
            self.isAnswered(false);
            self.embedCode.valueHasMutated();
            branchtrackProvider.reset();
        });
    }

    ScenarioQuestion.prototype.deactivate = function() {
        branchtrackProvider.destroy();
    }

    return ScenarioQuestion;
});