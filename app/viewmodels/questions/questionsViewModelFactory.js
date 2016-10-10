define(['constants', 'viewmodels/questions/multipleSelect/multipleSelect', 'viewmodels/questions/singleSelectText/singleSelectText', 'viewmodels/questions/fillInTheBlank/fillInTheBlank',
    'viewmodels/questions/dragAndDrop/dragAndDrop', 'viewmodels/questions/singleSelectImage/singleSelectImage', 'viewmodels/questions/textMatching/textMatching',
    'viewmodels/questions/statement/statement', 'viewmodels/questions/hotspot/hotspot', 'viewmodels/questions/openQuestion/openQuestion',
    'viewmodels/questions/scenarioQuestion/scenarioQuestion', 'viewmodels/questions/rankingText/rankingText'],
    function (constants, MultipleSelect, SingleSelectText, FillInTheBlank, DragAndDrop, SingleSelectImage,
        TextMatching, Statement, Hotspot, OpenQuestion, ScenarioQuestion, RankingText) {
        'use strict';

        return {
            getViewModel: getViewModel
        };

        function getViewModel(type) {
            switch (type) {
                case constants.questionTypes.multipleSelect:
                    return new MultipleSelect();
                case constants.questionTypes.dragAndDrop:
                    return new DragAndDrop();
                case constants.questionTypes.singleSelectText:
                    return new SingleSelectText();
                case constants.questionTypes.fillInTheBlank:
                    return new FillInTheBlank();
                case constants.questionTypes.singleSelectImage:
                    return new SingleSelectImage();
                case constants.questionTypes.textMatching:
                    return new TextMatching();
                case constants.questionTypes.statement:
                    return new Statement();
                case constants.questionTypes.hotspot:
                    return new Hotspot();
                case constants.questionTypes.openQuestion:
                    return new OpenQuestion();
                case constants.questionTypes.scenario:
                    return new ScenarioQuestion();
                case constants.questionTypes.rankingText:
                    return new RankingText();
                default:
                    return new MultipleSelect();
            }
        }

    });