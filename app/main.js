requirejs.config({
    paths: {
        'text': '../js/text',
        'durandal': '../js/durandal',
        'plugins': '../js/durandal/plugins',
        'transitions': '../js/durandal/transitions'
    }
});

define('jquery', function() { return jQuery; });
define('knockout', function() { return ko; });
define('WebFont', function() { return WebFont; });


define(['durandal/app', 'durandal/viewLocator', 'durandal/system', 'plugins/router', 'modulesInitializer', 'bootstrapper', 'templateSettings', 'settingsReader', 'translation', 'modules/webFontLoaderProvider'],
    function(app, viewLocator, system, router, modulesInitializer, bootstrapper, templateSettings, settingsReader, translation, webFontLoader) {
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

            if (location.href.indexOf('/preview/') === -1) {
                modules['modules/localStorage_progressProvider'] = true;
            }

            return readPublishSettings().then(function() {
                return readTemplateSettings().then(function(settings) {
                    return initTemplateSettings(settings).then(function() {
                        return webFontLoader.init(settings.fonts).then(function() {
                            return initTranslations(settings).then(function() {
                                modulesInitializer.register(modules);
                                app.setRoot('viewmodels/shell');
                            });
                        });
                    });
                });
            }).catch(function(e) {
                console.error(e);
            });


            function readPublishSettings() {
                return settingsReader.readPublishSettings().then(function(settings) {
                    _.each(settings.modules, function(module) {
                        modules['../includedModules/' + module.name] = true;
                    });
                });
            }

            function readTemplateSettings() {
                return settingsReader.readTemplateSettings();
            }

            function initTemplateSettings(settings) {
                return templateSettings.init(settings).then(function() {
                    if (isXapiDisabled()) {
                        templateSettings.xApi.enabled = false;
                    }
                    modules['xApi/xApiInitializer'] = templateSettings.xApi;
                });
            }

            function isXapiDisabled() {
                var xapi = router.getQueryStringValue('xapi');
                return !templateSettings.xApi.required && !_.isNullOrUndefined(xapi) && xapi.toLowerCase() === 'false';
            }

            function initTranslations(settings) {
                return translation.init(settings.languages.selected, settings.languages.customTranslations);
            }
        });
    }
);