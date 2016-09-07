(function (app) {

    app.localize = function (key) {
        return translations[key];
    };

    var translations = {
        'changes are saved': 'All changes are saved',
        'changes are not saved': 'Changes have NOT been saved. Please reload the page and change the settings again. Contact support@easygenerator.com if problem persists.',
        'settings are not initialize': 'Template settings are not initialized. Please reload the page and change the settings again. Contact support@easygenerator.com if problem persists.',

        //general settings tab
        'general settings': 'General Settings',
        'pdf export': 'PDF export (experimental):',
        'show download as pdf button': 'Show button "Download course in PDF format"',

        //results tracking tab
        'results tracking': 'Results Tracking',

        'default': 'easygenerator (recommended)',
        'custom': 'Custom LRS',

        'track and trace settings': 'Track and trace settings',
        'results tracking option': 'Results tracking:',
        'results tracking hint': '(will not affect tracking and tracing in SCORM/LMS)',
        'allow user to skip option': 'Allow user to skip tracking and tracing:',
        'allow scoring of content pages': 'Allow scoring of content pages:',
        'show confirmation popup': 'Show confirmation dialogue:',
        'show confirmation popup hint': '(when submitting final results)',
        'disabled': 'Disabled',
        'enabled': 'Enabled',
        'allow': 'Allow',
        'forbid': 'Forbid',
        'hide': 'Hide',
        'show': 'Show',
        'advanced settings': 'Advanced settings',
        'report to': 'Report to:',
        'custom lrs settings': 'Custom LRS settings',
        'lrs url': 'LRS URL',
        'authentication required': 'Authentication required',
        'lap login': 'LAP login',
        'lap password': 'LAP password',
        'use statements': 'Use statements:',
        'started': 'Started',
        'stopped': 'Stopped',
        'passed': 'Passed',
        'answered': 'Answered',
        'mastered': 'Mastered',
        'expirenced': 'Expirenced',
        'failed': 'Failed',
        'progressed': 'Progressed',
        'save progress cross device': 'Save progress cross device (requires login and password):',
        'allow social media': 'Allow login via social media',

        //mastery score
        'mastery score settings': 'Mastery score settings',
        'mastery score caption': 'Mastery score:',
        'mastery score hint': '(for each learning objective):',

        //template language
        'template language': 'Template language',

        'xx': 'Custom',
        'cn': 'Chinese',
        'de': 'German',
        'en': 'English',
        'fr': 'French',
        'it': 'Italian',
        'nl': 'Dutch',
        'tr': 'Turkish',
        'ua': 'Ukrainian',
		'es': 'Spanish',
		'pt-br': 'Portuguese (Brazil)',
		'ru': 'Russian',
		'ms': 'Malay',
		'kr': 'Korean',
		'nb-no': 'Norwegian (Bokmal)',
		'nn-no': 'Norwegian (Nynorsk)',
        'vi': 'Vietnamese',

        'choose language for your course': 'Choose language for your course',
        'defaultText': 'Default',
        'translation': 'Translation'
    };

})(window.app = window.app || {});
