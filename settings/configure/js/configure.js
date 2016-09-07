(function (app) {

    var
        currentSettings = null,
        currentExtraData = null;

    var viewModel = {
        isError: ko.observable(false),

        trackingData: null,
        masteryScore: null,
        languages: null,
        pdfExport: null,
        showConfirmationPopup: ko.observable(true),
        allowContentPagesScoring: ko.observable(false),
        allowCrossDeviceSaving: ko.observable(true),
        allowSocialLogin: ko.observable(true)
    };

    viewModel.getCurrentSettingsData = function (settings) {
        return $.extend({}, settings || currentSettings, {
            pdfExport: viewModel.pdfExport.getData(),
            xApi: viewModel.trackingData.getData(),
            masteryScore: viewModel.masteryScore.getData(),
            languages: viewModel.languages.getData(),
            showConfirmationPopup: viewModel.showConfirmationPopup(),
            allowContentPagesScoring: viewModel.allowContentPagesScoring(),
            allowCrossDeviceSaving: viewModel.allowCrossDeviceSaving(),
            allowLoginViaSocialMedia: viewModel.allowSocialLogin()
        });
    };

    viewModel.getCurrentExtraData = function () {
        return {};
    };

    viewModel.saveChanges = function () {
        var settings = viewModel.getCurrentSettingsData(),
            extraData = viewModel.getCurrentExtraData(),
            newSettings = JSON.stringify(settings),
            newExtraData = JSON.stringify(extraData);

        if (JSON.stringify(currentSettings) === newSettings && JSON.stringify(currentExtraData) === newExtraData) {
            return;
        }

        window.egApi.saveSettings(newSettings, newExtraData, app.localize('changes are saved'), app.localize('changes are not saved'))
            .done(function () {
                currentSettings = settings;
                currentExtraData = extraData;
            });
    };

    viewModel.init = function () {
        var api = window.egApi;
        return api.init().then(function () {
            var manifest = api.getManifest(),
                settings = api.getSettings();

            viewModel.pdfExport = new app.PdfExport(settings.pdfExport);
            viewModel.trackingData = new app.TrackingDataModel(settings.xApi);
            viewModel.masteryScore = new app.MasteryScore(settings.masteryScore);
            viewModel.languages = new app.LanguagesModel(manifest.languages, settings.languages);
            
            if (settings.hasOwnProperty('showConfirmationPopup')) {            
                viewModel.showConfirmationPopup(settings.showConfirmationPopup);
            }

            if (settings.hasOwnProperty('allowContentPagesScoring')) {
                viewModel.allowContentPagesScoring(settings.allowContentPagesScoring);
            }

            if (settings.hasOwnProperty('allowCrossDeviceSaving')){
                viewModel.allowCrossDeviceSaving(settings.allowCrossDeviceSaving);
            }
            
            if (settings.hasOwnProperty('allowLoginViaSocialMedia')) {
                viewModel.allowSocialLogin(settings.allowLoginViaSocialMedia);
            }

            currentSettings = viewModel.getCurrentSettingsData(settings);
            currentExtraData = viewModel.getCurrentExtraData();

        }).fail(function () {
            viewModel.isError(true);
        });
    };

    viewModel.init().always(function () {
        $(document).ready(function () {
            ko.applyBindings(viewModel, $('.settings-container')[0]);
            $(window).on('blur', viewModel.saveChanges);
        });
    });

})(window.app = window.app || {});
