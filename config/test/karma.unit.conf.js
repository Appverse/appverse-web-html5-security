'use strict';

module.exports = function (config) {

    config.set({

        basePath: '../../',

        frameworks: ['mocha', 'chai', 'sinon'],

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-cookies/angular-cookies.min.js',
            'bower_components/angular-resource/angular-resource.min.js',
            'bower_components/lodash/lodash.min.js',

            'bower_components/appverse-web-html5-core/dist/appverse/appverse.js',
            'bower_components/appverse-web-html5-core/dist/appverse-utils/appverse-utils.js',

            'bower_components/angular-cache/dist/angular-cache.js',
            'bower_components/appverse-web-html5-core/dist/appverse-cache/appverse-cache.js',

            'bower_components/angular-mocks/angular-mocks.js',
            'src/appverse-*/**/module.js',
            // The rest
            'src/appverse-*/**/*.js',

            'test/unit/**/*.js'
        ],

        browsers: ['PhantomJS'],

        reporters: ['progress', 'coverage', 'notify', 'junit'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/appverse-*/*.js': ['coverage']
        },

        coverageReporter: {
            // specify a common output directory
            dir: 'reports/coverage/unit',
            reporters: [
                // reporters not supporting the `file` property
                {
                    type: 'html'
            },
                {
                    type: 'clover'
            },

            ]
        },

        junitReporter: {
            outputDir: 'reports/junit',
            outputFile: 'unit-test-results.xml',
            useBrowserName: false
        }
    });
};
