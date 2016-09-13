/*jshint expr:true */

describe('appverse.security module with appverse.cache: ', function () {
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

    beforeEach(module('appverse.cache'));
    beforeEach(module('appverse.security'));

    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should use appverse.cache', inject(function (avCacheFactory) {

        avCacheFactory._httpCache.should.be.defined;
        avCacheFactory._browserCache.should.be.defined;
    }));

    it('should intercept XSRF header', inject(function ($http) {

        $httpBackend.expectGET('/testHeader').respond(200, {}, {
            'X-XSRF-Cookie': 'testCookie'
        });
        $http.get('/testHeader');
        $httpBackend.flush();
    }));

    it('should not intercept XSRF header', inject(function ($http) {

        $httpBackend.expectGET('/testNotHeader').respond(200);
        $http.get('/testNotHeader');
        $httpBackend.flush();
    }));

    it('should redirect on error 401', inject(function ($http, $location, UserService) {

        UserService.setCurrentUser({
            isLogged: true
        });

        $httpBackend.expectGET('/testError').respond(401);
        $http.get('/testError');
        $httpBackend.flush();

        $location.path().should.be.equal('/error401');
    }));

    it('should not redirect on other errors', inject(function ($http, $location, UserService) {

        UserService.setCurrentUser({
            isLogged: true
        });

        $httpBackend.expectGET('/testError').respond(404);
        $http.get('/testError');
        $httpBackend.flush();

        $location.path().should.be.equal('');
    }));

    it('should redirect when not logged in and route denied', inject(function ($location, UserService, $rootScope) {

        UserService.removeUser();

        $location.path('/admin');
        $rootScope.$digest();
        $location.path().should.be.equal('/login');
    }));

    it('should redirect when route denied', inject(function ($location, UserService, $rootScope) {

        UserService.setCurrentUser({
            roles: ["ADMIN"],
            isLogged: true
        });

        $location.path('/customer');
        $rootScope.$digest();
        $location.path().should.be.equal('/routeDenied');
    }));
});

describe('appverse.security module without appverse.cache: ', function () {
    'use strict';

    beforeEach(module('appverse.security'));

    it('should not use appverse.cache', inject(function (avCacheFactory) {

        should.equal(avCacheFactory._httpCache, undefined);
        avCacheFactory._browserCache.should.be.defined;
    }));
});
