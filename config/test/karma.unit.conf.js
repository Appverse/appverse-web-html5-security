'use strict';

var settings = require('./common/karma.conf');
require('phantomjs-polyfill');

module.exports = function(config) {

    config.set({

        basePath : settings.basePath,

        files : settings.filesForUnitTests(),

        frameworks: settings.frameworks,

        browsers : ['PhantomJS'],

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
                { type: 'html'},
                { type: 'clover'},

            ]
        },

        junitReporter: {
          outputFile: 'reports/junit/unit-test-results.xml',
          suite: ''
        }
    });

};
