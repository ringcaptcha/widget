browserify = require 'browserify'
buffer = require 'vinyl-buffer'
cssminify = require('gulp-minify-css');
footer = require 'gulp-footer'
gulp = require 'gulp'
header = require 'gulp-header'
jsonminify = require 'gulp-jsonminify'
less = require 'gulp-less'
source = require 'vinyl-source-stream'
uglify = require 'gulp-uglify'
config = require './config.json'

options =
  scripts:
    source: './index.coffee'
    extensions: ['.coffee', '.hbs']
    namespace: 'RingCaptcha'
    destination: 'build/'
    filename: 'bundle.min.js'
  styles:
    paths: ['node_modules']
  assets:
    source: 'resources/{images,fonts}/**'
    destination: 'build/resources'

gulp.task 'assets', ->
  gulp.src(options.assets.source)
    .pipe(gulp.dest(options.assets.destination))

gulp.task 'locales', ->
  gulp.src('resources/locales/**/messages.json')
    .pipe(jsonminify())
    .pipe(gulp.dest('build/resources/locales'))

gulp.task 'styles', ->
  gulp.src('resources/less/widget.less')
    .pipe(less(options.styles))
    .pipe(cssminify())
    .pipe(gulp.dest('build/resources/css'))

gulp.task 'build', ['styles', 'assets', 'locales'], ->

  bundle = browserify
    entries: [options.scripts.source]
    extensions: options.scripts.extensions
    standalone: options.scripts.namespace

  stream = bundle.bundle()
    .pipe source options.scripts.filename
    .pipe(buffer())
    .pipe(header('(function (jQuery) {'))
    .pipe(footer('})(window.jQuery);'))

  stream.pipe uglify() if not config.debug

  stream
    .pipe gulp.dest options.scripts.destination

gulp.task 'default', ['build']
