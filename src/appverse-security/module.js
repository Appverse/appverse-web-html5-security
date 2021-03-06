(function () {
    'use strict';

    ////////////////////////////////////////////////////////////////////////////
    // COMMON API - 0.1
    // SECURITY
    // PRIMARY MODULE (appverse.security)
    // CONFIG KEY: AD
    ////////////////////////////////////////////////////////////////////////////
    // 2 services
    // A-AUTHENTICATION
    // Protect username and password
    // Manages authentication operations
    // Handles user session
    //
    // B-REMOTE COMMUNICATION AUTHORIZATION HANDLING
    // Based on OAuth 2.0 integration (RFC 6749, October 2012).
    // It handles token for the current user session.
    // OAuth2 Protocol Flow:
    //
    //    +--------+                               +---------------+
    //    |        |--(A)- Authorization Request ->|   Resource    |
    //    |        |                               |     Owner     |
    //    |        |<-(B)-- Authorization Grant ---|               |
    //    |        |                               +---------------+
    //    |        |
    //    |        |                               +---------------+
    //    |        |--(C)-- Authorization Grant -->| Authorization |
    //    | Client |                               |     Server    |
    //    |        |<-(D)----- Access Token -------|               |
    //    |        |                               +---------------+
    //    |        |
    //    |        |                               +---------------+
    //    |        |--(E)----- Access Token ------>|    Resource   |
    //    |        |                               |     Server    |
    //    |        |<-(F)--- Protected Resource ---|               |
    //    +--------+                               +---------------+
    //
    //1.3.2.  Implicit
    //
    //   The implicit grant is a simplified authorization code flow optimized
    //   for clients implemented in a browser using a scripting language such
    //   as JavaScript.  In the implicit flow, instead of issuing the client
    //   an authorization code, the client is issued an access token directly
    //   (as the result of the resource owner authorization).  The grant type
    //   is implicit, as no intermediate credentials (such as an authorization
    //   code) are issued (and later used to obtain an access token).
    //
    //   When issuing an access token during the implicit grant flow, the
    //   authorization server does not authenticate the client.  In some
    //   cases, the client identity can be verified via the redirection URI
    //   used to deliver the access token to the client.  The access token may
    //   be exposed to the resource owner or other applications with access to
    //   the resource owner's user-agent.
    //
    //   Implicit grants improve the responsiveness and efficiency of some
    //   clients (such as a client implemented as an in-browser application),
    //   since it reduces the number of round trips required to obtain an
    //   access token.  However, this convenience should be weighed against
    //   the security implications of using implicit grants, such as those
    //   described in Sections 10.3 and 10.16, especially when the
    //   authorization code grant type is available.
    //
    //
    //   APP AUTHENTICATION (OAuth2: Client Credentials Grant)
    //
    //     The backend offers applications the ability to issue authenticated requests on behalf of the application itself
    //     (as opposed to on behalf of a specific user). The backend implementation should be based on the Client Credentials Grant.
    //     Since the client authentication is used as the authorization grant, no additional authorization request is needed.
    //     (http://tools.ietf.org/html/rfc6749#section-4.4) flow of the OAuth 2 specification.
    //
    //     The application-only auth flow follows these steps:
    //     1-An application encodes its consumer key and secret into a specially encoded set of credentials.
    //     2-An application makes a request to the POST oauth2/token endpoint to exchange these credentials for a bearer token.
    //     3-When accessing the REST API, the application uses the bearer token to authenticate.
    //
    //     The client credentials grant type MUST only be used by confidential clients.
    //
    //     +---------+                                  +---------------+
    //     |         |                                  |               |
    //     |         |>--(A)- Client Authentication --->| Authorization |
    //     | Client  |                                  |     Server    |
    //     |         |<--(B)---- Access Token ---------<|               |
    //     |         |                                  |               |
    //     +---------+                                  +---------------+
    //
    //C-INTERNAL AUTHORIZATION
    // It handles access to site sections
    // Includes roles management and rights checking
    //////////////////////////////////////////////////////////////////////////////
    // NOTES
    // 1-INNER STRUCTURE
    // The module comprises 4 services and one directive.
    // It must be pre-configured.
    // DIRECTIVE: oauth
    // FACTORY: Oauth_AccessToken
    // FACTORY: Oauth_Endpoint
    // FACTORY: Oauth_RequestWrapper
    // FACTORY: Oauth_Profile
    // CONFIGURATION: SECURITY_OAUTH
    //////////////////////////////////////////////////////////////////////////////

    /**
     * @ngdoc module
     * @name appverse.security
     *
     * @description
     * 3 services:
     *
     *  A-AUTHENTICATION
     *  Protect username and password
     *  Manages authentication operations
     *  Handles user session
     *
     * B-REMOTE COMMUNICATION AUTHORIZATION HANDLING
     *  Based on OAuth 2.0 integration (RFC 6749, October 2012).
     *  It handles token for the current user session.
     *
     * C-INTERNAL AUTHORIZATION
     *  It handles access to site sections
     *  Includes roles management and rights checking
     *
     * @requires https://docs.angularjs.org/api/ngCookies  ngCookies
     * @requires AppCache
     * @requires AppConfiguration
     * @requires AppUtils
     * @requires AppREST
     */
    angular.module('appverse.security', [
        'ngCookies', // Angular support for cookies
        'appverse.configuration', // Common API Module
        'ngResource'
    ])
        .config(configModule)
        .run(run);

    function configModule($provide, $httpProvider, $injector) {

        if (!$injector.has('avCacheFactory')) {

            //appverse.cache module not found. Adding basic avCacheFactory.
            $provide.factory('avCacheFactory', function ($cacheFactory) {
                return {
                    _browserCache: $cacheFactory('basicCache')
                };
            });
        }

        function oauthResponseInterceptor($q, $log, $injector) {

            return {
                'response': function (response) {

                    // Retrieves bearer/oauth token from header
                    var tokenInHeader = response.headers('X-XSRF-Cookie');
                    if (tokenInHeader) {
                        $injector.get('Oauth_AccessToken').setFromHeader(tokenInHeader);
                    }
                    return response;
                }

            };
        }

        oauthResponseInterceptor.$inject = ['$q', '$log', '$injector'];
        $provide.factory('oauthResponseInterceptor', oauthResponseInterceptor);
        $httpProvider.interceptors.push('oauthResponseInterceptor');


        var logsOutUserOn401 = ['$q', '$location', '$log', 'SECURITY_GENERAL', function ($q, $location, $log, SECURITY_GENERAL) {

            return {
                'responseError': function (rejection) {
                    if (rejection.status === 401 && SECURITY_GENERAL.error401Redirect) {
                        $log.error('Error 401 intercepted. Redirecting...');
                        $location.path(SECURITY_GENERAL.error401Redirect);
                    }
                    return $q.reject(rejection);
                }
            };

        }];

        $provide.factory('logsOutUserOn401', logsOutUserOn401);
        $httpProvider.interceptors.push('logsOutUserOn401');
    }

    function run($log, $rootScope, $location, UserService, SECURITY_GENERAL, RoleService, AuthenticationService) {

        $log.debug('appverse.security run');

        $rootScope.$on('$locationChangeStart',
            function (angularEvent) {

                if ($location.url() === (SECURITY_GENERAL.loginRequiredRedirect || SECURITY_GENERAL.routeDeniedRedirect || SECURITY_GENERAL.error401Redirect)) {
                    return;
                }

                if (!RoleService.isRouteAllowed()) {

                    var user = UserService.getCurrentUser();

                    if (user && user.isLogged && SECURITY_GENERAL.routeDeniedRedirect) {
                        $log.debug('Route is denied. Redirecting...');
                        angularEvent.preventDefault();
                        $location.path(SECURITY_GENERAL.routeDeniedRedirect);
                        return;
                    }

                    if (SECURITY_GENERAL.loginRequiredRedirect) {
                        $log.debug('Login required. Redirecting...');
                        angularEvent.preventDefault();
                        $location.path(SECURITY_GENERAL.loginRequiredRedirect);
                        return;
                    }
                }
            });

        $rootScope.UserService = UserService;
        $rootScope.AuthenticationService = AuthenticationService;
    }

})();
