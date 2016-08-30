/*jshint expr:true */

describe('appverse.security module with appverse.cache: ', function () {
    'use strict';

    var $httpBackend;

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

    it('should redirect on error 401', inject(function ($http, $location) {

        $location.path().should.be.equal('');

        $httpBackend.expectGET('/testError').respond(401);
        $http.get('/testError');
        $httpBackend.flush();

        $location.path().should.be.equal('/');
    }));

    it('should not redirect on other errors', inject(function ($http, $location) {

        $location.path().should.be.equal('');

        $httpBackend.expectGET('/testError').respond(404);
        $http.get('/testError');
        $httpBackend.flush();

        $location.path().should.be.equal('');
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
