define(function () {
    "use strict";

    function DragAndDrop() {
        this.question = null;
	    this.content = null;

        this.dropspots = [];
        this.texts = [];

        this.isPreview = ko.observable(true);

        this.isAnswered = ko.observable(false);
    };

    DragAndDrop.prototype.submit = function() {
        var self = this;

        return Q.fcall(function () {
            var answer = [];

            _.each(self.dropspots, function (dropspot) {
                var text = dropspot.text();
                if (text) {
                    answer.push({
                        text: text.text,
                        x: dropspot.x,
                        y: dropspot.y
                    });
                }
            });

            self.question.submitAnswer(answer);
            self.isAnswered(true);
        });
    };

    DragAndDrop.prototype.tryAnswerAgain = function() {
        var self = this;
        
        return Q.fcall(function () {
            self.isAnswered(false);
            _.each(self.dropspots, function (dropspot) {
                dropspot.text(undefined);
            });
            _.each(self.texts, function (answer) {
                answer.dropSpot = {};
                answer.placed(false);
            });
        });
    };

    DragAndDrop.prototype.initialize = function(question, isPreview) {
        var self = this;
        
        return Q.fcall(function () {
            self.question = question;
            self.content = question.content;
            self.isPreview(_.isUndefined(isPreview) ? false : isPreview);

            self.isAnswered(question.isAnswered);
            self.dropspots = _.map(question.answers, function (answer) {
                return {
                    x: answer.correctPosition.x,
                    y: answer.correctPosition.y,
                    text: ko.observable(''),
                    
                };
            });

            self.texts = _.map(_.shuffle(question.answers), function (answer) {
                return {
                    id: answer.id,
                    text: answer.text,
                    placed: ko.observable(false)
                };
            });

            _.each(question.answers, function (answer) {
                var selectedDropspot = _.find(self.dropspots, function (dropspot) {
                    return dropspot.x === answer.currentPosition.x
                        && dropspot.y === answer.currentPosition.y;
                });

                if (selectedDropspot) {
                    var selectedText = _.find(self.texts, function (item) {
                        return item.id === answer.id;
                    });
                    selectedText.placed(true);
                    selectedDropspot.text(selectedText);
                }
            });
        });
    };

    return DragAndDrop;
});