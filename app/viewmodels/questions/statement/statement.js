define(function() {
    "use strict";

    function Statement() {
        this.question = null;
        this.content = null;
        this.statements = null;
        this.isAnswered = ko.observable(false);
        this.isSurveyModeEnabled = false;
    };

    Statement.prototype.markStatementAsTrue = function(statement) {
        if (this.isAnswered()) {
            return;
        }

        statement.userAnswer(true);
    };

    Statement.prototype.markStatementAsFalse = function(statement) {
        if (this.isAnswered()) {
            return;
        }

        statement.userAnswer(false);
    };

    Statement.prototype.initialize = function(question, isPreview) {
        this.question = question;
        this.isSurveyModeEnabled = !!question.isSurvey;
        this.content = question.content;
        this.isAnswered(question.isAnswered);
        this.isPreview = ko.observable(_.isUndefined(isPreview) ? false : isPreview);
        this.statements = _.map(question.statements, function(statement) {
            var result = {
                id: statement.id,
                text: statement.text,
                userAnswer: ko.observable(statement.userAnswer)
            };

            result.isTrueChecked = ko.computed(function() {
                return result.userAnswer() == true;
            });

            result.isFalseChecked = ko.computed(function() {
                return result.userAnswer() == false;
            });

            return result;
        });
    };

    Statement.prototype.submit = function() {
        var self = this;

        return Q.fcall(function() {
            var userAnswers = _.chain(self.statements)
                .filter(function(statement) {
                    return !_.isNullOrUndefined(statement.userAnswer());
                })
                .map(function(statement) {
                    return { id: statement.id, answer: statement.userAnswer() };
                })
                .value();

            self.question.submitAnswer(userAnswers);
            self.isAnswered(true);
        });
    };

    Statement.prototype.tryAnswerAgain = function() {
        var self = this;
        
        return Q.fcall(function() {
            self.isAnswered(false);
            _.each(self.statements, function(statement) {
                statement.userAnswer(null);
            });
        });
    };

    return Statement;
});