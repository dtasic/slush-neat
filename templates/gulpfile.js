'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var livereload = require('gulp-livereload');

gulp.task('clean', function (cb) {
    require('rimraf')('dist', cb);
});

gulp.task('lint', function () {
    var jshint = require('gulp-jshint');

    return gulp.src('app/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('scss', function () {
    var sass = require('gulp-sass');

    return gulp.src('app/scss/*.scss')
        .pipe(plumber({
          errorHandler: function (err) {
            console.log(err);
            this.emit('end');
          }
        }))
        .pipe(sass({
            precision: 10
        }))
        .pipe(gulp.dest('app/css'))
        .pipe(livereload());
});

gulp.task('images', function () {
    var cache = require('gulp-cache'),
        imagemin = require('gulp-imagemin');

    return gulp.src('app/images/**/*')
        .pipe(cache(imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
    return gulp.src('app/css/fonts/*')
        .pipe(gulp.dest('dist/css/fonts'));
});

gulp.task('misc', function () {
    return gulp.src([
            'app/*.{ico,png,txt}',
            'app/.htaccess'
        ])
        .pipe(gulp.dest('dist'));
});

gulp.task('html', ['scss'], function () {
    var uglify = require('gulp-uglify'),
        minifyCss = require('gulp-minify-css'),
        useref = require('gulp-useref'),
        gulpif = require('gulp-if');

    return gulp.src('app/*.html')
		.pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('dist'));
});

gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/scss/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/scss'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('connect', function () {
	  var connect = require('connect');
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(serveStatic('app'))
        .use(serveIndex('app'));

    require('http').createServer(app)
        .listen(5000)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:5000.');
        });
});

gulp.task('default', ['scss', 'connect'], function () {
    gulp.watch('bower.json', ['wiredep']);
    livereload.listen();
    require('opn')('http://localhost:5000');

    gulp.watch('app/scss/**/*.scss', ['scss']);

    gulp.watch([
        'app/*.html',
        'app/js/**/*.js',
        'app/images/**/*'
    ]).on('change', livereload.changed);

});

gulp.task('buildall', ['lint', 'html', 'images', 'fonts', 'misc']);

gulp.task('build', ['clean'], function () {
    gulp.start('buildall');
});
