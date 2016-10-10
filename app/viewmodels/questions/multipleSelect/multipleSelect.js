define(function () {
	"use strict";

	function MultipleSelect() {
		var self = this;

		this.question = null;

	    this.content = null;
	    this.isAnswered = ko.observable(false);
	    this.answers = null;
		this.isSurveyModeEnabled = false;
	};

	MultipleSelect.prototype.checkItem = function(item) {
		if (this.isAnswered()) {
			return;
		}

		item.isChecked(!item.isChecked());
	};

	MultipleSelect.prototype.initialize = function(question, isPreview) {
		var self = this;

		return Q.fcall(function () {
			self.question = question;

			self.isSurveyModeEnabled = !!question.isSurvey;
			self.content = question.content;
			self.isAnswered(question.isAnswered);
			self.isPreview = ko.observable(_.isUndefined(isPreview) ? false : isPreview);

			self.answers = _.map(question.answers, function (answer) {
				return {
					id: answer.id,
					text: answer.text,
					isChecked: ko.observable(answer.isChecked)
				};
			});
		});
	};
	
	MultipleSelect.prototype.submit = function() {
		var self = this;

		return Q.fcall(function () {
			self.question.submitAnswer(
				_.chain(self.answers)
				.filter(function (item) {
					return item.isChecked();
				})
				.map(function (item) {
					return item.id;
				}).value());

			self.isAnswered(true);
		});
	};

	MultipleSelect.prototype.tryAnswerAgain = function() {
		var self = this;

		return Q.fcall(function() {
			_.each(self.answers, function (answer) {
				answer.isChecked(false);
			});

			self.isAnswered(false);
		});
	};

	return MultipleSelect;
});