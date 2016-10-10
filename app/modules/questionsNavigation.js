define(['repositories/sectionRepository'], function (sectionRepository) {
    function getNavigationContext(sectionId, questionId) {
        var section = sectionRepository.get(sectionId);

        if (section && section.questions) {
            var currentItemIndex = _getItemIndexById(section.questions, questionId);
            if (currentItemIndex > -1) {
                return {
                    previousQuestionUrl: _getQuestionUrl(section, section.questions[currentItemIndex - 1]),
                    currentQuestionUrl: _getQuestionUrl(section, section.questions[currentItemIndex]),
                    nextQuestionUrl: _getQuestionUrl(section, section.questions[currentItemIndex + 1]),
                    questionsCount : section.questions.length,
                    currentQuestionIndex : currentItemIndex + 1
                };
            }
        }
    }

    function _getItemIndexById(collection, itemId) {
        for (var i = 0, count = collection.length; i < count; i++) {
            if (collection[i].id === itemId) {
                return i;
            }
        }
        return -1;
    }

    function _getQuestionUrl(section, question) {
        if (section && question) {
            return '#/section/' + section.id + '/question/' + question.id;
        }
        return undefined;
    }

    return {
        getNavigationContext: getNavigationContext
    };
});