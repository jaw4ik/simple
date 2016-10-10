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
        router.navigate('#finish');
    };

    viewModel.takeABreakAction = function() {
        viewModel.continueLaterPopup.show();
    }

    return viewModel;

    function activate(type) {
        viewModel.type(type);
        viewModel.xAPIEnabled = xApiInitializer.isActivated();
        viewModel.scormEnabled = modulesInitializer.hasModule('../includedModules/lms');
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