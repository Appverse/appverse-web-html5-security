/*jshint expr:true */

describe('authentication service: ', function () {
    'use strict';

    var $httpBackend;

    AppInit.setConfig({
        environment: {
            SECURITY_GENERAL: {
                securityEnabled: true,
                loginURL: 'http://myserver/rest/login',
                loginHTTPMethod: 'POST',
                logoutURL: 'http://myserver/rest/logout',
                logoutHTTPMethod: 'POST',
                routes: {
                    "/admin": ["ADMIN"],
                    "/customer": ["CUSTOMER"],
                    "/profile": ["ADMIN", "CUSTOMER"]
                },
                routeDeniedRedirect: "/routeDenied",
                loginRequiredRedirect: "/login",
                error401Redirect: "/error401"
            },
            SECURITY_OAUTH: {
                scope_template: 'views/oauth_default.html'
            }
        }
    });

    beforeEach(module('appverse.security'));

    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should send login request', inject(function (AuthenticationService, SECURITY_GENERAL) {

        var promise = AuthenticationService.sendLoginRequest('admin:admin');

        $httpBackend.expect(SECURITY_GENERAL.loginHTTPMethod, SECURITY_GENERAL.loginURL).respond(200);
        $httpBackend.flush();

        promise.then.should.be.defined;
    }));

    it('should login', inject(function (AuthenticationService) {

        AuthenticationService.logOut();
        AuthenticationService.isLoggedIn().should.be.false;
        AuthenticationService.login('admin', 'ADMIN');
        AuthenticationService.isLoggedIn().should.be.true;
    }));

    it('should send logout request', inject(function (AuthenticationService, SECURITY_GENERAL) {

        var promise = AuthenticationService.sendLogoutRequest();

        $httpBackend.expect(SECURITY_GENERAL.logoutHTTPMethod, SECURITY_GENERAL.logoutURL).respond(200);
        $httpBackend.flush();

        promise.then.should.be.defined;
    }));
});
