'use strict';

var _ = require('lodash');

/**
 * @dgProcessor moduleFileProcessor
 * @description
 * Compute the name of the bower package where the doc is located
 */
module.exports = function packageNameProcessor() {
  return {
    packageName : null,
    $runAfter: ['ids-computed', 'memberDocsProcessor'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {
      var self = this;
      // Compute some extra fields for docs in the API area
      _.forEach(docs, function(doc) {
        // If no doc.packageName set, use default
        if (!doc.packageName) {
          doc.packageName = self.packageName;
        }
      });
    }
  };
};
