define([
    'knockout', 'underscore', 'durandal/app', 'durandal/composition', 'plugins/router',
    'routing/routes', 'context', 'modulesInitializer', 'templateSettings',
    'background', 'progressContext', 'constants', 'userContext', 'errorsHandler',
    'lessProcessor', 'modules/progress/index', 'routing/guardRoute', 'xApi/xApiInitializer'
], function(ko, _, app, composition, router, routes, context, modulesInitializer, templateSettings, background,
    progressContext, constants, userContext, errorsHandler, lessProcessor, progressProvider, guardRoute,
    xApiInitializer) {

    'use strict';
    var viewmodel = {
        router: null,
        cssName: null,
        isInReviewMode: false,
        title: '',
        createdOn: null,
        logoUrl: '',
        pdfExportEnabled: false,
        isClosed: ko.observable(false),
        isNavigatingToAnotherView: ko.observable(false),

        viewSettings: viewSettings,
        compositionComplete: compositionComplete,
        activate: activate
    };

    viewmodel.router = router;
    viewmodel.cssName = ko.computed(function() {
        var activeItem = router.activeItem();
        if (_.isObject(activeItem)) {
            var moduleId = activeItem.__moduleId__;
            moduleId = moduleId.slice(moduleId.lastIndexOf('/') + 1);
            return moduleId;
        }
        return '';
    });
    viewmodel.isInReviewMode = router.getQueryStringValue('reviewApiUrl');

    router.on('router:route:activating')
        .then(function(newView) {
            var currentView = router.activeItem();
            if (newView && currentView && newView.__moduleId__ === currentView.__moduleId__) {
                return;
            }
            viewmodel.isNavigatingToAnotherView(true);
        });
    
    app.on(constants.events.appClosed)
        .then(function() {
            viewmodel.isClosed(true);
        });

    return viewmodel;

    //public methods
    function activate() {
        return context.initialize()
            .then(userContext.initialize)
            .then(initializeProgressProvider)
            .then(modulesInitializer.init)
            .then(lessProcessor.init.bind(lessProcessor, templateSettings.colors, templateSettings.fonts))
            .then(initApp)
            .then(initRouter);

        function initializeProgressProvider() {
            if (!modulesInitializer.hasModule('../includedModules/lms') && location.href.indexOf('/preview/') === -1) {
                return progressProvider.initialize(templateSettings.allowCrossDeviceSaving).then(function(user) {
                    progressContext.use(progressProvider.progressProvider);
                }).fail(function () {
                    progressContext.use(progressProvider.progressProvider);
                });
            }
        }

        function initApp(){
            return Q.fcall(function(){
                viewmodel.logoUrl = templateSettings.logoUrl;
                viewmodel.pdfExportEnabled = templateSettings.pdfExport.enabled;
                viewmodel.title = app.title = context.course.title;
                viewmodel.createdOn = context.course.createdOn;
                restoreProgress();
                app.trigger(constants.events.appInitialized);
            });
        }

        function initRouter() {
            guardRoute.createGuard();
            return router.map(routes).buildNavigationModel().mapUnknownRoutes('viewmodels/404', '404').activate().then(function() {
                errorsHandler.startHandle();
            });
        }

        function restoreProgress() {
            var progress = null;

            if (progressContext.ready()) {
                progress = progressContext.get();
                if (_.isObject(progress)) {
                    if (_.isObject(progress.answers)) {
                        _.each(context.course.sections, function(section) {
                            _.each(section.questions, function(question) {
                                if (!_.isNullOrUndefined(progress.answers[question.shortId])) {
                                    question.progress(progress.answers[question.shortId]);
                                }
                            });
                        });
                    }
                }
                window.location.hash = !_.isString(progress.url) ? '' : progress.url.replace('objective', 'section'); //fix for old links
            }
        }
    }

    function viewSettings() {
        var settings = {
            rootLinkEnabled: true,
            exitButtonVisible: true,
            treeOfContentVisible: true
        };

        var activeInstruction = router.activeInstruction();
        if (_.isObject(activeInstruction)) {
            settings.rootLinkEnabled = !activeInstruction.config.rootLinkDisabled && !router.isNavigationLocked();
            settings.exitButtonVisible = !activeInstruction.config.hideExitButton;
            settings.treeOfContentVisible = templateSettings.treeOfContent.enabled && activeInstruction.config.displayTreeOfContent;
        }
        return settings;
    }

    function compositionComplete() {
        background.apply(templateSettings.background);
    }
});