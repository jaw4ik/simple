define([
        'underscore', 'plugins/router', 'context', 'progressContext',
        'modules/progress/index', 'userContext', 'eventManager'
    ],
    function(_, router, context, progressContext, progressProvider, userContext, eventManager) {
        'use strict';

        return function() {
            var user = null,
                progress = null,
                isCourseStarted = false;

            progressContext.use(progressProvider.progressProvider);

            if (progressContext.ready()) {
                user = userContext.getCurrentUser();
                progress = progressContext.get();
                isCourseStarted = _.isObject(progress) && _.isObject(progress.user) && _.isString(progress.url);

                if (!isCourseStarted) {
                    eventManager.courseStarted();
                }
                if (_.isObject(progress)){
                    if(_.isObject(progress.answers)){
                        _.each(context.course.sections, function(section){
                            _.each(section.questions, function(question){
                                if(!_.isNullOrUndefined(progress.answers[question.shortId])){
                                    question.progress(progress.answers[question.shortId]);
                                }
                            });
                        });
                    }
                    router.navigate(_.isNull(progress.url) ? '' : progress.url.replace('objective', 'section')); //fix for old links
                }
            }
        };
    });