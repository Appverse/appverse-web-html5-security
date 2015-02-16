// change from https://github.com/angular/dgeni-packages/blob/master/ngdoc/inline-tag-defs/link.js
var INLINE_LINK = /(\S+)(?:\s+([\s\S]+))?/;

module.exports = function linkInlineTagDef(getLinkInfo, createDocMessage) {
  return {
    name: 'link',
    handler: function(doc, tagName, tagDescription) {

      // Parse out the uri and title
      return tagDescription.replace(INLINE_LINK, function(match, uri, title) {

        var linkInfo = getLinkInfo(uri, title, doc);

        if ( !linkInfo.valid ) {
          return linkInfo.title;
        }

        return '(' + linkInfo.title + ')[' + linkInfo.url + ']';
      });
    }
  };
};