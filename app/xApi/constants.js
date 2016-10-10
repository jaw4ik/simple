define([],
    function () {

        var verbs = {
            started: {
                id: "http://adlnet.gov/expapi/verbs/launched",
                display: {
                    "en-US": "started"
                }
            },
            stopped: {
                id: "http://adlnet.gov/expapi/verbs/exited",
                display: {
                    "en-US": "stopped"
                }
            },
            passed: {
                id: "http://adlnet.gov/expapi/verbs/passed",
                display: {
                    "en-US": "passed"
                }
            },
            failed: {
                id: "http://adlnet.gov/expapi/verbs/failed",
                display: {
                    "en-US": "failed"
                }
            },
            experienced: {
                id: "http://adlnet.gov/expapi/verbs/experienced",
                display: {
                    "en-US": "experienced"
                }
            },
            answered: {
                id: "http://adlnet.gov/expapi/verbs/answered",
                display: {
                    "en-US": "answered"
                }
            },
            mastered: {
                id: "http://adlnet.gov/expapi/verbs/mastered",
                display: {
                    "en-US": "mastered"
                }
            },
            progressed: {
                id: "http://adlnet.gov/expapi/verbs/progressed",
                display: {
                    "en-US": "progressed"
                }
            }
        };

        var interactionTypes = {
            choice: "choice",
            fillIn: "fill-in",
            matching: "matching",
            dragAndDrop: "dragAndDrop",
            hotspot: "hotspot",
            sequencing: 'sequencing',
            other: "other"
        };

        var activityTypes = {
            course: "http://adlnet.gov/expapi/activities/course",
            objective: "http://adlnet.gov/expapi/activities/objective"
        }

        var extenstionKeys = {
            courseId: "http://easygenerator/expapi/course/id",
            surveyMode: "http://easygenerator/expapi/question/survey",
            questionType: "http://easygenerator/expapi/question/type"
        };

        var patterns = {
            email: /^[^@\s]+@[^@\s]+$/,
            isoDuration: /^PT[0-9]{1,2}H[0-9]{1,2}M[0-9]{1,2}S$/
        };

        return {
            verbs: verbs,
            interactionTypes: interactionTypes,
            activityTypes: activityTypes,
            extenstionKeys: extenstionKeys,
            patterns: patterns
        };
    }
);