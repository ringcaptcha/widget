###
Define tasks.
###
module.exports = (grunt) ->

  config = grunt.file.readJSON('config.json')

  grunt.initConfig

    ###
    Build banner.
    ###
    banner: "/* Widget compiled at #{new Date().toUTCString()} */\n"

    ###
    Compile stylesheets.
    ###
    compass:
      options:
        cssDir: 'dist/resources/css'
        sassDir: 'resources/scss'
        imagesDir: 'resources/images'
        fontsDir: 'resources/fonts'
        outputStyle: 'compressed'
        force: true
        importPath: ['bower_components/bootstrap-sass/assets/stylesheets', 'bower_components/bootstrap-sass/assets/stylesheets/bootstrap']
      watch:
        options:
          watch: true
      compile:
        options:
          httpPath: config.widget.cdn
          relativeAssets: false

    ###
    Compile widget.
    ###
    browserify:
      compile:
        options:
          extension: ['.coffee', '.js']
          transform: ['coffeeify', 'debowerify', 'deglobalify', 'jstify']
          external: ['jquery']
          ignore: ['underscore']
          standalone: 'RingCaptcha'
          postBundleCB: (err, src, next) ->
            if (src)
              src = src.replace('%API_ENDPOINT%', config.widget.api).replace('%CDN_ENDPOINT%', config.widget.cdn)
              src = '(function (jQuery) { ' + src + ' })(window.jQuery);'
            next(err, src)
        files:
          'dist/bundle.js': ['index.coffee']

    ###
    Uglify compiled code.
    ###
    uglify:
      options:
        banner: "<%= banner %>"
        preserveComments: false
      dist:
        files:
          'dist/bundle.min.js': ['dist/bundle.js']

    ###
    Copy.
    ###
    copy:
      resources:
        files: [
          { expand: true, src: ['resources/fonts/**'], dest: 'dist' }
          { expand: true, src: ['resources/images/**'], dest: 'dist' }
        ]
      translations:
        files: [
          { expand: true, src: ['resources/locales/**/*.json'], dest: 'dist' }
        ]
        options:
          process: (content, srcpath) ->
            jsonminify = require('jsonminify')
            return jsonminify(content)

    ###
    Watch changes.
    ###
    watch:
      options:
        atBegin: true
      coffee:
        files: ['index.coffee', 'src/**/*.coffee']
        tasks: ['browserify:compile', 'uglify:dist']
      resources:
        files: ['resources/!{scss,views}/**']
        tasks: ['copy:translations', 'copy:resources']

    ###
    Upload dist files to S3
    ###
    s3:
      options:
        key: config.aws.key
        secret: config.aws.secret
        region: config.aws.region
        access: 'public-read'
        headers:
          'Cache-Control': 'max-age=0'
      production:
        options:
          bucket: config.aws.s3.bucket
        sync: [
          src: 'dist/**'
          dest: config.aws.s3.path
          rel: 'dist'
          options:
            verify: true
        ]

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-compass'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-s3'

  grunt.registerTask 'build', ['browserify:compile', 'uglify:dist', 'copy', 'compass:compile']

