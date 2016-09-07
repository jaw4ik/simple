define(['plugins/router'], function(router) {
    var context = {
        initialize: initialize,
        getCurrentUser: getCurrentUser,
        user: new UserContext()
    };
    
    return context;

    function UserContext() {
        this.email = null;
        this.username = null;
        this.password = null;
        this.keepMeLoggedIn = false;
        this.showProgressStorageInfo = true;
    }

    function getCurrentUser() {
        return context.user.email && context.user.username ? context.user : null;
    }

    function initialize() {
        return Q.fcall(function() {
            var username = router.getQueryStringValue('name'),
                email = router.getQueryStringValue('email'),
                hideContinueCourseOptions = router.getQueryStringValue('hideContinueCourseOptions');

            if (username || email) {
                context.user.email = email ? email : '';
                context.user.username = username ? username : '';
            }

            context.user.showProgressStorageInfo = hideContinueCourseOptions == null;
        });
    }
});