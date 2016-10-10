var gulp = require('gulp'),
    del = require('del'),
    durandal = require('gulp-durandal'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    eventStream = require('event-stream'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    has = require('gulp-has'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    autoprefixer = require('gulp-autoprefixer'),
    replace = require('gulp-replace'),
    rename  = require('gulp-rename'),

    bower = require('gulp-bower'),
    output = ".output",
    buildVersion = +new Date();

var $ = require('gulp-load-plugins')({
    lazy: true
});

function addBuildVersion() {
    return eventStream.map(function (file, callback) {
        var filePath = file.history[0];
        if (filePath && filePath.match(/\.(js)$/gi)) {
            callback(null, file);
            return;
        }
        var fileContent = String(file.contents);
        fileContent = fileContent
            .replace(/(\?|\&)v=([0-9]+)/gi, '') // remove build version
            .replace(/\.(jpeg|jpg|png|gif|css|js|html|eot|svg|ttf|woff)([?])/gi, '.$1?v=' + buildVersion + '&') // add build version to resource with existing query param
            .replace(/\.(jpeg|jpg|png|gif|css|js|html|eot|svg|ttf|woff)([\s\"\'\)])/gi, '.$1?v=' + buildVersion + '$2') // add build version to resource without query param
            .replace(/urlArgs: 'v=buildVersion'/gi, 'urlArgs: \'v=' + buildVersion + '\''); // replace build version for require config
        file.contents = new Buffer(fileContent);
        callback(null, file);
    });
};

function removeDebugBlocks() {
    return eventStream.map(function (file, callback) {
        var fileContent = String(file.contents);
        fileContent = fileContent
            .replace(/(\/\* DEBUG \*\/)([\s\S])*(\/\* END_DEBUG \*\/)/gmi, '') // remove all code between '/* DEBUG */' and '/* END_DEBUG */' comment tags
            .replace(/(\/\* RELEASE)|(END_RELEASE \*\/)/gmi, ''); // remove '/* RELEASE' and 'END_RELEASE */' tags to uncomment release code
        file.contents = new Buffer(fileContent);
        callback(null, file);
    });
};

gulp.task('process-less', function () {
    gulp.src(['./css/main.less'])
        .pipe($.plumber({
            errorHandler: function (error) {
                console.log(error);
                this.emit('end');
            }
        }))
        .pipe($.less({
            strictMath: true,
            strictUnits: true
        }))
        .pipe($.csso())
        .pipe($.autoprefixer({
            browsers: ['last 1 Chrome version', 'last 1 Firefox version', 'last 1 Explorer version', 'last 1 Safari version', 'last 1 iOS version'],
            cascade: false
        }))
        .pipe(gulp.dest('./css/'));
});

gulp.task('watch', ['process-less'], function () {
    gulp.watch('./css/main.less', ['process-less']);
});

gulp.task('build', ['pre-build', 'build-app', 'build-settings', 'build-pdf-app', 'build-searchcontent-app'], function () {
});

gulp.task('clean', function (cb) {
    del([output], cb);
});

gulp.task('bower', ['clean'], function () {
    return bower({ cmd: 'update' });
});

gulp.task('assets', ['clean', 'bower'], function () {
    gulp.src('vendor/easygenerator-plugins/dist/font/**')
        .pipe(gulp.dest(output + '/css/font'));
    gulp.src('vendor/easygenerator-plugins/dist/img/**')
        .pipe(gulp.dest(output + '/css/img'));
});

gulp.task('pre-build', ['clean', 'bower', 'assets', 'process-less'], function () {
});

gulp.task('build-app', ['pre-build'], function () {
    var assets = useref.assets();

    gulp.src('index.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleanCSS()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(replace('css/colors.less', 'css/colors.css'))
        .pipe(addBuildVersion())        
        .pipe(gulp.dest(output));

    gulp.src(['settings.js', 'publishSettings.js'])
        .pipe(gulp.dest(output));

    gulp.src('css/colors.less')
        .pipe(addBuildVersion())
        .pipe(rename('colors.css'))
        .pipe(gulp.dest(output + '/css'));

    gulp.src('css/fonts.css')
        .pipe(addBuildVersion())
        .pipe(gulp.dest(output + '/css'));

    gulp.src('fonts/*')
        .pipe(gulp.dest(output + '/fonts'));

    gulp.src('css/img/**')
        .pipe(gulp.dest(output + '/css/img'));

    gulp.src(['js/require.js'])
        .pipe(gulp.dest(output + '/js'));

    gulp.src(['js/less.min.js'])
        .pipe(gulp.dest(output + '/js'));


    gulp.src('lang/*.json')
        .pipe(gulp.dest(output + '/lang'));

    gulp.src('manifest.json')
        .pipe(gulp.dest(output));

    gulp.src('preview/**')
        .pipe(gulp.dest(output + '/preview'));

    return durandal(
        {
            minify: true,
            extraModules: ['transitions/entrance']
        })
        .pipe(has({
            'release': true
        }))
        .pipe(addBuildVersion())
        .pipe(gulp.dest(output + '/app'));
});

gulp.task('build-settings', ['build-design-settings', 'build-configure-settings'], function () {
    gulp.src('settings/css/fonts/**')
        .pipe(gulp.dest(output + '/settings/css/fonts'));

    gulp.src('settings/css/img/**')
        .pipe(gulp.dest(output + '/settings/css/img'));

    gulp.src('settings/css/settings.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest(output + '/settings/css'));

    gulp.src('settings/api.js')
        .pipe(removeDebugBlocks())
        .pipe(uglify())
        .pipe(gulp.dest(output + '/settings'));

});

gulp.task('build-design-settings', ['pre-build'], function () {
    var assets = useref.assets();

    gulp.src(['settings/design/branding.html', 'settings/design/layout.html'])
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(addBuildVersion())
        .pipe(gulp.dest(output + '/settings/design'));

    gulp.src('settings/design/css/fonts/**')
        .pipe(gulp.dest(output + '/settings/design/css/fonts'));

    gulp.src('settings/design/css/design.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest(output + '/settings/design/css'));

});

gulp.task('build-configure-settings', ['pre-build'], function () {
    var assets = useref.assets();

    gulp.src(['settings/configure/configure.html'])
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(addBuildVersion())
        .pipe(gulp.dest(output + '/settings/configure'));

    gulp.src('settings/configure/img/**')
        .pipe(gulp.dest(output + '/settings/configure/img'));

    gulp.src('settings/configure/css/img/**')
        .pipe(gulp.dest(output + '/settings/configure/css/img'));

    gulp.src('settings/configure/css/fonts/**')
        .pipe(gulp.dest(output + '/settings/configure/css/fonts'));

    gulp.src('settings/configure/css/configure.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest(output + '/settings/configure/css'));

});

gulp.task('build-pdf-app', ['pre-build'], function () {
    var assets = useref.assets();

    gulp.src('pdf/index.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleanCSS()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(addBuildVersion())
        .pipe(gulp.dest(output + '/pdf'));
});

gulp.task('build-searchcontent-app', ['pre-build'], function () {
    var assets = useref.assets();

    gulp.src('searchcontent/index.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleanCSS()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(addBuildVersion())
        .pipe(gulp.dest(output + '/searchcontent'));
});

gulp.task('webserver', function () {
    gulp.src('.')
        .pipe($.webserver({
            livereload: {
                enable: true,
                filter: function (fileName) {
                    return !fileName.match(/.css/);
                }
            },
            directoryListing: true,
            open: "index.html"
        }));
});