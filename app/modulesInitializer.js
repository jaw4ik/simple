define(['moduleLoader', 'eventManager', 'progressContext', 'userContext'],
    function(moduleLoader, eventManager, progressContext, userContext) {

        "use strict";

        var modulesConfigs = {},
            modulesManager = {
                register: register,
                init: init,
                hasModule: hasModule
            };

        return modulesManager;

        function hasModule(moduleName) {
            moduleName = moduleName || '';
            return _.has(modulesConfigs, moduleName)
        }

        function register(config) {
            if (_.isNullOrUndefined(config)) {
                return;
            }

            if (!_.isObject(config)) {
                throw "Configuration parameter should be an object.";
            }

            modulesConfigs = config;
        }

        function init() {
            var moduleIds = _.keys(modulesConfigs);
            var modulesToLoad = [];

            for (var i = 0; i < moduleIds.length; i++) {
                var moduleId = moduleIds[i];
                if (_moduleHasToBeLoaded(moduleId, modulesConfigs[moduleId])) {
                    modulesToLoad.push(moduleId);
                }
            }

            var dfd = Q.defer();

            function loadModulesSequentially() {
                if (modulesToLoad.length == 0) {
                    dfd.resolve();
                    return;
                }


                var module = modulesToLoad.shift();
                moduleLoader.loadModule(module).then(onModuleLoaded).fail(onModuleLoadingFailed).then(function() {
                    loadModulesSequentially();
                });
            }

            loadModulesSequentially();
            return dfd.promise;
        }

        function onModuleLoaded(module) {
            return Q.fcall(function() {
                if (_.isFunction(module.initialize)) {
                    module.initialize(modulesConfigs[module.__moduleId__]);
                }

                if (_.isFunction(module.courseFinished)) {
                    eventManager.subscribeForEvent(eventManager.events.courseFinished).then(module.courseFinished);
                }
                if (_.isObject(module.userInfoProvider)) {
                    userContext.use(module.userInfoProvider);
                }
                if (_.isObject(module.progressProvider)) {
                    progressContext.use(module.progressProvider);
                }
            });
        }

        function onModuleLoadingFailed(error) {
            throw 'Cannot load module"' + error.modulePath + '". because of next error "' + error.message + '".';
        }

        function _moduleHasToBeLoaded(moduleId, moduleConfig) {
            // if config is not defined, module will be skiped
            if (_.isNullOrUndefined(moduleConfig))
                return false;

            if (_.isBoolean(moduleConfig)) {
                return moduleConfig;
            }

            if (!_.isObject(moduleConfig)) {
                throw 'Configuration parameter for module  ' + moduleId + ' has to be an object or boolean.';
            }

            if (_.isBoolean(moduleConfig['enabled'])) {
                return moduleConfig['enabled'];
            }

            return true;
        }
    }
);