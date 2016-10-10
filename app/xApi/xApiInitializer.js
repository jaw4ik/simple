define(['durandal/app', 'plugins/router', './routingManager', './requestManager', './activityProvider', './configuration/xApiSettings', './constants', './statementQueueHandler', './errorsHandler', 'context', 'progressContext', 'userContext', 'eventManager'],
    function (app, router, routingManager, requestManager, activityProvider, xApiSettings, constants, statementQueueHandler, errorsHandler, context, progressContext, userContext, eventManager) {
        "use strict";

        var
            isInitialized = false,
            moduleSettings = null,

            xApiInitializer = {
                isActivated: isActivated,
                activate: activate,
                deactivate: deactivate,

                initialize: initialize,
            };

        return xApiInitializer;

        function isActivated() {
            return isInitialized;
        }

        function deactivate() {
            activityProvider.turnOffSubscriptions();
            isInitialized = false;
            app.trigger('user:authentication-skipped');
        }

        //Initialization function for moduleManager
        function initialize(settings) {
            return Q.fcall(function () {
                moduleSettings = settings;

                return xApiSettings.init(moduleSettings).then(function () {
                    var user = userContext.getCurrentUser(),
                        progress = progressContext.get;

                    routingManager.mapRoutes();
                    
                    if (user && user.username && (constants.patterns.email.test(user.email) || user.account)) {
                        var isCourseStarted = _.isObject(progress()) && _.isObject(progress().user);
                        return activate(user.username, user.email, user.account).then(function () {
                            if (!isCourseStarted) {
                                return eventManager.courseStarted();
                            }
                        });
                    }

                    if (_.isObject(progress())) {
                        if (_.isObject(progress().user)) {
                            return activate(progress().user.username, progress().user.email, progress().user.account);
                        }
                        if (progress().user === 0) {
                            deactivate();
                            return;
                        }
                    }
                });
            });
        }

        function activate(username, email, account) {
            var actor = activityProvider.createActor(username, email, account);

            var id = context.course.id;
            var title = context.course.title;

            var url = "";
            if (window != window.top && ('referrer' in document)) {
                url = document.referrer;
            } else {
                url = window.location.toString();
            }

            url = url + '?course_id=' + context.course.id;

            return Q.all([
                  requestManager.init(moduleSettings),
                  activityProvider.init(id, actor, title, url)
            ]).spread(function () {
                isInitialized = true;
                statementQueueHandler.handle();
                var user = {
                    username: username,
                    email: email || account.name
                };
                if(account) {
                    user.account = account;
                }
                app.trigger('user:authenticated', user);
            }).fail(function (reason) {
                xApiInitializer.deactivate();
                errorsHandler.handleError(reason);
            });;
        }
    }
);