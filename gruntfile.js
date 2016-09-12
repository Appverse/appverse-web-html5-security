'use strict';

var
    autoloadGruntTasks = require('load-grunt-tasks'),
    calculateTimeSpent = require('time-grunt'),
    connectLiveReload = require('connect-livereload'),
    bowerFile = require('./bower.json'),
    serveStatic = require('serve-static'),
    LIVERELOAD_PORT = 35729,
    liveReloadSnippet = connectLiveReload({
        port: LIVERELOAD_PORT
    });


var
    configPaths = {
        src: bowerFile.appPath || 'src',
        bowerComponents: bowerFile.directory || 'bower_components',
        demo: 'demo',
        dist: 'dist',
        doc: 'doc',
        coverage: 'reports/coverage',
        testsConfig: 'config/test'
    },

    // Define files to load in the demo, ordering and the way they are
    // concatenated for distribution
    files = {
        '<%= configPaths.dist %>/appverse-security/appverse-security.js': moduleFilesToConcat('<%= configPaths.src %>/appverse-security')
    };

module.exports = function (grunt) {
    autoloadGruntTasks(grunt);
    calculateTimeSpent(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        configPaths: configPaths,

        maven: {
            options: {
                goal: 'install',
                groupId: 'org.appverse.web.framework.modules.frontend.html5',
                releaseRepository: 'url'

            },
            'install-src': {
                options: {
                    classifier: 'sources'
                },
                files: [{
                    src: ['<%= configPaths.app %>/**', '<%= configPaths.app %>/!bower_components/**'],
                    dest: ''
                }]
            },
            'install-min': {
                options: {
                    classifier: 'min'
                },
                files: [{
                    src: ['<%= configPaths.dist %>/**'],
                    dest: ''
                }]
            },
            'deploy-src': {
                options: {
                    goal: 'deploy',
                    url: '<%= releaseRepository %>',
                    repositoryId: 'my-nexus',
                    classifier: 'sources'
                },
                files: [{
                    src: ['<%= configPaths.app %>/**', '<%= configPaths.app %>/!bower_components/**'],
                    dest: ''
                }]
            },
            'deploy-min': {
                options: {
                    goal: 'deploy',
                    url: '<%= releaseRepository %>',
                    repositoryId: 'my-nexus',
                    classifier: 'min'
                },
                files: [{
                    src: ['<%= configPaths.dist %>/**'],
                    dest: ''
                }]
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
            coverage: '<%= configPaths.coverage %>/**',
            server: '.tmp',
            doc: 'doc'
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'v%VERSION%',
                commitFiles: ['package.json', 'dist'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'v%VERSION%',
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
                    open: true
                }
            },

            // For e2e tests on demo app, with coverage reporting
            e2e: {
                options: {
                    port: 9090,
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, configPaths.dist),
                            mountFolder(connect, configPaths.bowerComponents),
                            mountFolder(connect, configPaths.demo, {
                                index: 'index-dist.html'
                            }),
                        ];
                    }
                }
            },

            demoDist: {
                options: {
                    port: 9091,
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, configPaths.dist),
                            mountFolder(connect, configPaths.bowerComponents),
                            mountFolder(connect, configPaths.demo, {
                                index: 'index-dist.html'
                            }),
                        ];
                    },
                    open: true,
                    keepalive: true
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
                    return '<script src="' + path + '"></script>';
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
                configFile: '<%= configPaths.testsConfig %>/karma.unit.conf.js',
                autoWatch: true
            }
        },

        // concatenate source files
        concat: {

            // Concatenate all files for a module in a single module file
            modules: {
                files: files
            },

            // Concatenate all modules into a full distribution
            dist: {
                src: [
                    '<%= configPaths.dist %>/*/*.js',
                ],
                dest: '<%= configPaths.dist %>/appverse-html5-security.js',
            },
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= configPaths.dist %>',
                    src: ['**/*.js', '!oldieshim.js'],
                    dest: '<%= configPaths.dist %>',
                    extDot: 'last'
            }]
            }
        },

        // Uglifies already concatenated files
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - */',
                sourceMap: true,
            },
            dist: {
                files: [{
                        expand: true, // Enable dynamic expansion.
                        cwd: '<%= configPaths.dist %>', // Src matches are relative to this path.
                        src: ['**/*.js'], // Actual pattern(s) to match.
                        dest: '<%= configPaths.dist %>', // Destination path prefix.
                        ext: '.min.js', // Dest filepaths will have this extension.
                        extDot: 'last' // Extensions in filenames begin after the last dot
                    }
                ]
            }
        },

        // Jshint code checks
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
                //Show failures but do not stop the task
                force: true
            },
            all: [
                '<%= configPaths.src %>/{,*/}*.js'
            ]
        },

        // Execute commands that cannot be specified with tasks
        exec: {
            // These commands are defined in package.json for
            // automatic resoultion of any binary included in node_modules/
            protractor_start: 'npm run protractor',
            webdriver_update: 'npm run update-webdriver'
        },

        // Starts protractor webdriver
        protractor_webdriver: {
            start: {
                options: {
                    command: 'node_modules/.bin/webdriver-manager start --standalone'
                }
            }
        },
    });

    // ------ Dist task. Builds the project -----
    grunt.registerTask('default', [
        'dist'
    ]);

    grunt.registerTask('dist', [
        'jshint',
        'test',
        'dist:make'
    ]);

    grunt.registerTask('dist:make', [
        'clean:dist',
        'concat',
        'ngAnnotate',
        'uglify'
    ]);

    // ------ Demo tasks. Starts a webserver with a demo app -----
    grunt.registerTask('demo', [
        'injector:demoScripts',
        'connect:livereload',
        'watch:demoLiveReload'
    ]);

    grunt.registerTask('demo:dist', [
        'dist:make',
        'connect:demoDist'
    ]);

    // ------ Dev tasks. To be run continously while developing -----
    grunt.registerTask('dev', [
        'clean:coverage',
        'karma:unitAutoWatch'
    ]);

    // ------ Tests tasks -----
    grunt.registerTask('test', [
        'clean:coverage',
        'karma:unit'
    ]);

    grunt.registerTask('test:e2e', [
        'dist:make',
        'exec:webdriver_update',
        'connect:e2e',
        'protractor_webdriver',
        'exec:protractor_start',
    ]);


    // ------ Doc tasks -----

    grunt.registerTask('doc', [
        'clean:doc',
        'docgen'
    ]);

    grunt.registerTask('docgen', 'Generates docs', require('./config/grunt-tasks/docgen/grunt-task'));

    // ------ Other -----

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

};

/*---------------------------------------- HELPER METHODS -------------------------------------*/

function mountFolder(connect, dir, options) {
    return serveStatic(require('path').resolve(dir), options);
}

/**
 * Gets a list of all the files to load as scripts.
 *
 * @param  {object} filesObject Files object of files structured by module
 * @return {array}              Array of files
 */
function getAllFilesForDemo(filesObject) {
    var filesList = [];
    for (var key in filesObject) {
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
    moduleFolderPath = moduleFolderPath.replace(/\/+$/, '');

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
        moduleFolderPath + '/**/*.js'
    ]);
}