'use strict';

var settings = {

    basePath: '../../',

    frameworks: ['mocha', 'chai', 'sinon'],

    commonFiles: [
        'bower_components/angular/angular.js',
        'bower_components/angular-cache/dist/angular-cache.js',
        'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
        'bower_components/angular-translate/angular-translate.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/lodash/lodash.js',
        'bower_components/appverse-web-html5-core/dist/appverse/appverse.min.js',
        'bower_components/appverse-web-html5-core/dist/appverse-utils/appverse-utils.min.js',
        'bower_components/appverse-web-html5-core/dist/appverse-router/appverse-router.min.js',
        'bower_components/appverse-web-html5-core/dist/appverse-cache/appverse-cache.min.js',
        'bower_components/appverse-web-html5-core/dist/appverse-logging/appverse-logging.js',
        'bower_components/appverse-web-html5-core/dist/appverse-detection/appverse-detection.js',
        'bower_components/appverse-web-html5-core/dist/appverse-translate/appverse-translate.min.js',
        'bower_components/classie/classie.js',
        'bower_components/appverse-web-html5-core/dist/**/*.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-resource/angular-resource.js',
        'node_modules/phantomjs-polyfill/bind-polyfill.js',


        'src/appverse-*/**/module.js',
        // The rest
        'src/appverse-*/**/*.js',
    ],

    unitFiles: [
        'test/unit/**/*.js',
        'node_modules/phantomjs-polyfill/bind-polyfill.js',
    ],

    midwayFiles: [],

    plugins: ['karma-jasmine', 'karma-phantomjs-launcher'],


};


function Configurator() {
    this._files = [];
    this.basePath = settings.basePath;
    this.frameworks = settings.frameworks;
}

Configurator.prototype.filesForUnitTests = function() {
    return this.withCommonFiles().files(settings.unitFiles);
};

Configurator.prototype.filesForMidwayTests = function() {
    return this.withCommonFiles().files(settings.midwayFiles);
};

Configurator.prototype.withCommonFiles = function() {
    this._files = settings.commonFiles;
    return this;
};

Configurator.prototype.files = function(specificFiles) {
    return this._files.concat(specificFiles);
};

module.exports = new Configurator();
