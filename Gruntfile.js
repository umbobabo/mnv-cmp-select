module.exports = function(grunt) {
  var fs = require('fs');
  // Project configuration.
  grunt.initConfig({
    name: grunt.file.readJSON('bower.json').name,
    useminPrepare: {
      html: 'partials/widgethead.handlebars'
    },
    githooks: {
      all: {
        'pre-commit': 'jshint'
      }
    },
    shell: {
      listFolders: {
        options: {
          stdout: true
        },
        command: 'git init'
      }
    },
    watch: {
      scripts: {
        files: 'js/*.js'
      },
      sass: {
        files: ['css/sass/**/*.{scss,sass}',  '../../css/editorial.scss'],
        tasks: ['sass:dev']
      },
      handlebars: {
        files: ['js/tpl/handlebars/*.handlebars'],
        tasks: ['handlebars']
      }
    },
    concat: {
      dist: {
        src: ['js/css.js', 'dist/js/<%= name %>.min.js'],
        dest: 'dist/js/<%= name %>.min.js',
      }
    },
    uglify: {
      options: {
        mangle: {
          except: ['mnv']
        }
      }
    },
    sass: {
      dist: {
        options: {
          outputStyle: [
            'compressed'
          ],
          includePaths: [
            './bower_components/sass-list-maps'
          ]
        },
        files: {
          'css/style.css': 'css/sass/style.scss'
        }
      },
      dev: {
        files: {
          'css/style.css': 'css/sass/style.scss'
        }
      }
    },
    browserSync: {
        dev: {
            bsFiles: {
              src : ['css/style.css', 'js/*.*', 'public/*.*', 'partials/*.*' ]
            },
            options: {
              watchTask: true // < VERY important
            }
        }
    },
    jshint: {
      files: ['js/init.js'],
      options: {
        camelcase: true,
        curly:   true,
        eqeqeq:  true,
        forin: true,
        immed:   true,
        latedef: true,
        newcap:  true,
        noarg:   true,
        sub:     true,
        undef:   true,
        boss:    true,
        eqnull:  true,
        browser: true,
        strict: true,
        trailing: true,

        globals: {
          // AMD
          module:     true,
          require:    true,
          requirejs:  true,
          define:     true,
          Handlebars: true,
          mnv: true,

          // Environments
          console:    true,

          // General Purpose Libraries
          $:          true,
          jQuery:     true,
          sinon:      true,
          describe:   true,
          it:         true,
          expect:     true,
          beforeEach: true,
          afterEach:  true
        }
      }
    },
    handlebars: {
      all: {
        files: {
            'js/tpl/template.js': 'js/tpl/handlebars/*.handlebars'
        }
      }
    },
    jasmine: {
      src: ['js/*.js', '../../js/*.js', '!dist/js/<%= name %>.min.js'],
      options: {
        specs: ['js/tests/*tests.js', '../../js/tests/*tests.js'],
        vendor: ['https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js']
      }
    },
    csstojs: {
      target: ['css/style.css', 'js/css.js']
    },
    robFix: {
      target: ['dist/js/<%= name %>.min.js']
    },
    CopyInit: {
      target: ['js/init.js', 'dist/js/<%= name %>.js']
    }
  });

  // Convert css into js
  grunt.registerMultiTask('csstojs', 'Convert CSS to JS.', function() {
    var cssPath = this.data[0];
    jsPath = this.data[1];

    grunt.log.writeln("Starting conversion...");
    var css = fs.readFileSync(cssPath).toString();

    if(!css) {
      grunt.log.writeln("The css file is empty, nothing to convert.");
      return false;
    }
    var cssStr = css.split("\n").map(function(l){return '"' + l + '\\n"';}).join(" + \n");
    var js = "(function() { var css = " + cssStr + ", head = document.getElementsByTagName('head')[0], style = document.createElement('style'); style.setAttribute('type', 'text/css'); var nodeStyle = document.createTextNode(css); if(style.styleSheet){ style.styleSheet.cssText = nodeStyle.toString();}else{ style.appendChild(nodeStyle); }; head.appendChild(style);})();";

    grunt.log.writeln("Conversion completed, js file created.");
    fs.writeFileSync(jsPath, js);
    return true;
  });

  grunt.registerMultiTask('CopyInit', 'Copy init.js to a specific folder', function() {
      var dataFile = this.data[0];
      var targetFiles = this.data[1];

      grunt.log.writeln("Starting file reading " + dataFile + "...");
      try {
        var data = fs.readFileSync(dataFile).toString();
      } catch (err) {
        grunt.log.writeln("An error occured on reading the file " + dataFile + ": " + err);
        return false;
      }

      grunt.log.writeln("Try writing " + targetFiles);
      try {
        fs.writeFileSync(targetFiles, data);
        grunt.log.writeln("Writed " + targetFiles);
      } catch (err) {
        grunt.log.writeln("An error occured on saving file: " + targetFiles + " " + err);
        return false;
      }

      return true;
    });
  // Rob fix
  // This check prevent a problem verified on IE with the minified file
  // Check for this string "c.styleSheet?c.styleSheet.cssText=d.toString():c.appendChild(d)," on the init.min.js
  // and replace with this "c.styleSheet?c.styleSheet.cssText=a:c.appendChild(d),"
  grunt.registerMultiTask('robFix', 'Apply Rob Fix for IE issue on uglified file', function() {
    var target = this.data[0];

    grunt.log.writeln("Starting fix file " + target + "...");
    try {
      var initMin = fs.readFileSync(target).toString();
    } catch (err) {
      grunt.log.writeln("An error occured on reading the file " + target + ": " + err);
      return false;
    }

    grunt.log.writeln("File readed...");
    //grunt.log.writeln(initMin);

    var before = initMin;
    initMin.replace('c.styleSheet?c.styleSheet.cssText=d.toString():c.appendChild(d),', 'c.styleSheet?c.styleSheet.cssText=a:c.appendChild(d),');
    if(initMin===before){
      grunt.log.writeln("No string replaced, nothing changed.");
    } else {
      grunt.log.writeln("String replaced");
      try {
        fs.writeFileSync(target, initMin);
      } catch (err) {
          grunt.log.writeln("An error occured on saving file:" + err);
          return false;
      }
      grunt.log.writeln("Rob Fix applied with success.");
    }
    return true;
  });

  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.loadNpmTasks('grunt-handlebars-compiler');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-usemin');

  // Compile sass and handlebars on the fly.
  grunt.registerTask('default', ['sass:dev', 'handlebars', 'browserSync', 'watch']);

   // Unit tests.
  grunt.registerTask('test', ['jasmine']);

  // Unit tests.
  //'jasmine',
  grunt.registerTask('getready', ['jshint']);

  // Git tasks.
  grunt.registerTask('git', ['shell', 'githooks']);

  // Run this task when the code is ready for production.
  grunt.registerTask('production', ['sass:dist',  'csstojs', 'useminPrepare', 'concat', 'concat:dist', 'uglify', 'robFix', 'CopyInit']);

};