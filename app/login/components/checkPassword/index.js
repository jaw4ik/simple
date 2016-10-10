define([
    'knockout',
    'underscore',
    'templateSettings',
    'modules/progress/index',
    'xApi/xApiInitializer',
    '../secretLink/index',
    '../../helpers/validatedValue',
    '../../helpers/initProgress'
], function(ko, _, templateSettings, progressProvider, xApiInitializer, SecretLinkViewModel, validatedValue, initProgress) {
    'use strict';
    
    return function() {
        var rememberMe = null,
            syncProviders = function() {
                var that = this;
                return progressProvider.syncProviders().then(function(){
                    if (templateSettings.xApi.enabled) {
                        return xApiInitializer.activate(that.username(), that.usermail()).then(function() {
                            return initProgress();
                        });
                    } else {
                        return initProgress();
                    }
                });
            };

        this.username = null;
        this.usermail = null;
        this.password = validatedValue(function(value){
            return !!value();
        });
        this.passwordHidden = ko.observable(true);
        this.passwordIsNotCorrect = ko.observable(false);
        this.secretLinkViewModel = new SecretLinkViewModel();
        this.requestProcessing = ko.observable(false);

        this.activate = function(userName, userEmail, keepMeLoggedIn){
            if(!_.isFunction(userName)){
                throw 'userName must be observable value';
            }
            if(!_.isFunction(userEmail)){
                throw 'userEmail must be observable value';
            }
            if(!_.isFunction(keepMeLoggedIn)){
                throw 'keepMeLoggedIn must be observable value';
            }
            rememberMe = keepMeLoggedIn;
            this.username = userName;
            this.usermail = userEmail;
        };
        this.toglePasswordVisibility = function (){
            this.passwordHidden(!this.passwordHidden());
        };
        this.login = function(){
            var that = this;
            this.passwordIsNotCorrect(false);
            if(this.password.isValid()){
                progressProvider.login(this.usermail(), this.password(), rememberMe())
                    .then(function(username){
                        if (username) { that.username(username); }
                        return syncProviders.call(that);
                    })
                    .fail(function(reason){
                        if (reason.status == 403) {
                            that.passwordIsNotCorrect(true);
                        }
                    })
                    .done(function(){
                        that.requestProcessing(false);
                    })
            } else {
                this.password.markAsModified();
            }
        };
    };
});