'use strict';

var
autoloadGruntTasks = require('load-grunt-tasks'),
calculateTimeSpent = require('time-grunt'),
connectLiveReload  = require('connect-livereload'),
bowerJson          = require('./bower.json'),
LIVERELOAD_PORT    = 35729,
liveReloadSnippet  = connectLiveReload({port: LIVERELOAD_PORT});

var
configPaths = {
    src: bowerJson.appPath || 'src',
    bowerComponents : bowerJson.directory || 'bower_components',
    demo : 'demo',
    dist: 'dist',
    doc: 'doc',
    coverage: 'reports/coverage',
    testsConfig : 'config/test'
},

// Define files to load in the demo, ordering and the way they are
// concatenated for distribution
files = {
    '<%= configPaths.dist %>/api-security/api-security.js':
    moduleFilesToConcat('<%= configPaths.src %>/api-security')
};

module.exports = function (grunt) {
    autoloadGruntTasks(grunt);
    calculateTimeSpent(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        configPaths: configPaths,

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
                files: [{src: ['<%= configPaths.app %>/**','<%= configPaths.app %>/!bower_components/**'], dest: ''}]
            },
            'install-min': {
                options: {
                    classifier: 'min'
                },
                files: [{src: ['<%= configPaths.dist %>/**'], dest: ''}]
            },
            'deploy-src': {
                options: {
                    goal:'deploy',
                    url: '<%= releaseRepository %>',
                    repositoryId: 'my-nexus',
                    classifier: 'sources'
                },
                files: [{src: ['<%= configPaths.app %>/**','<%= configPaths.app %>/!bower_components/**'], dest: ''}]
            },
            'deploy-min': {
                options: {
                    goal:'deploy',
                    url: '<%= releaseRepository %>',
                    repositoryId: 'my-nexus',
                    classifier: 'min'
                },
                files: [{src: ['<%= configPaths.dist %>/**'], dest: ''}]
            }
        },

        // Cleaning tasks
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= configPaths.dist %>/**',
                        '!<%= configPaths.dist %>/.git*'
                    ]
                }]
            },
            coverage : '<%= configPaths.coverage %>/**',
            server: '.tmp',
            docular: 'doc'
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= configPaths.app %>/{,*/}*.js'
            ]
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - */'
            },
            dist: {
                files: {
                    '<%= configPaths.dist %>/modules/api-security.min.js':['<%= configPaths.app %>/modules/api-security.js'],
                    '<%= configPaths.dist %>/directives/oauth-directives.min.js':['<%= configPaths.app %>/directives/oauth-directives.js'],
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

        // Web server
        connect: {
            // General options
            options: {
                protocol: 'http',
                port: 9000,
                hostname: 'localhost'
            },

            // For demo app in chrome
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            liveReloadSnippet,
                            mountFolder(connect, configPaths.src),
                            mountFolder(connect, configPaths.bowerComponents),
                            mountFolder(connect, configPaths.demo),
                        ];
                    },
                    open : true
                }
            },
        },

        // Watch files changes and perform actions
        watch: {
            // Watch files to reload demo
            demoLiveReload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                tasks: ['injector:demoScripts'],
                files: [
                    '<%= configPaths.demo %>/**/*',
                    //For performance reasons only match one level
                    '<%= configPaths.src %>/{,*/}*.js',
                ],
            }
        },

        // Automatically include all src/ files in demo's html as script tags
        injector: {
            options: {
                relative: false,
                transform: function (path) {
                    // Demo server directly mounts src folder so the reference to src is not required
                    path = path.replace('/src/', '');
                    return '<script src="'+ path +'"></script>';
                }
            },
            demoScripts: {
                files: {
                    '<%= configPaths.demo %>/index.html': getAllFilesForDemo(files) // ['src/**/*.js'],
                }
            }
        },

        // Karma Test runner
        karma: {
            unit: {
                configFile: '<%= configPaths.testsConfig %>/karma.unit.conf.js',
                autoWatch: false,
                singleRun: true
            },
            unitAutoWatch: {
                configFile: '<%= configPaths.testsConfig %>/karma.unit.watch.conf.js',
                autoWatch: true
            }
        }
    });

    // ------ Demo tasks. Starts a webserver with a demo app -----

    grunt.registerTask('demo', [
        'injector:demoScripts',
        'connect:livereload',
        'watch:demoLiveReload'
    ]);

    // ------ Dev tasks. To be run continously while developing -----

    grunt.registerTask('dev', [
        // For now, only execute unit tests when a file changes?
        // midway and e2e are slow and do not give innmedate
        // feedback after a change
        'test:unit:watch'
    ]);


    // ------ Tests tasks -----

    grunt.registerTask('test', [
        'test:all'
    ]);

    grunt.registerTask('test:all', [
        'clean:coverage',
        'karma:unit'
    ]);

    grunt.registerTask('unit', [
        'test:unit:once'
    ]);

    grunt.registerTask('test:unit:watch', [
        'karma:unitAutoWatch'
    ]);

    grunt.registerTask('test:unit:once', [
        'karma:unit'
    ]);


    grunt.registerTask('doc', [
        'clean:docular',
        'docular'
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

/*---------------------------------------- HELPER METHODS -------------------------------------*/

function mountFolder (connect, dir, options) {
    return connect.static(require('path').resolve(dir), options);
}

/**
 * Gets a list of all the files to load as scripts.
 *
 * @param  {object} filesObject Files object of files structured by module
 * @return {array}              Array of files
 */
function getAllFilesForDemo(filesObject) {
    var filesList = [];
    for( var key in filesObject ) {
        if (filesObject.hasOwnProperty(key)) {
           filesList = filesList.concat(filesObject[key]);
        }
    }
    return filesList;
}

/**
 * Specify concat order to concant files from the same
 * module into a single module file
 *
 * @param  {string} moduleFolderPath
 * @param  {array} filesAfterModule Files to concat inmediately after the module
 * @return {array}                  List of files to concat
 */
function moduleFilesToConcat(moduleFolderPath, filesAfterModule) {

    //Remove trailing slash
    moduleFolderPath =  moduleFolderPath.replace(/\/+$/, '');

    // Files using the same module are concatenated in the correct order:
    // · 1st, module.js files are loaded as these are the ones that create the module
    // · 2nd, provider.js files containing are loaded. This is because some modules use their own
    // providers in their config block. Because of this, providers must be loaded prior to config blocks.
    // · 3rd, rest of files
    var files = [moduleFolderPath + '/module.js'];

    if (typeof filesAfterModule === 'object') {
        files = files.concat(filesAfterModule);
    }

    return files.concat([
        moduleFolderPath + '/**/*.provider.js',
        moduleFolderPath +'/**/*.js'
    ]);
}
