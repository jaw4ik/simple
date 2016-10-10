define(['plugins/router', 'underscore', 'templateSettings', 'userContext', 'limitAccess/accessLimiter'], function (router, _, templateSettings, userContext, accessLimiter) {
    'use strict';

    var defaultGuard = null,
        loginGuardSkipped = false;


    function guardViewUrl(route, guardView) {
        return route.queryString ? guardView + '?' + route.queryString : guardView;
    }

    return {
        createGuard: function () {
            defaultGuard = router.guardRoute;
            var loginGuardView = 'login',
                noAccessGuardView = 'noaccess';

            router.guardRoute = function (model, route) {
                var user = userContext.getCurrentUser(),
                    accessLimitationEnabled = accessLimiter.accessLimitationEnabled(),
                    xapiEnabled = templateSettings.xApi.enabled,
                    allowCrossDeviceSaving = templateSettings.allowCrossDeviceSaving,
                    currentRoute = route.config.route;

                if (currentRoute === loginGuardView) {
                    return user && accessLimiter.userHasAccess(user) ? '/' : true;
                }

                if (!user && !loginGuardSkipped && (xapiEnabled || allowCrossDeviceSaving || accessLimitationEnabled)) {
                    return guardViewUrl(route, loginGuardView);
                }

                if (currentRoute === noAccessGuardView) {
                    return accessLimitationEnabled && (!user || !accessLimiter.userHasAccess(user)) ? true : '/';
                }

                if (accessLimitationEnabled && (!user || !accessLimiter.userHasAccess(user))) {
                    return guardViewUrl(route, noAccessGuardView);
                }

                if (_.isFunction(defaultGuard)) {
                    return defaultGuard(model, route);
                }
                return true;
            };
        },
        skipLoginGuard: function () {
            loginGuardSkipped = true;
        }
    };
});