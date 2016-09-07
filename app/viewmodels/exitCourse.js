define([
    'durandal/app', 'windowOperations', 'repositories/courseRepository', 'progressContext',
    'plugins/router', 'templateSettings', 'translation', 'constants', 'modules/progress/index',
    'xApi/xApiInitializer', 'modulesInitializer'
], function(app, windowOperations, courseRepository, progressContext, router, templateSettings,
    translation, constants, progressProvider, xApiInitializer, modulesInitializer) {
    "use strict";

    var progressStatuses = constants.progressContext.statuses;

    var statuses = {
        readyToFinish: 'readyToFinish',
        sendingRequests: 'sendingRequests',
        finished: 'finished'
    };

    var course = courseRepository.get();

    var viewModel = {
        type: ko.observable(),
        isNavigationLocked: router.isNavigationLocked,

        status: ko.observable(statuses.readyToFinish),
        statuses: statuses,

        score: course.score,
        masteryScore: templateSettings.masteryScore.score,
        xAPIEnabled: false,
        scormEnabled: false,
        activate: activate
    };

    viewModel.finishCoursePopup = new Popup();
    viewModel.finishCoursePopup.actions = {
        close: viewModel.finishCoursePopup.hide,
        finish: function(logOutCallback) {
            finish(logOutCallback);
            viewModel.finishCoursePopup.hide();
        }
    };

    viewModel.continueLaterPopup = new Popup();

    viewModel.continueLaterPopup.actions = {
        close: viewModel.continueLaterPopup.hide,
        exit: exit
    };

    viewModel.isProgressSaved = ko.computed(function() {
        return progressContext.status() === progressStatuses.saved;
    });

    viewModel.isProgressNotSaved = ko.computed(function() {
        return progressContext.status() === progressStatuses.error;
    });

    viewModel.finishAction = function() {
        if (templateSettings.showConfirmationPopup) {
            viewModel.continueLaterPopup.hide();
            viewModel.finishCoursePopup.show();
        } else {
            finish();
        }
    };

    viewModel.takeABreakAction = function() {
        viewModel.finishCoursePopup.hide();
        viewModel.continueLaterPopup.show();
    }

    return viewModel;

    function activate(type) {
        viewModel.type(type);
        viewModel.xAPIEnabled = xApiInitializer.isActivated();
        viewModel.scormEnabled = modulesInitializer.hasModule('../includedModules/lms');
    }

    function onCourseFinishedCallback(logOutCallback) {
        viewModel.status(statuses.finished);

        progressContext.status(progressStatuses.ignored);
        logOutCallback();
        windowOperations.close();
    }

    function exit() {
        if (progressContext.status() === progressStatuses.error) {
            var isCourseClosingConfirmed = confirm(translation.getTextByKey('[progress is not saved confirmation]'));
            if (!isCourseClosingConfirmed) {
                return;
            }
            progressContext.status(progressStatuses.ignored);
        }

        windowOperations.close();
    }

    function finish(logOutCallback) {
        if (viewModel.isNavigationLocked() || viewModel.status() !== statuses.readyToFinish) {
            return;
        }
        viewModel.status(statuses.sendingRequests);
        var course = courseRepository.get();
        course.finish(onCourseFinishedCallback.bind(viewModel, logOutCallback || function() {}));

        progressContext.remove();
    }

    function Popup() {
        var that = this;
        this.actions = {};
        this.isVisible = ko.observable(false);
        this.show = function() {
            if (router.isNavigationLocked()) {
                return;
            }

            that.isVisible(true);
        };

        this.hide = function() {
            that.isVisible(false);
        };
    }

});