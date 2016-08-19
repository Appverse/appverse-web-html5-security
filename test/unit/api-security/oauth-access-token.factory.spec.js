/*jshint expr:true */

var pagesPath = '../src/appverse-security';

describe('Oauth_AccessToken factory: ', function() {
    'use strict';

    describe('when rendering the directive', function() {

        var oauth_AccessToken, oauthAccessTokenFactory, $compile, $location, $rootScope;

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

        beforeEach(inject(function(Oauth_AccessToken, _$rootScope_, _$compile_, _$location_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            oauth_AccessToken = Oauth_AccessToken;
        }));

        it('should contain a Oauth_AccessToken service', function() {
            expect(oauth_AccessToken).to.be.an.object;
        });

        /*
        it('should contain a Oauth_AccessToken service', function() {
            var hash = "http://localhost:9000/index.html?response_type=token&access_token=e72c43c75adc9665e4d4c13354c41f337d5a2e439d3da1243bb47e39745f435c&redirect_uri=http://localhost:9000&scope=resources";
            expect(oauth_AccessToken.removeFragment(hash)).to.be.an.object;

            //removeFragment(hash);
            //expect($location.hash()).to.be.equal('http://localhost:9000/index.html?access_token=e72c43c75adc9665e4d4c13354c41f337d5a2e439d3da1243bb47e39745f435c');
        });
        */
    });

});
