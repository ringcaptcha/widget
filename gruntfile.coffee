###
Define tasks.
###
module.exports = (grunt) ->

  pkg = grunt.file.readJSON('package.json');
  config = grunt.file.readJSON('config.json')
  aws = grunt.file.readJSON('aws.json')

  grunt.initConfig

    ###
    Build banner.
    ###
    banner: "/* Widget #{pkg.version} */\n"

    ###
    Compile stylesheets.
    ###
    less:
      options:
        paths: ['node_modules']
        compress: true
      compile:
        files:
          'build/resources/css/widget.css': 'resources/less/widget.less'

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
              src = '(function (jQuery) { ' + src + ' })(window.jQuery);'
            next(err, src)
        files:
          'build/bundle.js': ['index.coffee']

    ###
    Uglify compiled code.
    ###
    uglify:
      options:
        banner: "<%= banner %>"
        preserveComments: false
      build:
        files:
          'build/bundle.min.js': ['build/bundle.js']

    ###
    Copy.
    ###
    copy:
      resources:
        files: [
          { expand: true, src: ['resources/fonts/**'], dest: 'build' }
          { expand: true, src: ['resources/images/**'], dest: 'build' }
        ]
      translations:
        files: [
          { expand: true, src: ['resources/locales/**/*.json'], dest: 'build' }
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
        tasks: ['browserify:compile', 'uglify:build']
      resources:
        files: ['resources/!{scss,views}/**']
        tasks: ['copy:translations', 'copy:resources']

    ###
    Upload build files to S3
    ###
    s3:
      options:
        key: aws.key
        secret: aws.secret
        region: aws.region
        access: 'public-read'
        headers:
          'Cache-Control': 'max-age=3600'
      production:
        options:
          bucket: aws.s3.bucket
        sync: [
          src: 'build/**'
          dest: aws.s3.path
          rel: 'build'
          options:
            verify: true
        ]

    ###
    Invalidate CDN cache
    ###
    invalidate_cloudfront:
      options:
        key: aws.key,
        secret: aws.secret,
        distribution: aws.distribution
      production:
        files: [
          { expand: true, cwd: './build/', src: ['**/*'], filter: 'isFile', dest: aws.s3.path }
        ]

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-s3'
  grunt.loadNpmTasks 'grunt-invalidate-cloudfront'

  grunt.registerTask 'build', ['browserify:compile', 'uglify:build', 'copy', 'less:compile']

