"use strict";

var ncp = require('ncp').ncp,
path    = require('canonical-path'),
Promise = require('promise');


/**
 * Copy statict assets to the destination directory
 */
module.exports = function copyAssetsProcessor(log, readFilesProcessor, writeFilesProcessor) {
  return {
    source: null,
    destination: null,
    $validate: {
      source: { presence: true },
      destination: { presence: true },
    },
    $runAfter:['writing-files'],
    $runBefore: ['files-written'],
    $process: function(docs) {
      var source = path.resolve(readFilesProcessor.basePath, this.source);
      var destination = path.resolve(writeFilesProcessor.outputFolder, this.destination);

      return new Promise(function (fulfill, reject) {
        ncp(source, destination, function (err) {
          if (err) {
            reject(err);
            return log.error(err);
          }
          log.debug('assets copied');
          fulfill(docs);
        });
      });

    }
  };
};