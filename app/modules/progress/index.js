define([
    'q', 'underscore', 'durandal/app', 'userContext', 'context', 'translation',
    './providers/progressProviders/localStorage', './providers/progressProviders/progressStorage',
    './providers/authProvider', './utils/urlProvider', './commands/sendSecretLink'
], function(Q, _, app, userContext, context, translation, LocalStorageProvider, ProgressStorageProvider,
    authProvider, urlProvider, sendSecretLinkCommand) {
    'use strict';

    var _private = {
        userEmail: '',
        progressProviders: {
            localStorage: null,
            progressStorage: null,
            create: function(crossDeviceSavingEnabled) {
                this.localStorage = new LocalStorageProvider(context.course.id, context.course.templateId);
                crossDeviceSavingEnabled && (this.progressStorage = new ProgressStorageProvider(context.course.id, context.course.templateId));
            }
        },
        executeFuncInProviders: executeFuncInProviders,
        progressProvider: {
            getProgress: getProgress,
            saveProgress: saveProgress,
            saveResults: saveResults,
            removeProgress: removeProgress
        }
    };

    function ProgressContext() {
        var that = this;
        this.isOnline = true;
        this.isInitialized = false;
        this.progressProvider = _private.progressProvider;
        this.crossDeviceEnabled = true;

        this.initialize = function(crossDeviceSavingEnabled) {
            var defer = Q.defer();

            this.isInitialized = true;
            this.crossDeviceEnabled = crossDeviceSavingEnabled;
            _private.progressProviders.create(this.crossDeviceEnabled);

            if (crossDeviceSavingEnabled) {
                var token = authProvider.getValueFromUrl('token');
                if (!_.isNull(token)) {
                    authProvider.setToken(token);
                    this.syncProviders().then(resolvePromise).fail(defer.reject);
                } else if (authProvider.authenticated) {
                    this.syncProviders().then(resolvePromise).fail(defer.reject);
                } else {
                    defer.resolve(null);
                }
            } else {
                defer.resolve(null);
            }

            return defer.promise;

            function resolvePromise(user) {
                defer.resolve(user);
            }
        };

        this.syncProviders = function() {
            var that = this;
            return _private.progressProviders.progressStorage.getProgress()
                .then(function (response) {
                    _private.progressProviders.localStorage.removeProgress();
                    if(_.isNull(response.progress) || _.isEmpty(response.progress)){
                        if (response.email){
                            authenticate(response.email, response.name, true);
                            _private.userEmail = response.email;
                            return {
                                name: response.name,
                                email: response.email
                            };
                        }
                        return null;
                    } else {
                        var progress = JSON.parse(response.progress);
                        progress.user = {
                            username: response.name,
                            email: response.email
                        };
                        authenticate(response.email, response.name);
                        _private.progressProviders.localStorage.saveProgress(progress);
                        _private.userEmail = response.email;
                        return {
                            name: response.name,
                            email: response.email
                        };
                    }
                })
                .fail(function(reason) {
                    that.isOnline = false;
                    that.logOut();
                    delete _private.progressProviders.progressStorage;
                    if (reason.status == 401) {
                        return null;
                    }
                });

                function setSecretLink(email, title, sendMail){
                    sendMail = sendMail || false;
                    var shortLink = authProvider.getValueFromUrl('shortLink');
                    if(shortLink){
                        authProvider.setLink(shortLink);
                    } else {
                        sendSecretLinkCommand.execute(email, title, sendMail, true).then(function(response){
                            authProvider.setLink(response.shortLink);
                        });
                    }
                }

                function authenticate(email, name, sendMail) {
                    app.trigger('user:authenticated', {
                        username: name,
                        email: email
                    });
                    var password = authProvider.getValueFromUrl('password');
                    userContext.user.password = password;
                    userContext.user.email = email;
                    userContext.user.username = name;
                    setSecretLink(email, _private.courseTitle, sendMail);
                }
        };

        this.deactivateProgressStorage = function(){
            this.isInitialized = false;
            delete _private.progressProviders.progressStorage;
        };

        this.isUserAuthenticated = function() {
            if(that.crossDeviceEnabled){
                return authProvider.authenticated;
            }
            var progress = _private.progressProvider.getProgress();
            return !_.isNull(progress) && !_.isNull(progress.user);
        };

        this.sendSecretLink = function(email, title, sendMail, returnLink) {
            return sendSecretLinkCommand.execute(email, title, sendMail, returnLink);
        };

        this.register = function(email, username, courseTitle, shortTermAccess) {
            return authProvider.register(email, username, courseTitle, shortTermAccess);
        };

        this.login = function(email, password, shortTermAccess) {
            return authProvider.login(email, password, shortTermAccess);
        };

        this.logOut = function() {
            if (_private.progressProviders.localStorage) {
                _private.progressProviders.localStorage.removeProgress();
            }
            authProvider.logOut();
        };

        this.progressStorageUrl = urlProvider.progressStorageUrl;
        this.authLink = function() {
            return authProvider.authLink()
        };
    }

    return new ProgressContext();

    function executeFuncInProviders(name) {
        var args = Array.prototype.slice.call(arguments, 1),
            promises = [];
        _.each(_private.progressProviders, function(provider) {
            !_.isNull(provider) && _.isFunction(provider[name]) && promises.push(provider[name].apply(provider, args));
        });
        return Q.all(promises);
    }

    function getProgress() {
        return _private.progressProviders.localStorage ? _private.progressProviders.localStorage.getProgress() : {};
    }

    function saveProgress(progress) {
        return _private.executeFuncInProviders('saveProgress', progress, _private.userEmail);
    }

    function saveResults() {
        return _private.executeFuncInProviders('saveResults', context.course.score, context.course.getStatus, translation.getTextByKey('[not enough memory to save progress]'));
    }

    function removeProgress() {
        return _private.executeFuncInProviders('removeProgress', _private.userEmail);
    }
});