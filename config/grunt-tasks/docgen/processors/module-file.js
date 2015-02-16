'use strict';

var _ = require('lodash');

/**
 * @dgProcessor moduleFileProcessor
 * @description
 * Compute the name of the module file
 */
module.exports = function moduleFileProcessor() {
  return {
    $runAfter: ['ids-computed', 'memberDocsProcessor'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {

      // Compute some extra fields for docs in the API area
      _.forEach(docs, function(doc) {

        if ( doc.docType === 'module' ) {

          if ( !doc.moduleFile ) {
            var match = /^appverse\.(.*)/.exec(doc.name);
            if (match) {
              doc.moduleFile = 'appverse-' + match[1].toLowerCase();
            }
            else {
              doc.moduleFile = doc.name;
            }
            doc.moduleFile +=  '.js';
          }
        }
      });

    }
  };
};
