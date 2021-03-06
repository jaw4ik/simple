define(['knockout', 'plugins/router', 'context', 'userContext', '../header/index', '../helpers/validatedValue', 'templateSettings',
        'modules/progress/progressStorage/auth', 'xApi/xApiInitializer', 'modules/progress/index', 'progressContext', 'eventManager'
    ],
    function (ko, router, context, userContext, Header, validatedValue, templateSettings, auth,
        xApiInitializer, progressProvider, progressContext, eventManager) {
        'use strict';

        var whitespaceRegex = /\s/;

        var viewmodel = {
            activate: activate,
            header: null,
            password: null,
            email: null,
            back: back,
            rememberMe: ko.observable(false),
            toggleRememberMe: toggleRememberMe,
            submit: submit,
            sendSecretLink: sendSecretLink,
            isSecretLinkSent: ko.observable(false),
            isPasswordVisible: ko.observable(false),
            togglePasswordVisibility: togglePasswordVisibility,
            emailPasswordCombination: ko.observable(false),
            requestProcessing: ko.observable(false),
            isRestorePasswordEmailSent: ko.observable(false),
            forgotPassword: forgotPassword
        };

        viewmodel.password = validatedValue(function (value) {
            return value().length >= 7 && !whitespaceRegex.test(value());
        });

        return viewmodel;

        function activate() {
            viewmodel.header = new Header(context.course.title);
            viewmodel.email = userContext.user.email;
        }

        function back() {
            router.navigate('login');
        }

        function toggleRememberMe() {
            if(viewmodel.requestProcessing()){
                return;
            }
            viewmodel.rememberMe(userContext.user.keepMeLoggedIn = !viewmodel.rememberMe());
        }

        function submit() {
            if(viewmodel.requestProcessing()){
                return;
            }
            if (!viewmodel.password.isValid()) {
                viewmodel.password.markAsModified();
                return;
            }
            userContext.user.password = viewmodel.password();
            viewmodel.requestProcessing(true);
            auth.signin(userContext.user.email,
                    userContext.user.password,
                    userContext.user.keepMeLoggedIn)
                .then(function (response) {
                    return progressProvider.initProgressStorage(function(provider){
                        progressProvider.clearLocalStorage();
                        progressContext.use(provider);
                        return xApiInit(function () {
                            viewmodel.requestProcessing(false);
                            eventManager.courseStarted();
                            progressContext.restoreProgress();
                        });
                    });
                }).fail(function (reason) {
                    viewmodel.requestProcessing(false);
                    if (reason.status == 403) {
                        viewmodel.emailPasswordCombination(true);
                    }
                })
        }

        function togglePasswordVisibility() {
            viewmodel.isPasswordVisible(!viewmodel.isPasswordVisible());
            viewmodel.password.hasFocus(true);
        }

        function xApiInit(callback) {
            if (templateSettings.xApi.enabled) {
                return xApiInitializer.activate(userContext.user.username, userContext.user.email).then(callback);
            }
            callback();
        }

        function sendSecretLink(){
            if(viewmodel.requestProcessing() || viewmodel.isSecretLinkSent()){
                return;
            }
            auth.sendSecreLink(userContext.user.email, context.course.title).then(function(){
                viewmodel.isRestorePasswordEmailSent(false);
                viewmodel.isSecretLinkSent(true);
                toggleValueAfterSomeTime(viewmodel.isSecretLinkSent, 5000);
            });
        }

        function forgotPassword(){
            if(viewmodel.requestProcessing() || viewmodel.isRestorePasswordEmailSent()){
                return;
            }
            auth.forgotpassword(userContext.user.email).then(function(){
                viewmodel.isSecretLinkSent(false);
                viewmodel.isRestorePasswordEmailSent(true);
                toggleValueAfterSomeTime(viewmodel.isRestorePasswordEmailSent, 5000);
            });
        }

        function toggleValueAfterSomeTime(value, time){
            _.delay(function(){
                value(!value());
            }, time);
        }
    });