define(['manifestReader'], function (manifestReader) {

    var defaultTranslationsCode = 'en';

    var defaultTemplateSetting = {
        "sectionsLayout": {
            "key": "Tiles"
        },
        "treeOfContent": {
            "enabled": true
        },
        "xApi": {
            "enabled": true,
            "selectedLrs": "default",
            "lrs": {
                "uri": "",
                "credentials": {
                    "username": "",
                    "password": ""
                },
                "authenticationRequired": false
            },
            "allowedVerbs": []
        },
        "languages": {
            "selected": "en",
            "customTranslations": {}
        },
        "pdfExport": {
            "enabled": false
        },
        "showConfirmationPopup": true,
        "allowContentPagesScoring": false,
        "allowCrossDeviceSaving": true,
        "allowLoginViaSocialMedia": true
    };

    return {
        init: init,

        masteryScore: {
            score: 100
        },

        logoUrl: '',

        sectionsLayout: {
            key: ''
        },
        xApi: {},
        pdfExport: {},
        languages: {}
    };

    function init(settings, themeSettings) {
        var that = this;

        return manifestReader.readManifest().then(function (manifestData) {
            var preset = manifestData && _.isArray(manifestData.presets) ? manifestData.presets[0] : null;
            var defaultThemeSettings = preset != null ? preset.settings : {};


            // fix for fonts and colors:
            // remove nulls from fonts array, because deepDiff in case with arrays returns array with the only changed element
            // e.g: deepDiff({ array: [{ id: 1 }, { id: 2 }] }, { array: [{ id: 1 }, { id: 3 }] }) => { array: [ , { id: 2 }] }
            // the first element in returned array will be not defined, json convert will return { array: [null, { id: 2 }] }
            // that'a why nulls should be deleted or untracked.
            settings && _.isArray(settings.fonts) && removeNullsInArray(settings.fonts);
            themeSettings && _.isArray(themeSettings.fonts) && removeNullsInArray(themeSettings.fonts);
            settings && settings.branding && _.isArray(settings.branding.colors) && removeNullsInArray(settings.branding.colors);
            themeSettings && themeSettings.branding && _.isArray(themeSettings.branding.colors) && removeNullsInArray(themeSettings.branding.colors);
            // end fix

            var designSettings = _.defaults(themeSettings, defaultThemeSettings);
            var templateSettings = _.defaults(settings, defaultTemplateSetting);

            var fullSettings = deepExtend(templateSettings, designSettings);

            //Mastery score initialization
            if (fullSettings.masteryScore) {
                var score = Number(fullSettings.masteryScore.score);
                that.masteryScore.score = (_.isNumber(score) && score >= 0 && score <= 100) ? score : 100;
            }
            //Course logo initialization
            if (fullSettings.branding.logo && fullSettings.branding.logo.url && fullSettings.branding.logo.url.length) {
                that.logoUrl = fullSettings.branding.logo.url;
            }

            //sections layout initialization
            if (!_.isEmptyOrWhitespace(fullSettings.sectionsLayout.key)) {
                that.sectionsLayout = fullSettings.sectionsLayout.key;
            }

            that.treeOfContent = fullSettings.treeOfContent;
            that.colors = fullSettings.branding.colors;
            that.fonts = fullSettings.fonts;

            that.background = fullSettings.branding.background;
            that.xApi = fullSettings.xApi;
            that.pdfExport = fullSettings.pdfExport;
            that.showConfirmationPopup = fullSettings.showConfirmationPopup;
            that.allowContentPagesScoring = fullSettings.allowContentPagesScoring;
            that.allowCrossDeviceSaving = fullSettings.allowCrossDeviceSaving;
            that.allowLoginViaSocialMedia = fullSettings.allowLoginViaSocialMedia;

            that.languages.selected = fullSettings.languages.selected;
            that.languages.customTranslations = fullSettings.languages.customTranslations;
        });
    }

    function deepExtend(destination, source) {
        if (_.isNullOrUndefined(destination)) {
            return source;
        }

        for (var property in source) {
            if (!source.hasOwnProperty(property)) {
                continue;
            }

            if (source[property] && source[property].constructor &&
             (source[property].constructor === Object || source[property].constructor === Array)) {
                if (destination.hasOwnProperty(property)) {
                    deepExtend(destination[property], source[property]);
                } else {
                    destination[property] = source[property];
                }
            } else {
                destination[property] = destination.hasOwnProperty(property) ? destination[property] : source[property];
            }
        }
        return destination;
    }

    function removeNullsInArray(array) {
        if (array && array.length) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === null) {
                    delete array[i];
                }
            }
        }
    }
});
