"use strict";

/**
 * Generates an index file for the docs
 */
module.exports = function indexGenerateProcessor(moduleMap) {
  return {
    deployments: [],
    $validate: {},
    $runAfter: ['adding-extra-docs'],
    $runBefore: ['extra-docs-added'],
    $process: function(docs) {
      var modules = [];

      docs.forEach(function(doc) {
        if (doc.docType === 'module') {
          modules.push(doc);
        }
      });

      docs.push(createIndex(modules));
    }
  };
};

/**
 * Creates the index file
 * @param  {array} modules List of modules
 * @return {object}         The index file
 */
function createIndex(modules) {
  return {
    docType: 'index',
    id: 'index',
    template: 'index.template.js',
    modules: modules
  };
}