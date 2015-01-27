'use strict';

var settings = require('./common/karma.conf');

module.exports = function(config) {

    config.set({

        basePath : settings.basePath,

        files : settings.filesForUnitTests(),

        frameworks: settings.frameworks,

        reporters: ['progress', 'notify'],

        browsers : ['PhantomJS'],

        autoWatch : true,
    });

};