﻿define(['durandal/app', 'constants'],
    function (app, constants) {
        "use strict";

        var
            errorMessages = {
                invalidEndpoint: "Invalid endpoint",
                notFoundEndpoint: "Not found endpoint",
                invalidCredentials: "Invalid credentials",
                invalidEmail: "Invalid e-mail",
                invalidProtocol: "Invalid protocol",
                xDomainRequestError: "XDomainRequest error",
                timeoutError: "Timeout error",

                badRequest: "Bad request: ",
                unhandledMessage: "Unhandled error: ",

                verbIsIncorrect: "Vebr object is not well formed",
                actorDataIsIncorrect: "Actor data is incorrect",

                notEnoughDataInSettings: "Request failed: Not enough data in the settings"
            },

            handleError = function (message) {
                if (window.location.hash.indexOf('xapierror') !== -1) {
                    return;
                }

                var hash = window.location.hash.slice(1, window.location.hash.length);
                var navigateUrl = 'xapierror/' + encodeURIComponent(_.isEmpty(hash) ? '' : hash);

                app.trigger(constants.events.onError, { navigateUrl: navigateUrl });
            };

        return {
            errors: errorMessages,
            handleError: handleError
        };
    }
);