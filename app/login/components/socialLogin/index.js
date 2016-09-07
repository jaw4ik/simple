define([
    'context',
    'modules/progress/index'
], function(context, progressProvider) {
    'use strict';
    return function(){
        this.progressStorageUrl = progressProvider.progressStorageUrl;
        this.courseTitle = context.course.title;
    }
});