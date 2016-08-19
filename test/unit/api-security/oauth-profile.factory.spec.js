/*jshint expr:true */

var pagesPath = '../src/appverse-security';

describe('Oauth_Profile factory: ', function() {
    'use strict';

    describe('when rendering the directive', function() {


        var rootScope, oauth_Profile, oauth_RequestWrapper, $compile,
            $location, $rootScope;

        var directiveHtml = '' +
            '<oauth ng-cloak' +
            '   site="http://myoauthserver.com"' +
            '   client="e72c43c75adc9665e4d4c13354c41f337d5a2e439d3da1243bb47e39745f435c"' +
            '   redirect="http://localhost:9000"' +
            '   scope="resources"' +
            '   profile="http://myoauthserver.com/me"' +
            '   storage="cookies">Sign In' +
            '</oauth>';

        beforeEach(module('appverse.cache'));
        beforeEach(module('appverse.security'));

        beforeEach(inject(function(Oauth_Profile, Oauth_RequestWrapper, _$rootScope_, _$compile_, _$location_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            oauth_Profile = Oauth_Profile;
            oauth_RequestWrapper = Oauth_RequestWrapper;
        }));
        /*
        it('should contain a Oauth_Endpoint service', function() {
            expect(oauth_Profile).to.be.an.object;
        });
*/
    });

});
