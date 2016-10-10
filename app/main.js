requirejs.config({
    paths: {
        'text': '../js/text',
        'durandal': '../js/durandal',
        'plugins': '../js/durandal/plugins',
        'transitions': '../js/durandal/transitions'
    }
});

define('jquery', function () { return jQuery; });
define('knockout', function () { return ko; });
define('WebFont', function () { return WebFont; });
define('q', function () { return Q; });
define('underscore', function () { return _; });
define('perfectScrollbar', function () { return Ps; });


define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'plugins/router', 'modulesInitializer', 'bootstrapper', 'templateSettings',
    'settingsReader', 'translation', 'modules/webFontLoaderProvider', 'limitAccess/accessLimiter'],
    function (app, viewLocator, system, router, modulesInitializer, bootstrapper, templateSettings, settingsReader, translation, webFontLoader, accessLimiter) {
        app.title = 'easygenerator';

        system.debug(false);

        app.configurePlugins({
            router: true,
            dialog: true,
            http: true,
            widget: true
        });

        app.start().then(function() {
            bootstrapper.run();

            var modules = {};

            return loadIncludedModules().then(function() {
                return initTemplateSettings().then(function(templateSettings) {
                    return loadExternalResources(templateSettings).then(function() {
                        return initTranslations(templateSettings).then(function() {
                            modulesInitializer.register(modules);
                            app.setRoot('viewmodels/shell');
                        });
                    });
                });
            }).catch(function(e) {
                console.error(e);
            });

            function loadIncludedModules() {
                return settingsReader.readPublishSettings().then(function (settings) {
                    var hasLmsModule = false;
                    _.each(settings.modules, function (module) {
                        modules['../includedModules/' + module.name] = true;
                        if (module.name === 'lms') {
                            hasLmsModule = true;
                        }
                    });

                    accessLimiter.initialize(settings.accessLimitation, hasLmsModule);
                });
            }

            function initTemplateSettings() {
                return settingsReader.readTemplateSettings().then(function(settings) {
                    return settingsReader.readThemeSettings().then(function (themeSettings) {
                        return templateSettings.init(settings, themeSettings).then(function () {
                            if (isXapiDisabled()) {
                                templateSettings.xApi.enabled = false;
                            }
                            if (isCrossDeviceDisabled()) {
                                templateSettings.allowCrossDeviceSaving = false;
                            }

                            modules['xApi/xApiInitializer'] = templateSettings.xApi;

                            return templateSettings;
                        });
                    });
                });
            }

            function isXapiDisabled() {
                var xapi = router.getQueryStringValue('xapi');
                return !templateSettings.xApi.required && !_.isNullOrUndefined(xapi) && xapi.toLowerCase() === 'false';
            }

            function isCrossDeviceDisabled() {
                var crossDevice = router.getQueryStringValue('cross-device');
                return !_.isNullOrUndefined(crossDevice) && crossDevice.toLowerCase() === 'false';
            }

            function loadExternalResources(templateSettings) {
                return webFontLoader.init(templateSettings.fonts);
            }

            function initTranslations(templateSettings) {
                return translation.init(templateSettings.languages.selected, templateSettings.languages.customTranslations);
            }
        });
    }
);