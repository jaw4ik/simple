﻿define(['./models/actor', './models/statement', './models/activity', './models/activityDefinition', 'eventManager', './errorsHandler', './configuration/xApiSettings', './constants', './models/result', './models/score', './models/context', './models/contextActivities', './models/languageMap', './models/interactionDefinition', './utils/dateTimeConverter', './statementQueue', 'constants', 'guard', 'repositories/objectiveRepository'],
    function (actorModel, statementModel, activityModel, activityDefinitionModel, eventManager, errorsHandler, xApiSettings, constants, resultModel, scoreModel, contextModel, contextActivitiesModel, languageMapModel, interactionDefinitionModel, dateTimeConverter, statementQueue, globalConstants, guard, objectiveRepository) {

        "use strict";

        var subscriptions = [],
            activityProvider = {
                actor: null,
                activityName: null,
                activityUrl: null,

                init: init,
                createActor: createActor,
                rootCourseUrl: null,
                turnOffSubscriptions: turnOffSubscriptions,
                courseId: null
            };

        return activityProvider;

        function init(courseId, actorData, activityName, activityUrl) {
            return Q.fcall(function () {
                if (_.isUndefined(xApiSettings.scoresDistribution.positiveVerb)) {
                    throw errorsHandler.errors.notEnoughDataInSettings;
                }

                activityProvider.actor = actorData;
                activityProvider.activityName = activityName;
                activityProvider.activityUrl = activityUrl;
                activityProvider.rootCourseUrl = activityUrl !== undefined ? activityUrl.split("?")[0].split("#")[0] : '';
                activityProvider.courseId = courseId;

                subscriptions.push(eventManager.subscribeForEvent(eventManager.events.courseStarted).then(enqueueCourseStarted));
                subscriptions.push(eventManager.subscribeForEvent(eventManager.events.courseFinished).then(enqueueCourseFinished));
                subscriptions.push(eventManager.subscribeForEvent(eventManager.events.learningContentExperienced).then(enqueuenlearningContentExperienced));
                subscriptions.push(eventManager.subscribeForEvent(eventManager.events.answersSubmitted).then(enqueueAnsweredQuestionsStatements));
            });
        }

        function turnOffSubscriptions() {
            _.each(subscriptions, function (subscription) {
                if (!_.isNullOrUndefined(subscription && subscription.off)) {
                    subscription.off();
                }
            });
        }

        function pushStatementIfSupported(statement) {
            if (_.contains(xApiSettings.xApi.allowedVerbs, statement.verb.display[xApiSettings.defaultLanguage])) {
                statementQueue.enqueue(statement);
            }
        }

        function enqueueCourseStarted() {
            pushStatementIfSupported(createStatement(constants.verbs.started));
        }

        function enqueueCourseFinished(course) {
            guard.throwIfNotAnObject(course, 'Course is not an object');

            if (_.isArray(course.objectives)) {
                _.each(course.objectives, function (objective) {
                    var objectiveUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;
                    var statement = createStatement(constants.verbs.mastered, new resultModel({ score: new scoreModel(objective.score / 100) }), createActivity(objectiveUrl, objective.title));
                    pushStatementIfSupported(statement);
                });
            }

            var result = new resultModel({
                score: new scoreModel(course.score() / 100)
            });

            var resultVerb = course.isCompleted() ? xApiSettings.scoresDistribution.positiveVerb : constants.verbs.failed;
            pushStatementIfSupported(createStatement(resultVerb, result));
            pushStatementIfSupported(createStatement(constants.verbs.stopped));

            var dfd = Q.defer();

            statementQueue.statements.subscribe(function (newValue) {
                if (newValue.length === 0) {
                    dfd.resolve();
                }
            });

            // (^\ x_x /^)
            statementQueue.enqueue(undefined);

            return dfd.promise;
        }

        function enqueuenlearningContentExperienced(question, spentTime) {
            pushStatementIfSupported(getlearningContentExperiencedStatement(question, spentTime));
        }

        function enqueueAnsweredQuestionsStatements(question) {

            try {

                var statement = null;

                switch (question.type) {
                    case globalConstants.questionTypes.multipleSelect:
                    case globalConstants.questionTypes.singleSelectText:
                        statement = getSingleSelectTextQuestionAnsweredStatement(question);
                        break;
                    case globalConstants.questionTypes.fillInTheBlank:
                        statement = getFillInQuestionAnsweredStatement(question);
                        break;
                    case globalConstants.questionTypes.singleSelectImage:
                        statement = getSingleSelectImageQuestionAnsweredStatement(question);
                        break;
                    case globalConstants.questionTypes.statement:
                        statement = getStatementQuestionAnsweredStatement(question);
                        break;
                    case globalConstants.questionTypes.dragAndDrop:
                        statement = getDragAndDropTextQuestionAnsweredStatement(question);
                        break;
                    case globalConstants.questionTypes.textMatching:
                        statement = getMatchingQuestionAnsweredStatement(question);
                        break;
                    case globalConstants.questionTypes.hotspot:
                        statement = getHotSpotQuestionAnsweredStatement(question);
                        break;
                }

                if (statement) {
                    pushStatementIfSupported(statement);
                }



            } catch (e) {
                console.error(e);
            }
        }

        function getSingleSelectTextQuestionAnsweredStatement(question) {
            guard.throwIfNotAnObject(question, 'Question is not an object');

            var objective = objectiveRepository.get(question.objectiveId);
            guard.throwIfNotAnObject(objective, 'Objective is not found');

            var questionUrl = activityProvider.rootCourseUrl + '#objective/' + question.objectiveId + '/question/' + question.id;
            var result = new resultModel({
                score: new scoreModel(question.score() / 100),
                response: getItemsIds(question.answers, function (item) {
                    return item.isChecked;
                }).toString()
            });

            var object = new activityModel({
                id: questionUrl,
                definition: new interactionDefinitionModel({
                    name: new languageMapModel(question.title),
                    interactionType: constants.interactionTypes.choice,
                    correctResponsesPattern: [getItemsIds(question.answers, function (item) {
                        return item.isCorrect;
                    }).join("[,]")],
                    choices: _.map(question.answers, function (item) {
                        return {
                            id: item.id,
                            description: new languageMapModel(item.text)
                        };
                    })
                })
            });

            var parentUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, objective.title)]
                })
            });

            return createStatement(constants.verbs.answered, result, object, context);

            function getItemsIds(items, filter) {
                return _.chain(items)
                   .filter(function (item) {
                       return filter(item);
                   })
                   .map(function (item) {
                       return item.id;
                   }).value();
            }
        }

        function getStatementQuestionAnsweredStatement(question) {
            guard.throwIfNotAnObject(question, 'Question is not an object');

            var objective = objectiveRepository.get(question.objectiveId);
            guard.throwIfNotAnObject(objective, 'Objective is not found');

            var questionUrl = activityProvider.rootCourseUrl + '#objective/' + question.objectiveId + '/question/' + question.id;
            var result = new resultModel({
                score: new scoreModel(question.score / 100),
                response: _.chain(question.statements).filter(function (statement) {
                    return !_.isNullOrUndefined(statement.userAnswer);
                }).map(function (statement) {
                    return statement.id + '[.]' + statement.userAnswer;
                }).value().toString()
            });

            var object = new activityModel({
                id: questionUrl,
                definition: new interactionDefinitionModel({
                    name: new languageMapModel(question.title),
                    interactionType: constants.interactionTypes.choice,
                    correctResponsesPattern: [_.map(question.statements, function (item) {
                        return item.id + '[.]' + item.isCorrect;
                    }).join("[,]")],
                    choices: _.map(question.answers, function (item) {
                        return {
                            id: item.id,
                            description: new languageMapModel(item.text)
                        };
                    })
                })
            });

            var parentUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, objective.title)]
                })
            });

            return createStatement(constants.verbs.answered, result, object, context);
        }

        function getSingleSelectImageQuestionAnsweredStatement(question) {
            guard.throwIfNotAnObject(question, 'Question is not an object');

            var objective = objectiveRepository.get(question.objectiveId);
            guard.throwIfNotAnObject(objective, 'Objective is not found');

            var questionUrl = activityProvider.rootCourseUrl + '#objective/' + question.objectiveId + '/question/' + question.id;
            var result = new resultModel({
                score: new scoreModel(question.score / 100),
                response: getItemsIds(question.answers, function (item) {
                    return item.isChecked;
                }).toString()
            });

            var object = new activityModel({
                id: questionUrl,
                definition: new interactionDefinitionModel({
                    name: new languageMapModel(question.title),
                    interactionType: constants.interactionTypes.choice,
                    correctResponsesPattern: [[question.correctAnswerId].join("[,]")],
                    choices: _.map(question.answers, function (item) {
                        return {
                            id: item.id,
                            description: new languageMapModel(item.image)
                        };
                    })
                })
            });

            var parentUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, objective.title)]
                })
            });

            return createStatement(constants.verbs.answered, result, object, context);

            function getItemsIds(items, filter) {
                return _.chain(items)
                   .filter(function (item) {
                       return filter(item);
                   })
                   .map(function (item) {
                       return item.id;
                   }).value();
            }
        }

        function getFillInQuestionAnsweredStatement(question) {
            guard.throwIfNotAnObject(question, 'Question is not an object');

            var objective = objectiveRepository.get(question.objectiveId);
            guard.throwIfNotAnObject(objective, 'Objective is not found');

            var questionUrl = activityProvider.rootCourseUrl + '#objective/' + question.objectiveId + '/question/' + question.id;
            var result = new resultModel({
                score: new scoreModel(question.score / 100),
                response: _.map(question.answerGroups, function (item) {
                    return item.answeredText;
                }).toString()
            });

            var object = new activityModel({
                id: questionUrl,
                definition: new interactionDefinitionModel({
                    name: new languageMapModel(question.title),
                    interactionType: constants.interactionTypes.fillIn,
                    correctResponsesPattern: [_.flatten(_.map(question.answerGroups, function (item) {
                        return item.getCorrectText();
                    })).join("[,]")]
                })
            });

            var parentUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, objective.title)]
                })
            });

            return createStatement(constants.verbs.answered, result, object, context);
        }

        function getHotSpotQuestionAnsweredStatement(question) {
            guard.throwIfNotAnObject(question, 'Question is not an object');

            var objective = objectiveRepository.get(question.objectiveId);
            guard.throwIfNotAnObject(objective, 'Objective is not found');

            var questionUrl = activityProvider.rootCourseUrl + '#objective/' + question.objectiveId + '/question/' + question.id;
            var result = new resultModel({
                score: new scoreModel(question.score() / 100),
                response: _.map(question.placedMarks, function (mark) {
                    return '(' + mark.x + ',' + mark.y + ')';
                }).join("[,]")
            });

            var object = new activityModel({
                id: questionUrl,
                definition: new interactionDefinitionModel({
                    name: new languageMapModel(question.title),
                    interactionType: constants.interactionTypes.other,
                    correctResponsesPattern: [_.map(question.spots, function (spot) {
                        var polygonCoordinates = _.map(spot, function (spotCoordinates) {
                            return '(' + spotCoordinates.x + ',' + spotCoordinates.y + ')';
                        });
                        return polygonCoordinates.join("[.]");
                    }).join("[,]")]
                })
            });

            var parentUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, objective.title)]
                })
            });

            return createStatement(constants.verbs.answered, result, object, context);
        }

        function getDragAndDropTextQuestionAnsweredStatement(question) {
            guard.throwIfNotAnObject(question, 'Question is not an object');

            var objective = objectiveRepository.get(question.objectiveId);
            guard.throwIfNotAnObject(objective, 'Objective is not found');

            var questionUrl = activityProvider.rootCourseUrl + '#objective/' + question.objectiveId + '/question/' + question.id;
            var result = new resultModel({
                score: new scoreModel(question.score() / 100),
                response: _.map(question.answers, function (item) {
                    return '(' + item.currentPosition.x + ',' + item.currentPosition.y + ')';
                }).join("[,]")
            });

            var object = new activityModel({
                id: questionUrl,
                definition: new interactionDefinitionModel({
                    name: new languageMapModel(question.title),
                    interactionType: constants.interactionTypes.other,
                    correctResponsesPattern: [_.map(question.answers, function (item) {
                        return '(' + item.correctPosition.x + ',' + item.correctPosition.y + ')';
                    }).join("[,]")]
                })
            });

            var parentUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, objective.title)]
                })
            });

            return createStatement(constants.verbs.answered, result, object, context);
        }

        function getMatchingQuestionAnsweredStatement(question) {
            guard.throwIfNotAnObject(question, 'Question is not an object');

            var objective = objectiveRepository.get(question.objectiveId);
            guard.throwIfNotAnObject(objective, 'Objective is not found');

            var questionUrl = activityProvider.rootCourseUrl + '#objective/' + question.objectiveId + '/question/' + question.id;
            var result = new resultModel({
                score: new scoreModel(question.score() / 100),
                response: _.map(question.answers, function (answer) {
                    return answer.key.toLowerCase() + "[.]" + (answer.attemptedValue ? answer.attemptedValue.toLowerCase() : "");
                }).join("[,]")
            });

            var object = new activityModel({
                id: questionUrl,
                definition: new interactionDefinitionModel({
                    name: new languageMapModel(question.title),
                    interactionType: constants.interactionTypes.matching,
                    correctResponsesPattern: [_.map(question.answers, function (answer) {
                        return answer.key.toLowerCase() + "[.]" + answer.value.toLowerCase();
                    }).join("[,]")],
                    source: _.map(question.answers, function (answer) {
                        return { id: answer.key.toLowerCase(), description: new languageMapModel(answer.key) }
                    }),
                    target: _.map(question.answers, function (answer) {
                        return { id: answer.value.toLowerCase(), description: new languageMapModel(answer.value) }
                    })
                })
            });

            var parentUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, objective.title)]
                })
            });

            return createStatement(constants.verbs.answered, result, object, context);
        }

        function getlearningContentExperiencedStatement(question, spentTime) {
            guard.throwIfNotAnObject(question, 'Question is not an object');
            guard.throwIfNotNumber(spentTime, 'SpentTime is not a number');

            var objective = objectiveRepository.get(question.objectiveId);
            guard.throwIfNotAnObject(objective, 'Objective is not found');

            var result = new resultModel({
                duration: dateTimeConverter.timeToISODurationString(spentTime)
            });

            var learningContentUrl = activityProvider.rootCourseUrl + '#objective/' + objective.id + '/question/' + question.id + '?learningContents';
            var parentUrl = activityProvider.rootCourseUrl + '#objective/' + objective.id + '/question/' + question.id;
            var groupingUrl = activityProvider.rootCourseUrl + '#objectives?objective_id=' + objective.id;
            var object = createActivity(learningContentUrl, question.title);

            var context = createContextModel({
                contextActivities: new contextActivitiesModel({
                    parent: [createActivity(parentUrl, question.title)],
                    grouping: [createActivity(groupingUrl, objective.title)]
                })
            });

            return createStatement(constants.verbs.experienced, result, object, context);
        }


        function createActor(name, email) {
            var actor = {};

            try {
                actor = actorModel({
                    name: name,
                    mbox: 'mailto:' + email
                });
            } catch (e) {
                errorsHandler.handleError(errorsHandler.errors.actorDataIsIncorrect);
            }

            return actor;
        }

        function createActivity(id, name) {
            return activityModel({
                id: id || activityProvider.activityUrl,
                definition: new activityDefinitionModel({
                    name: new languageMapModel(name)
                })
            });
        }

        function createContextModel(contextSpec) {
            contextSpec = contextSpec || {};
            var contextExtensions = contextSpec.extensions || {};
            contextExtensions[constants.extenstionKeys.courseId] = activityProvider.courseId;
            contextSpec.extensions = contextExtensions;

            return new contextModel(contextSpec);
        }

        function createStatement(verb, result, activity, context) {
            var activityData = activity || createActivity(null, activityProvider.activityName);
            context = context || createContextModel();

            return statementModel({
                actor: activityProvider.actor,
                verb: verb,
                object: activityData,
                result: result,
                context: context
            });
        }
    }
);