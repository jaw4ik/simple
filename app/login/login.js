define(['knockout', 'underscore', 'plugins/router', 'eventManager', 'xApi/constants', 'xApi/xApiInitializer',
        'context', 'xApi/configuration/xApiSettings', 'userContext', 'modules/progress/index',
        'routing/guardRoute', 'templateSettings', './components/socialLogin/index', './components/checkPassword/index',
        './helpers/validatedValue', 'limitAccess/accessLimiter', './helpers/initProgress'
],
    function (ko, _, router, eventManager, constants, xApiInitializer, context, xApiSettings,
            userContext, progressProvider, guardRoute, templateSettings, SocialLoginViewModel, CheckPasswordViewModel,
            validatedValue, accessLimiter, initProgress) {

        "use strict";

        var viewmodel = {
            //properties
            loginEnabled: false,
            crossDeviceSavingEnabled: false,
            socialLoginEnabled: false,
            skipAllowed: false,
            courseTitle: '',
            useEmail: ko.observable(false),
            rememberMe: ko.observable(false),
            requestProcessing: ko.observable(false),
            userExists: ko.observable(false),
            username: null,
            usermail: null,

            //methods
            activate: activate,
            skip: skip,
            toggleRememberMe: toggleRememberMe,
            toggleUseEmail: toggleUseEmail,
            register: register,

            //viewmodels
            socialLoginViewModel: new SocialLoginViewModel(),
            checkPasswordViewModel: new CheckPasswordViewModel()
        };

        var xApiEnabled = xApiSettings.xApi.enabled,
            crossDeviceSavingEnabled = templateSettings.allowCrossDeviceSaving,
            accessLimitationEnabled = accessLimiter.accessLimitationEnabled();

        viewmodel.loginEnabled = xApiEnabled || crossDeviceSavingEnabled || accessLimitationEnabled;
        viewmodel.courseTitle = context.course.title;
        viewmodel.crossDeviceSavingEnabled = crossDeviceSavingEnabled && progressProvider.isInitialized;
        viewmodel.socialLoginEnabled = viewmodel.crossDeviceSavingEnabled && templateSettings.allowLoginViaSocialMedia;
        viewmodel.useEmail(!viewmodel.crossDeviceSavingEnabled || !viewmodel.socialLoginEnabled);
        viewmodel.skipAllowed = !xApiSettings.xApi.required;
        viewmodel.username = validatedValue(function (value) {
            return !!value();
        });
        viewmodel.usermail = validatedValue(function (value) {
            return !!value() && constants.patterns.email.test(value());
        });

        return viewmodel;

        //public methods
        function activate() {
            if (!viewmodel.loginEnabled) {
                viewmodel.skip(); return;
            }

            var user = userContext.getCurrentUser();

            if (user) {
                viewmodel.username(user.username);
                viewmodel.usermail(user.email);
                viewmodel.rememberMe(userContext.keepMeLoggedIn = true);
                register();
            }
        }

        function skip() {
            if (!viewmodel.skipAllowed && viewmodel.loginEnabled) {
                return;
            }
            guardRoute.skipLoginGuard();
            progressProvider.deactivateProgressStorage();
            xApiInitializer.deactivate();
            initProgress();
        }

        function toggleRememberMe() {
            viewmodel.rememberMe(userContext.keepMeLoggedIn = !viewmodel.rememberMe());
        }

        function toggleUseEmail() {
            viewmodel.useEmail(!viewmodel.useEmail());
            if (viewmodel.useEmail()) {
                viewmodel.username.hasFocus(true);
            }
        }

        function register() {
            if (isUserInputDataValid()) {
                viewmodel.requestProcessing(true);

                if (!accessLimiter.userHasAccess({ email: viewmodel.usermail(), username: viewmodel.username() })) {
                    startCourseAfterRegistration();
                    return;
                }

                if (templateSettings.xApi.enabled) {
                    return initXAPI(function () {
                        if (viewmodel.crossDeviceSavingEnabled) {
                            return registerUserInProgressStorage();
                        }

                        startCourseAfterRegistration();
                    });
                }
                if (viewmodel.crossDeviceSavingEnabled) {
                    return registerUserInProgressStorage();
                }

                startCourseAfterRegistration();
            }
        }

        //private methods
        function startCourseAfterRegistration() {
            initializeUserContext();
            viewmodel.requestProcessing(false);
            startCourse();
        }

        function startCourse() {
            if (accessLimiter.userHasAccess({ email: viewmodel.usermail(), username: viewmodel.username() })) {
                eventManager.courseStarted();
                router.navigate('');
                return;
            }

            router.navigate('noaccess');
        }

        function isUserInputDataValid() {
            if (viewmodel.usermail.isValid() && viewmodel.username.isValid()) {
                return true;
            }
            viewmodel.usermail.markAsModified();
            viewmodel.username.markAsModified();
            return false;
        }

        function registerUserInProgressStorage() {
            return progressProvider.register(viewmodel.usermail(), viewmodel.username(), context.course.title, viewmodel.rememberMe)
                .then(function (response) {
                    if (_.isString(response.password)) {
                        userContext.user.password = response.password;
                    }
                    startCourse();
                })
                .fail(function (reason) {
                    if (reason.status == 409) {
                        viewmodel.userExists(true);
                    }
                })
                .done(function () {
                    initializeUserContext();
                    viewmodel.requestProcessing(false);
                });
        }

        function initXAPI(callback) {
            !_.isFunction(callback) && function () { };
            return xApiInitializer.activate(viewmodel.username(), viewmodel.usermail()).then(callback);
        }

        function initializeUserContext() {
            userContext.user.email = viewmodel.usermail();
            userContext.user.username = viewmodel.username();
        }
    });