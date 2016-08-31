/*globals AppInit:false */
'use strict';

angular.module('security-demo-app', ['appverse', 'appverse.security', 'appverse.logging', 'appverse.router', 'appverse.cache', 'appverse.rest', 'ngMockE2E'])

.run(function ($log, $httpBackend, SECURITY_GENERAL, UserService, AuthenticationService, Base64) {

    $log.debug('security-demo-app run');

    $httpBackend.whenGET(/^views\//).passThrough();

    $httpBackend.when(SECURITY_GENERAL.loginHTTPMethod, SECURITY_GENERAL.loginURL).respond(function (method, url, data, headers) {

        var header = headers.Authorization;
        var login = Base64.decode(header.split('Basic ')[1]);

        if (login === 'admin:admin') {
            return [200, {
                name: 'admin',
                roles: ['ADMIN'],
                bToken: 'aaa',
                xsrfToken: 'bbb'
            }];
        }

        if (login === 'john:john') {
            return [200, {
                name: 'john',
                roles: ['CUSTOMER'],
                bToken: 'aaa',
                xsrfToken: 'bbb'
            }];
        }

        return [400];
    });

    $httpBackend.when(SECURITY_GENERAL.logoutHTTPMethod, SECURITY_GENERAL.logoutURL).respond(200);
});

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
