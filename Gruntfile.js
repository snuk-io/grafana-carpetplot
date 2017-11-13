module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);

  // make access of version variable available
  var pkgJson = require('./package.json');

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-exec')

  grunt.initConfig({

    clean: ['dist'],

    // get version appendix from buildinfo.sh
    exec: {
      getVersionAppendix: {
        cmd: './build-scripts/buildinfo.sh version_appendix',
        callback: function (err, stdout, stderr, cb) {
            grunt.config.set('version_appendix', stdout.replace('\n', ''));
          }
      },
      getBuildtime: {
        cmd: './build-scripts/buildinfo.sh time',
        callback: function (err, stdout, stderr, cb) {
            grunt.config.set('build_time', stdout.replace('\n', ''));
          }
      },
    },

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.scss', '!img/**/*'],
        dest: 'dist'
      },
      versionFile: {
        src: 'plugin.json',
        dest: 'dist/plugin.json',
        options: {
          process: function (content, srcpath) {
            // construct the template variables used in plugin.json
            var buildInfo = { 
              version_string : pkgJson.version + grunt.config.get('version_appendix'),
              build_time: grunt.config.get('build_time')
            };
            content = grunt.template.process(content, {data: buildInfo})
            return content;
          },
        },
      },
      pluginDef: {
        expand: true,
        src: ['README.md'],
        dest: 'dist',
      },
      img_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['img/**/*'],
        dest: 'dist/src/'
      },
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'plugin.json'],
        tasks: ['default'],
        options: {
          spawn: false,
          livereload: true
        }
      },
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-systemjs', 'transform-es2015-for-of', 'transform-class-properties', 'transform-object-rest-spread'],
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['*.js', '**/*.js'],
          dest: 'dist',
          ext: '.js'
        }]
      },
    },

    sass: {
      dist: {
        files: {
          'dist/css/carpet-plot.css': 'src/css/carpet-plot.scss'
        }
      }
    }

  });

  grunt.registerTask('default', ['clean', 'exec', 'copy', 'babel', 'sass']);
//  grunt.registerTask('default', ['clean', 'copy:src_to_dist', 'copy:pluginDef', 'copy:img_to_dist', 'babel', 'sass']);
  // grunt.registerTask('clean', ['clean']);
  // grunt.registerTask('watch', ['watch']);
};
