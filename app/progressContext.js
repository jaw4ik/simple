define(['durandal/system', 'durandal/app', 'plugins/router', 'translation', 'eventManager', 'context', 'userContext', 'constants'],
    function (system, app, router, translation, eventManager, dataContext, userContext, constants) {

        var
            statuses = constants.progressContext.statuses,
            self = {
                storage: null,
                progress: {
                    _v: 1,
                    url: null,
                    answers: {},
                    user: null,
                    attemptId: system.guid()
                }
            },
            context = {
                get: get,
                remove: remove,

                use: use,
                ready: ready,

                status: ko.observable(statuses.undefined)
            }
        ;

        return context;

        function save() {
            if (!self.storage) {
                return;
            }

            context.status(self.storage.saveProgress(self.progress) ? statuses.saved : statuses.error);
            
            if (_.isFunction(self.storage.saveResults)) {
                self.storage.saveResults();
            }
        }

        function navigated(obj, instruction) {
            if (instruction.config.moduleId === 'xApi/viewmodels/xAPIError'
                || instruction.config.moduleId === 'viewmodels/404'
                || instruction.config.moduleId === 'login/login') {
                return;
            }
            if (_.isNull(self.progress.url)) {
                self.progress.url = instruction.fragment;
                save();
            }
            else if (self.progress.url != instruction.fragment) {
                self.progress.url = instruction.fragment;
                save();
            }
        }

        function authenticated(user) {
            self.progress.user = user;
        }

        function authenticationSkipped() {
            self.progress.user = 0;
        }

        function questionAnswered(question) {
            try {
                self.progress.answers[question.shortId] = question.progress();
                save();
            } catch (e) {
                console.error(e);
            }
        }

        function finish() {
            if (!self.storage) {
                return;
            }

            if (_.isFunction(self.storage.saveResults)) {
                self.storage.saveResults();
            }
        }

        function get() {
            return self.progress;
        }

        function remove() {
            if (!self.storage) {
                return;
            }

            if (_.isFunction(self.storage.removeProgress)) {
                self.storage.removeProgress();
            }
        }

        function use(storage) {
            if (_.isFunction(storage.getProgress) && _.isFunction(storage.saveProgress)) {

                self.storage = storage;
                self.progress._v = dataContext.course.createdOn.getTime();

                restore(userContext.getCurrentUser());

                eventManager.subscribeForEvent(eventManager.events.answersSubmitted).then(questionAnswered);
                eventManager.subscribeForEvent(eventManager.events.courseFinished).then(finish);

                app.on('user:authenticated').then(authenticated);
                app.on('user:authentication-skipped').then(authenticationSkipped);

                router.on('router:navigation:composition-complete', navigated);

                window.onbeforeunload = function () {
                    if (context.status() === statuses.error) {
                        return translation.getTextByKey('[progress cannot be saved]');
                    }
                }
            } else {
                throw 'Cannot use this storage';
            }
        }

        function ready() {
            return !!self.storage;
        }

        function restore(user) {
            var progress = self.storage.getProgress();
            if (!_.isEmpty(progress) &&
                _.isString(progress.attemptId) &&
                ((!user) || (!progress.user) || (user.username == progress.user.username && user.email == progress.user.email))) {
                self.progress = progress;
            }
        }
    });
