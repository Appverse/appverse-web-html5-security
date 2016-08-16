/*jshint expr:true */

describe('OAuth Directive: ', function() { 'use strict';

    describe('when rendering the directive', function() {

        var $compile;
        var $rootScope;

        var directiveHtml = '' +
            '<oauth ng-cloak' +
            '   site="http://myoauthserver.com"' +
            '   client="e72c43c75adc9665e4d4c13354c41f337d5a2e439d3da1243bb47e39745f435c"' +
            '   redirect="http://localhost:9000"' +
            '   scope="resources"' +
            '   profile="http://myoauthserver.com/me"' +
            '   storage="cookies">Sign In' +
            '</oauth>';

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function(_$compile_, _$rootScope_){
          // The injector unwraps the underscores (_) from around the parameter names when matching
          $compile = _$compile_;
          $rootScope = _$rootScope_;
        }));

        it('should show a sign in button', function() {
            // Compile a piece of HTML containing the directive
            var element = $compile(directiveHtml)($rootScope);
            // fire all the watches, so text is evaluated
            $rootScope.$digest();
            // Check that the compiled element contains the templated content
            element.html().should.be.equal('Sign In');
        });

    });

});
