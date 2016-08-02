'use strict';

var settings = {

    basePath : '../../',

    frameworks: ['mocha', 'chai', 'sinon'],

    commonFiles : [
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'src/appverse-*/**/module.js',
        // The rest
        'src/appverse-*/**/*.js',
    ],

    unitFiles : [
        'test/unit/**/*.js'
    ],

    midwayFiles : [ ],

    plugins : ['karma-jasmine', 'karma-phantomjs-launcher']

};


function Configurator () {
    this._files = [];
    this.basePath = settings.basePath;
    this.frameworks = settings.frameworks;
}

Configurator.prototype.filesForUnitTests = function () {
    return this.withCommonFiles().files(settings.unitFiles);
};

Configurator.prototype.filesForMidwayTests = function () {
    return this.withCommonFiles().files(settings.midwayFiles);
};

Configurator.prototype.withCommonFiles = function () {
    this._files = settings.commonFiles;
    return this;
};

Configurator.prototype.files = function (specificFiles) {
    return this._files.concat(specificFiles);
};

module.exports = new Configurator();
