define(['knockout','underscore', 'plugins/router', 'eventManager', 'xApi/constants', 'xApi/xApiInitializer',
        'context', 'xApi/configuration/xApiSettings', 'userContext', 'modules/progress/index',
        'routing/guardLogin', 'templateSettings', './components/socialLogin/index', './components/checkPassword/index', 
        './helpers/validatedValue'
    ],
    function(ko, _, router, eventManager, constants, xApiInitializer, context, xApiSettings,
            userContext, progressProvider, guardLogin, templateSettings, SocialLoginViewModel, CheckPasswordViewModel,
            validatedValue) {

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
            crossDeviceSavingEnabled = templateSettings.allowCrossDeviceSaving;
            
        viewmodel.loginEnabled = xApiEnabled || crossDeviceSavingEnabled;
        viewmodel.courseTitle =  context.course.title;
        viewmodel.crossDeviceSavingEnabled = crossDeviceSavingEnabled && progressProvider.isInitialized;
        viewmodel.socialLoginEnabled = viewmodel.crossDeviceSavingEnabled && templateSettings.allowLoginViaSocialMedia;
        viewmodel.useEmail(!viewmodel.crossDeviceSavingEnabled || !viewmodel.socialLoginEnabled);
        viewmodel.skipAllowed = !xApiSettings.xApi.required;
        viewmodel.username = validatedValue(function(value){
            return !!value();
        });
        viewmodel.usermail = validatedValue(function(value){
            return !!value() && constants.patterns.email.test(value());
        });

        return viewmodel;

        //public methods
        function activate() {
            if(!viewmodel.loginEnabled){
                viewmodel.skip(); return;
            }

            var user = userContext.getCurrentUser();

            if(user){
                viewmodel.username(user.username);
                viewmodel.usermail(user.email);
                viewmodel.rememberMe(userContext.keepMeLoggedIn = true);
                register();
            }
        }

        function skip(){
            if (!viewmodel.skipAllowed && viewmodel.loginEnabled) {
                return;
            }
            guardLogin.removeGuard();
            progressProvider.deactivateProgressStorage();
            xApiInitializer.deactivate();
            startCourse();
        }

        function toggleRememberMe(){
            viewmodel.rememberMe(userContext.keepMeLoggedIn = !viewmodel.rememberMe());
        }

        function toggleUseEmail(){
            viewmodel.useEmail(!viewmodel.useEmail());
            if (viewmodel.useEmail()) {
                viewmodel.username.hasFocus(true);
            }
        }

        function register() {
            if(isUserInputDataValid()){
                viewmodel.requestProcessing(true);
                if(templateSettings.xApi.enabled){
                    return initXAPI(function(){
                        if(viewmodel.crossDeviceSavingEnabled){
                            return registerUserInProgressStorage();
                        }
                        viewmodel.requestProcessing(false);
                        guardLogin.removeGuard();
                        startCourse();
                    });
                }
                return registerUserInProgressStorage();
            }
        }

        //private methods
        function startCourse() {
            eventManager.courseStarted();
            router.navigate('');
        }

        function isUserInputDataValid() {
            if (viewmodel.usermail.isValid() && viewmodel.username.isValid()) {
                return true;
            }
            viewmodel.usermail.markAsModified();
            viewmodel.username.markAsModified();
            return false;
        }

        function registerUserInProgressStorage(){
            return progressProvider.register(viewmodel.usermail(), viewmodel.username(), context.course.title, viewmodel.rememberMe)
                .then(function(response){
                    if (_.isString(response.password)) {
                        userContext.user.password = response.password;
                    }
                    startCourse();
                })
                .fail(function(reason){
                    if (reason.status == 409) {
                        viewmodel.userExists(true);
                    }
                })
                .done(function(){
                    userContext.user.email = viewmodel.usermail();
                    userContext.user.username = viewmodel.username();
                    viewmodel.requestProcessing(false);
                });
        }

        function initXAPI(callback){
            !_.isFunction(callback) && function(){};
            return xApiInitializer.activate(viewmodel.username(), viewmodel.usermail()).then(callback);
        }
    });