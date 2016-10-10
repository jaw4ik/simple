define(['viewmodels/questions/textMatching/textMatchingSource', 'viewmodels/questions/textMatching/textMatchingTarget'], function (Source, Target) {

    function TextMatching() {
        this.question = null;
        this.content = null;
        this.isAnswered = ko.observable(false);

        this.values = [];

        this.sources = ko.observableArray([]);
        this.targets = ko.observableArray([]);
    };

    TextMatching.prototype.acceptValue = function (value) {
        this.targets.push(value);
    };


    TextMatching.prototype.rejectValue = function (value) {
        this.targets.remove(value);
    };

    TextMatching.prototype.initialize = function(question, isPreview) {
        var self = this;

        return Q.fcall(function () {
            self.question = question;

            self.content = question.content;
            self.isAnswered(question.isAnswered);
            self.isPreview = ko.observable(_.isUndefined(isPreview) ? false : isPreview);

            self.values = _.chain(question.answers)
                .map(function (answer) {
                    return answer.value;
                })
                .shuffle()
                .value();

            var targets = [];

            _.each(self.values, function (value) {
                targets.push(new Target(value));
            });

            var sources = [];
            _.each(question.answers, function (pair) {
                var source = new Source(pair.id, pair.key);
                var target = _.find(targets, function (target) {
                    return target.value() == pair.attemptedValue;
                });

                if (target) {
                    source.acceptValue(target.value());
                    target.rejectValue();
                } else {
                    source.value(null);
                }

                sources.push(source);
            });

            self.targets(targets);
            self.sources(_.shuffle(sources));
        });
    };

    TextMatching.prototype.submit = function() {
        var self = this;

        return Q.fcall(function () {
            self.question.submitAnswer(_.map(self.sources(), function (source) {
                var value = source.value() ? source.value() : null;
                return { id: source.id, value: value };
            }));
            self.isAnswered(true);
        });
    };

    TextMatching.prototype.tryAnswerAgain = function() {
        var self = this;

        return Q.fcall(function () {
            _.each(self.sources(), function (pair, index) {
                pair.rejectValue();
                self.targets()[index].acceptValue(self.values[index]);
            });

            self.isAnswered(false);
        });
    };

    return TextMatching;
});