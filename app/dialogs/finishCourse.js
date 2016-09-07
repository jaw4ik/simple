define([
    'knockout', 'modules/progress/index', 'userContext', 'xApi/xApiInitializer', 'modulesInitializer'
], function(ko, progressProvider, userContext, xApiInitializer, modulesInitializer) {

    var viewmodel = {
        //properties
        crossDeviceEnabled: false,
        xAPIEnabled: false,
        scormEnabled: false,
        stayLoggedIn: ko.observable(false),

        //methods
        activate: activate,
        toggleStayLoggedIn: toggleStayLoggedIn
    };

    return viewmodel;

    function activate(data) {
        viewmodel.crossDeviceEnabled = progressProvider.crossDeviceEnabled;
        viewmodel.xAPIEnabled = xApiInitializer.isActivated();
        viewmodel.scormEnabled = modulesInitializer.hasModule('../includedModules/lms');
        if (data) {
            viewmodel.close = data.close;
            viewmodel.finish = function() {
                if (!viewmodel.stayLoggedIn()) {
                    data.finish(progressProvider.logOut);
                }
                data.finish();
            };
            viewmodel.stayLoggedIn(userContext.keepMeLoggedIn);
        }
    }

    function toggleStayLoggedIn() {
        viewmodel.stayLoggedIn(userContext.keepMeLoggedIn = !viewmodel.stayLoggedIn());
    }
});