'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'src',
        dist: 'dist',
        doc: 'doc'
    };

    try {
        yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
    } catch (e) {}

    grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		yeoman: yeomanConfig,
		maven: {
			options: {
                goal:'install',
				groupId: 'org.appverse.web.framework.modules.frontend.html5',
				releaseRepository: 'url'

			},
			'install-src': {
				options: {
					classifier: 'sources'
				},
				files: [{src: ['<%= yeoman.app %>/**','<%= yeoman.app %>/!bower_components/**'], dest: ''}]
			},
			'install-min': {
				options: {
					classifier: 'min'
				},
				files: [{src: ['<%= yeoman.dist %>/**'], dest: ''}]
			},
			'deploy-src': {
				options: {
					goal:'deploy',
					url: '<%= releaseRepository %>',
					repositoryId: 'my-nexus',
					classifier: 'sources'
				},
				files: [{src: ['<%= yeoman.app %>/**','<%= yeoman.app %>/!bower_components/**'], dest: ''}]
			},
			'deploy-min': {
				options: {
					goal:'deploy',
					url: '<%= releaseRepository %>',
					repositoryId: 'my-nexus',
					classifier: 'min'
				},
				files: [{src: ['<%= yeoman.dist %>/**'], dest: ''}]
			}
		},

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/**',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp',
			docular: 'doc'
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/{,*/}*.js'
            ]
        },

        uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - */'
			},
            dist: {
				files: {
					'<%= yeoman.dist %>/modules/api-security.min.js':['<%= yeoman.app %>/modules/api-security.js'],
					'<%= yeoman.dist %>/directives/oauth-directives.min.js':['<%= yeoman.app %>/directives/oauth-directives.js'],
                }
            }
        },



        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        bump: {
            options: {
              files: ['package.json', 'bower.json'],
              updateConfigs: [],
              commit: true,
              commitMessage: 'Release v%VERSION%',
              commitFiles: ['package.json','bower.json'],
              createTag: true,
              tagName: 'v%VERSION%',
              tagMessage: 'Version %VERSION%',
              push: true,
              pushTo: 'origin',
              gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },

		// Unit tests.
		nodeunit: {
			tests: ['test/**/*_test.js']
		}
    });

    grunt.registerTask('doc', [
		'clean:docular',
        'docular'
    ]);

	grunt.registerTask('test',[
		'jshint',
		'clean',
		'nodeunit'
	]);

    grunt.registerTask('dist', [
        'clean:dist',
        'ngAnnotate',
        'uglify'
    ]);

    grunt.registerTask('install', [
        'clean',
		'maven:install-src',
		'dist',
        'maven:install-min'
    ]);

	grunt.registerTask('deploy', [
        'clean',
		'maven:deploy-src',
		'dist',
        'maven:deploy-min'
    ]);

    grunt.registerTask('default', [
        'dist'
    ]);
};