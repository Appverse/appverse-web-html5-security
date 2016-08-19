/*jshint expr:true */

var pagesPath = '../src/appverse-security';

describe('AuthenticationService service: ', function() {
    'use strict';

    describe('when rendering the directive', function() {

        var authenticationService, $compile, $location, $rootScope;

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

        beforeEach(inject(function(AuthenticationService, _$rootScope_, _$compile_, _$location_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            authenticationService = AuthenticationService;
        }));

        it('should contain a AuthenticationService service', function() {
            expect(authenticationService).to.be.an.object;
        });

    });

});
