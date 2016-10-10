define(function () {
    "use strict";

    function HotSpot (){ }

    HotSpot.prototype.initialize = function(question, isPreview) {
        var self = this;

        return Q.fcall(function (){
            self.content = question.content;
            self.background = question.background;
            self.isAnswered = ko.observable(question.isAnswered);
            self.isMultiple = question.isMultiple;
            self.isPreview = ko.observable(_.isUndefined(isPreview) ? false : isPreview);
            self.question = question;

                self.submit = function () {         
                return Q.fcall(function () {
                        question.submitAnswer(self.marks());             
                        self.isAnswered(true);
                });
                };
        
                self.marks = ko.observableArray(question.placedMarks ? _.map(question.placedMarks, function (mark) { return { x: mark.x, y: mark.y }; }) : []);

            self.addMark = function (mark) {
                if (!self.isMultiple) {
                    self.marks.removeAll();
                }
                self.marks.push(mark);
            };

            self.removeMark = function (mark) {
                self.marks.remove(mark);
            };

            self.tryAnswerAgain = function () {
                return Q.fcall(function () {
                    self.isAnswered(false);
                    self.marks.removeAll();
                });
            };
        });
    };
    
    return HotSpot;
});