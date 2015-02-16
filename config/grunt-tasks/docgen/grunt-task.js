'use strict';
var
Dgeni                = require('dgeni'),
path                 = require('canonical-path'),
bowerFile            = require('../../../bower.json'),
appverseDgeniPackage = require('./package');

/**
 * Grunt task responsible for generating documentation
 */
function generateDocsTask () {
    var done = this.async();

    // Configure our appverse-dgeni package. We can ask the Dgeni dependency injector
    // to provide us with access to services and processors that we wish to configure
    appverseDgeniPackage
        .config(setGeneralSettings)
        .config(setGithubInfo)
        .config(setVersion);

    // Create dgeni instance and generate docs
    var dgeni = new Dgeni( [appverseDgeniPackage] );
    dgeni.generate().then(finishTask);

    function finishTask(docs) {
        console.info(docs.length, 'docs generated');
        done();
    }
}

/**
 * Configures the package
 * All params are autoinjected by Dgeni
 */
function setGeneralSettings(log, readFilesProcessor, templateFinder, writeFilesProcessor) {

    // Set logging level [errors, info, debug, silly]
    log.level = 'info';

    // Specify the base path used when resolving relative paths to source and output files
    readFilesProcessor.basePath = path.resolve(__dirname, '../../..');

    // Specify collections of source files that should contain the documentation to extract
    readFilesProcessor.sourceFiles = [{
        // Process all js files in `src` and its subfolders ...
        include: ['src/**/*.js'],
        // Do not include these files
        exclude: [],
        // When calculating the relative path to these files use this as the base path.
        // So `src/foo/bar.js` will have relative path of `foo/bar.js`
        basePath: 'src'
    }];

    // Specify where the writeFilesProcessor will write our generated doc files
    writeFilesProcessor.outputFolder  =  'doc/' + bowerFile.version;
}

/**
 * Adds git data
 * All params are autoinjected by Dgeni
 */
function setGithubInfo(renderDocsProcessor) {
  renderDocsProcessor.extraData.git = {
    info: {
      owner : 'Appverse',
      repo : 'appverse-web-html5-core',
    },
    version : {
      isSnapshot : 'true'
    }
  };
}

/**
 * Adds version
 * All params are autoinjected by Dgeni
 */
function setVersion(renderDocsProcessor) {
  renderDocsProcessor.extraData.version = bowerFile.version;
}


module.exports = generateDocsTask;