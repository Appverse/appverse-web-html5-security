'use strict';
var
path    = require('canonical-path'),
Package = require('dgeni').Package;

// Create and export a new Dgeni package called appverse-dgeni. This package depends upon
// the jsdoc and nunjucks packages defined in the dgeni-packages npm module.
module.exports = new Package('appverse-dgeni', [
  require('dgeni-packages/ngdoc'),
  require('dgeni-packages/nunjucks')
])
// override ngdocs getLinkInfo
.factory(require('./services/getLinkInfo'))

// Require processors
.processor(require('./processors/index-generate'))
.processor(require('./processors/copy-assets'))
.processor(require('./processors/module-file'))
.processor(require('./processors/package-name'))

// Configure template ids
.config(function(computeIdsProcessor, createDocMessage, getAliases) {
  computeIdsProcessor.idTemplates.push({
    docTypes: ['controller', 'provider', 'service', 'directive', 'input', 'object', 'function', 'filter', 'type' ],
    idTemplate: 'module:${module}.${docType}:${name}',
    getAliases: getAliases
  });
})

// Configure bower package name
.config(function(packageNameProcessor) {
  packageNameProcessor.packageName = 'appverse-web-html5-core';
})

// Configure paths for documentation assets (css, images...)
.config(function(copyAssetsProcessor, createDocMessage) {
    copyAssetsProcessor.source = path.resolve(__dirname, 'templates/assets');
    // This is relative to the docs' outputPath
    copyAssetsProcessor.destination = 'assets';
})

// Configure paths
.config(function(computePathsProcessor, createDocMessage) {
  computePathsProcessor.pathTemplates = [];
  computePathsProcessor.pathTemplates.push({
    docTypes: ['controller', 'provider', 'service', 'directive', 'input', 'object', 'function', 'filter', 'type' ],
    pathTemplate: '${area}/${module}/${docType}/${name}',
    outputPathTemplate: '${module}-${docType}-${name}.html'
  });
  computePathsProcessor.pathTemplates.push({
    docTypes: ['module' ],
    pathTemplate: '${area}/${name}',
    outputPathTemplate: '${module}-index.html'
  });
  computePathsProcessor.pathTemplates.push({
    docTypes: ['componentGroup' ],
    pathTemplate: '${area}/${moduleName}/${groupType}',
    outputPathTemplate: '${moduleName}-${groupType}-index.html'
  });
  // Sets the template paths for the main file index.html
  computePathsProcessor.pathTemplates.push({
    docTypes: ['index'],
    pathTemplate: 'index',
    outputPathTemplate: 'index.html'
  });
})


// Configure our appverse-dgeni package. We can ask the Dgeni dependency injector
// to provide us with access to services and processors that we wish to configure
.config(function(templateFinder, computeIdsProcessor, getAliases) {

  // Set the template for the main index file
  computeIdsProcessor.idTemplates.push({
    docTypes: ['index'],
    idTemplate: 'index',
    getAliases: getAliases
  });


  // Add a folder to search for our own templates to use when rendering docs
  templateFinder.templateFolders.unshift(path.resolve(__dirname, 'templates'));
});