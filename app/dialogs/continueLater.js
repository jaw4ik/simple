define(['modules/progress/index', 'userContext', 'browserSupport'], function (progressProvider, userContext, browserSupport) {

    var viewModel = {
        activate: activate,
        progressStorageActivated: false,
        isOnline: false,
        authLink: '',
        email: '',
        password: '',
        stayLoggedIn: ko.observable(false),
        toggleStayLoggedIn: toggleStayLoggedIn,
        optionsShowed: ko.observable(false),
        toggleOptionsVisibility: toggleOptionsVisibility,
        secretLinkCopied: ko.observable(false),
        credentialsCopied: ko.observable(false),
        copyButtonHidden: browserSupport.isSafari
    };

    return viewModel;
    
    function toggleStayLoggedIn(){
        viewModel.stayLoggedIn(!viewModel.stayLoggedIn());
        userContext.keepMeLoggedIn = viewModel.stayLoggedIn();
    }
    
    function toggleOptionsVisibility(){
        viewModel.optionsShowed(!viewModel.optionsShowed());
    }

    function activate(data) {
        if (data) {
            viewModel.close = data.close;
            viewModel.exit = function () {
                if (!viewModel.stayLoggedIn() && viewModel.isOnline && progressProvider.isInitialized) {
                    progressProvider.logOut();
                }
                data.exit();
            };
            viewModel.optionsShowed(false),
            viewModel.secretLinkCopied(false),
            viewModel.credentialsCopied(false),
            viewModel.stayLoggedIn(userContext.keepMeLoggedIn);
            viewModel.progressStorageActivated = progressProvider.crossDeviceEnabled && progressProvider.isInitialized;
            viewModel.isOnline = progressProvider.isOnline;
            viewModel.authLink = progressProvider.authLink();
            viewModel.email = userContext.user.email;
            viewModel.password = userContext.user.password;
            viewModel.showProgressStorageInfo = userContext.user.showProgressStorageInfo;
        }
    }
});