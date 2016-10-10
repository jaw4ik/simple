define(['plugins/router', 'durandal/app'], function(router, app) {
    var context = {
        use: use,
        initialize: initialize,
        getCurrentUser: getCurrentUser,
        user: new UserContext(),
        clear: clear
    };
    
    return context;

    function UserContext() {
        this.account = null;
        this.email = null;
        this.username = null;
        this.password = null;
        this.keepMeLoggedIn = false;
        this.showProgressStorageInfo = true;
    }

    function getCurrentUser() {
        return (context.user.email || context.user.account) && context.user.username ? context.user : null;
    }

    function use(userInfoProvider) {
        if(!userInfoProvider) {
            return;
        }
        var accountId = userInfoProvider.getAccountId(),
            accountHomePage = userInfoProvider.getAccountHomePage(),
            username = userInfoProvider.getUsername();
        if(!accountId || !accountHomePage || !username) {
            return;
        }
        context.user.email = accountId;
        context.user.username = username;
        context.user.account = {
            homePage: accountHomePage,
            name: accountId
        };
    }

    function clear() {
        context.user = new UserContext();
    }

    function initialize() {
        return Q.fcall(function () {
            app.on('user:authenticated').then(authenticated);

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

    function authenticated(authenticatedUser) {
        context.user.email = authenticatedUser.email;
        context.user.username = authenticatedUser.username;
    }
});