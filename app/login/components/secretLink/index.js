define([
    'context',
    'modules/progress/index'
], function(context, progressProvider) {
    'use strict';
    
    return function (){
        var usermail = null;
        
        this.isSecretLinkSent = ko.observable(false);
        this.sendSecretLink = function (){
            this.isSecretLinkSent(true);
            progressProvider.sendSecretLink(usermail, context.course.title, true);
        };
        this.activate = function(userEmail) {
            usermail = userEmail;
        };
    };
});