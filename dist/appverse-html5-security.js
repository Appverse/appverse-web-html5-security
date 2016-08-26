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
    configModule.$inject = ["$provide", "$httpProvider", "$injector"];
    run.$inject = ["$log"];
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
            $provide.factory('avCacheFactory', ["$cacheFactory", function ($cacheFactory) {
                return {
                    _browserCache: $cacheFactory('basicCache')
                };
            }]);
        }

        function oauthResponseInterceptor($q, $log, $injector) {

            return {
                'response': function (response) {

                    // Retrieves bearer/oauth token from header
                    var tokenInHeader = response.headers('X-XSRF-Cookie');
                    $log.debug('oauthResponseInterceptor X-XSRF-Cookie: ' + tokenInHeader);
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


        var logsOutUserOn401 = ['$q', '$location', function ($q, $location) {

            return {
                'responseError': function (rejection) {
                    if (rejection.status === 401) {
                        //Redirects them back to main/login page
                        $location.path('/');

                        return $q.reject(rejection);
                    } else {
                        return $q.reject(rejection);
                    }
                }
            };

        }];

        $provide.factory('logsOutUserOn401', logsOutUserOn401);
        $httpProvider.interceptors.push('logsOutUserOn401');
    }

    function run($log) {

        $log.debug('appverse.security run');


    }

})();

(function() {
    'use strict';

    AuthenticationServiceFactory.$inject = ["$rootScope", "UserService", "Base64", "$http", "$q", "$log", "SECURITY_GENERAL"];
    angular.module('appverse.security').factory('AuthenticationService', AuthenticationServiceFactory);

    /**
     * @ngdoc service
     * @name AuthenticationService
     * @module  appverse.security
     * @description Exposes some useful methods for apps developers.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$rootScope $rootScope
     * @requires UserService
     * @requires Base64
     * @requires https://docs.angularjs.org/api/ng/service/$http $http
     * @requires https://docs.angularjs.org/api/ng/service/$q $q
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires SECURITY_GENERAL
     */
    function AuthenticationServiceFactory ($rootScope, UserService, Base64, $http, $q, $log, SECURITY_GENERAL) {

        return {

            /**
             * @ngdoc method
             * @name  AuthenticationService#sendLoginRequest
             * @description Send the login request based on Basic Authorization
             *
             * @param  {object} credentials An object containing two properties: name and password
             * @return {object}             A promise resolving to the response
             */
            sendLoginRequest: function (credentials) {
                var deferred = $q.defer();
                var encoded = Base64.encode(credentials.name + ':' + credentials.password);

                $http({
                    method: SECURITY_GENERAL.loginHTTPMethod,
                    url: SECURITY_GENERAL.loginURL,
                    headers: {
                        'Authorization': 'Basic ' + encoded,
                        'Content-Type': SECURITY_GENERAL.Headers_ContentType
                    },
                    timeout: 30000,
                    cache: false
                })
                    .success(function (data, status, headers, config) {
                        var results = [];
                        results.data = data;
                        results.headers = headers;
                        results.status = status;
                        results.config = config;

                        deferred.resolve(results);
                    })
                    .error(function (data, status) {
                        deferred.reject(data, status);
                    });
                return deferred.promise;
            },

            /**
             * @ngdoc method
             * @name  AuthenticationService#sendLogoutRequest
             * @description Send the login request based on Basic Authorization
             *
             * @return {object}             A promise resolving to the response
             */
            sendLogoutRequest: function () {
                var deferred = $q.defer();

                $http({
                    method: SECURITY_GENERAL.logoutHTTPMethod,
                    url: SECURITY_GENERAL.logoutURL,
                    headers: {
                        'Content-Type': SECURITY_GENERAL.Headers_ContentType
                    },
                    timeout: 30000,
                    cache: false
                })
                    .success(function (data, status, headers, config) {
                        var results = [];
                        results.data = data;
                        results.headers = headers;
                        results.status = status;
                        results.config = config;

                        deferred.resolve(results);
                    })
                    .error(function (data, status) {
                        deferred.reject(data, status);
                    });
                return deferred.promise;
            },

            /**
             * @ngdoc method
             * @name AuthenticationService#login
             * @description Sets the new logged user
             *
             * @param {string} name Name of the user
             * @param {object} roles Set of roles of the user as array
             * @param {string} token The token from the oauth server
             * @param {boolean} isLogged If the user is logged or not
             * @param {string} role The role to be validated

             */
            login: function (name, roles, bToken, xsrfToken, isLogged) {
                //$log.debug(' -- bToken -- : ' + bToken);
                var user = new User(name, roles, bToken, xsrfToken, isLogged);
                $log.debug(user.print());
                UserService.setCurrentUser(user);
            },
            /**
             * @ngdoc method
             * @name AuthenticationService#isLoggedIn
             *  @description Check if the user is logged
             *
             * @param {string} role The role to be validated
             * @returns {boolean}  true if is already logged
             */
            isLoggedIn: function () {
                if (UserService.getCurrentUser()) {
                    return true;
                } else {
                    return false;
                }
            },
            /**
             * @ngdoc method
             * @name AuthenticationService#logOut
             * @description Removes the current user from the app
             *
             * @param {User} user The User object to be logged out
             */
            logOut: function (user) {
                UserService.removeUser(user);
            }

        };
    }

})();
(function() {
    'use strict';

    OauthAccessTokenFactory.$inject = ["$location", "$cookies", "UserService", "$log"];
    angular.module('appverse.security').factory('Oauth_AccessToken', OauthAccessTokenFactory);

    /**
     * @ngdoc service
     * @name appverse.security.factory:Oauth_AccessToken
     * @requires $location
     * @requires $cookies
     * @description
     * OAuth access token service.
     * Management of the access token.
     */
    function OauthAccessTokenFactory($location, $cookies, UserService, $log) {

        var factory = {};
        var token = null;
        var xsrfToken = null;


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#get
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @description Returns the access token.
         * @returns {object} The user token from the oauth server
         */
        factory.get = function() {
            getTokenFromCache();
            return token;
        };

        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#getXSRF
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @description Returns the XSRF token to be input in each request header.
         * @returns {object} The xsrf token from the oauth server in the current session
         */
        factory.getXSRF = function() {
            getXSRFTokenFromCache();
            return xsrfToken;
        };


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#set
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @param {object} scope The current scope
         * @description
         * Sets and returns the access token taking it from the fragment URI or eventually
         * from the cookies. Use `AccessToken.init()` to load (at boot time) the access token.
         * @returns {object} The user token from the oauth server
         */
        factory.set = function(scope) {
            // take the token from the query string and eventually save it in the cookies
            setTokenFromString(scope);
            // take the from the cookies
            setTokenFromCookies(scope);
            return token;
        };


        factory.setFromHeader = function(token) {
            setTokenInCurrentUser(token);
            return token;
        };


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#destroy
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @param {object} scope The current scope
         * @description Delete the access token and remove the cookies.
         * @returns {object} The user token from the oauth server
         */
        factory.destroy = function(scope) {
            token = null;
            xsrfToken = null;
            delete $cookies[scope.client];
            return token;
        };


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#expired
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @description Tells when the access token is expired.
         * @returns {boolean} True or false if the token is expired
         */
        factory.expired = function() {
            return (token && token.expires_at && token.expires_at < new Date());
        };


        /////////////////////////////Private methods///////////////////////////////////

        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#setTokenFromString
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @param {object} scope The current scope
         * @description
         * Get the access token from a string and save it
         */
        function setTokenFromString(scope) {
            var token = getTokenFromString($location.hash());

            if (token) {
                removeFragment($location.hash());
                setToken(token, scope);
            }
        }


        function getTokenFromCache() {
            var user = UserService.getCurrentUser();
            if (user) {
                token = user.bToken;
            }
        }


        function getXSRFTokenFromCache() {
            var user = UserService.getCurrentUser();
            if (user) {
                xsrfToken = user.xsrfToken;
            }
        }
        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#getTokenFromString
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @param {object} hash The initial string
         * @description
         * Parse the fragment URI into an object
         * @returns {object} The value of the token
         */
        function getTokenFromString(hash) {
            var splitted = hash.split('&');
            var params = {};

            for (var i = 0; i < splitted.length; i++) {
                var param = splitted[i].split('=');
                var key = param[0];
                var value = param[1];
                params[key] = value;
            }

            if (params.access_token || params.error) {
                return params;
            }
        }


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#setTokenFromCookies
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @param {object} scope The current scope
         * @description
         * Set the access token from the cookies.
         * Returns the access token only when the storage attribute is set to 'cookies'.
         */
        function setTokenFromCookies(scope) {
            if (scope.storage === 'cookies') {
                if ($cookies[scope.client]) {
                    var params = JSON.parse($cookies[scope.client]);
                    setToken(params, scope);
                }
            }
        }


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#setTokenInCookies
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @param {object} scope The current scope
         * @param {object} params with token value hash
         * @description
         * Save the access token into a cookie identified by the application ID
         * Save the access token only when the storage attribute is set to 'cookies'.
         */
        function setTokenInCookies(scope, params) {
            if (scope.storage === SECURITY_OAUTH.storage_cookies) {
                if (params && params.access_token) {
                    $cookies[scope.client] = JSON.stringify(params);
                }
            }
        }


        function setTokenInCurrentUser(scope, params) {
            if (params && params.access_token) {
                token = params.access_token;
                //token =  JSON.stringify(params);
            } else {
                //If not exist takes the saved token from cache
                token = factory.get();
            }
            var user = UserService.getCurrentUser();
            if (user) {
                user.bToken = token;
                UserService.setCurrentUser(user);
            }

        }


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#setToken
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @param {object} params The object with the token
         * @param {object} scope The current scope
         * @description
         * Set the access token in cookies.
         * @returns {object} The token value
         */
        function setToken(params, scope) {
            token = token || {}; // init the token
            angular.extend(token, params); // set the access token params
            setExpiresAt(); // set the expiring time
            setTokenInCookies(scope, params); // save the token into a cookie

            setTokenInCurrentUser(token);

            return token;
        }


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#setExpiresAt
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @description
         * Set the access token expiration date (useful for refresh logics)
         */
        function setExpiresAt() {
            if (token) {
                var expires_at = new Date();
                // 60 seconds less to secure browser and response latency
                expires_at.setSeconds(expires_at.getSeconds() + parseInt(token.expires_in) - 60);
                token.expires_at = expires_at;
            }
        }


        /**
         * @ngdoc method
         * @name appverse.security.factory:Oauth_AccessToken#removeFragment
         * @methodOf appverse.security.factory:Oauth_AccessToken
         * @param {object} hash The initial string
         * @description
         * Remove the fragment URI
         */
        function removeFragment(hash) {

            var splitted = hash.split('&');
            var token;

            for (var i = 0; i < splitted.length; i++) {
                var param = splitted[i].split('=');
                var key = param[0];
                var value = param[1];
                if (key == 'access_token') {
                    token = value;
                }
            }
            var base = hash.substring(0, hash.lastIndexOf("?")+1);
            var fragment = base + 'access_token=' + token;
            $location.hash(fragment);
            $log.debug('OauthAccessTokenFactory.removeFragment: hash' + $location.hash());

        }


        return factory;
    }

})();

(function() {
    'use strict';

    OauthEndpointFactory.$inject = ["$location", "$log"];
    angular.module('appverse.security').factory('Oauth_Endpoint', OauthEndpointFactory);

    /**
     * @ngdoc service
     * @name Oauth_Endpoint
     * @module  appverse.security
     * @description
     * OAuth Endpoint service.
     * Contains one factory managing the authorization's (endpoint) URL.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$location $location
     */
    function OauthEndpointFactory($location, $log) {

        var factory = {};
        var url;

        /**
         * @ngdoc method
         * @name Oauth_Endpoint#set
         * @description Defines the authorization URL with correct attributes.
         *
         * @param {object} scope The current scope
         * @returns {String} The URL for the oauth endpoint
         */
        factory.set = function(scope) {
            $log.debug('OauthEndpointFactory.set');
            url = scope.site +
                scope.authorizePath +
                '?response_type=token' + '&' +
                'client_id=' + scope.client + '&' +
                'redirect_uri=' + scope.redirect + '&' +
                'scope=' + scope.scope + '&' +
                'state=' + $location.url();

            return url;
        };

      /**
         * @ngdoc method
         * @name Oauth_Endpoint#get
         * @description Returns the authorization URL.
         *
         * @returns {String} The URL for the oauth endpoint
         */
        factory.get = function() {
            $log.debug('OauthAccessTokenFactory.get');
            return url;
        };

        /**
         * @ngdoc method
         * @name Oauth_Endpoint#redirect
         * @description Redirects the app to the authorization URL.
         */
        factory.redirect = function() {
            $log.debug('OauthAccessTokenFactory.redirect');

            window.location.replace(url);
        };

        return factory;
    }

})();

(function() {
    'use strict';

    OauthProfileFactory.$inject = ["Oauth_RequestWrapper", "$resource", "SECURITY_OAUTH"];
    angular.module('appverse.security').factory('Oauth_Profile', OauthProfileFactory);

    /**
     * @ngdoc service
     * @name Oauth_Profile
     * @module appverse.security
     * @description Profile model
     *
     * @requires appverse.security.factory:Oauth_RequestWrapper
     * @requires https://docs.angularjs.org/api/ng/service/$resource $resource
     * @requires SECURITY_OAUTH
     */
    function OauthProfileFactory(Oauth_RequestWrapper, $resource, SECURITY_OAUTH) {
        var resource = $resource(SECURITY_OAUTH.profile, {}, {
            //get: { method: 'JSONP', params: { callback: 'JSON_CALLBACK' } }
        });
        return Oauth_RequestWrapper.wrapRequest(resource, ['get']);
    }

})();

(function () {
    'use strict';

    OauthRequestWrapperFactory.$inject = ["$log", "$browser", "Oauth_AccessToken", "REST_CONFIG", "SECURITY_GENERAL"];
    angular.module('appverse.security').factory('Oauth_RequestWrapper', OauthRequestWrapperFactory);

    /**
     * @ngdoc service
     * @name Oauth_RequestWrapper
     * @module  appverse.security
     * @description
     * Requests wrapper. It wraps every request setting needed header by injecting
     * the access token into the header
     *
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires Oauth_AccessToken
     * @requires REST_CONFIG
     * @requires SECURITY_GENERAL
     */
    function OauthRequestWrapperFactory($log, $browser, Oauth_AccessToken, REST_CONFIG, SECURITY_GENERAL) {

        var factory = {};

        /**
         * @ngdoc method
         * @name Oauth_RequestWrapper#wrapRequest
         * @description Wraps every request with the Restangular object
         *
         * @param {object} Restangular object
         * @param {object} actions Array with actions
         * @returns {object} the modified Restangular object
         */
        factory.wrapRequest = function (restangular) {
          $log.debug('OauthRequestWrapperFactory.wrapRequest');

            var token = Oauth_AccessToken.get();
            var wrappedRestangular = restangular;

            if (token) {
                $log.debug("OAuth token is present and valid. The wrapped request is secure.");
                setRequestHeaders(token, restangular);
            } else {
                $log
                    .debug("OAuth token is not present yet. The wrapped request will not be secure.");
            }

            return wrappedRestangular;
        };



        /////////////////////////////Private methods///////////////////////////////////


        /**
         * Set security request headers
         *
         * @param {string} token The token value from the oauth server
         * @param {object} wrappedRestangular The Restangular object
         */
        function setRequestHeaders(token, wrappedRestangular) {
          $log.debug('OauthRequestWrapperFactory.setRequestHeaders');

            $log.debug('token: ' + token);
            $log.debug('is same domain? ' + isSameDomain(REST_CONFIG.BaseUrl, $browser.url()));

            /*
            The XSRF policy type is the level of complexity to calculate the value
            to be returned in the xsrf header in request
            against the authorization server:
            0: No value is included (The domain is the same one)
            1: $http service built-in solution.
              The $http service will extract this token from the response header,
             and then included in the X-XSRF-TOKEN header to every HTTP request.
             The server must check the token
             on each request, and then block access if it is not valid.
            2: Additional calculation of the cookie value using a secret hash.
             The value is included in the X-XSRF-TOKEN
             request header.
             */
            if (token) {
                var xsrfHeaderValue;
                if (isSameDomain(REST_CONFIG.BaseUrl, $browser.url())) {
                    $log.debug("*** isSameDomain");
                    if (SECURITY_GENERAL.XSRFPolicyType === 0) {
                        $log.debug("*** case 0");
                        wrappedRestangular.setDefaultHeaders({
                            'Authorization': 'Bearer' + token,
                            'Content-Type': REST_CONFIG.DefaultContentType
                        });
                    } else if (SECURITY_GENERAL.XSRFPolicyType === 1) {
                        $log.debug("*** case 1");
                        xsrfHeaderValue = Oauth_AccessToken.getXSRF();
                        wrappedRestangular.setDefaultHeaders({
                            'Authorization': 'Bearer' + token,
                            'Content-Type': REST_CONFIG.DefaultContentType,
                            'X-XSRF-TOKEN': xsrfHeaderValue
                        });
                    } else if (SECURITY_GENERAL.XSRFPolicyType === 2) {
                        $log.debug("*** case 2");
                        xsrfHeaderValue = $browser.cookies()[SECURITY_GENERAL.XSRFCSRFCookieName];
                        wrappedRestangular.setDefaultHeaders({
                            'Authorization': 'Bearer' + token,
                            'Content-Type': REST_CONFIG.DefaultContentType,
                            'X-XSRF-TOKEN': xsrfHeaderValue
                        });
                    }
                }

            }
            return wrappedRestangular;
        }

        return factory;
    }


    /**
     * Parse a request and location URL and determine whether this is a same-domain request.
     *
     * @param {string} requestUrl The url of the request.
     * @param {string} locationUrl The current browser location url.
     * @returns {boolean} Whether the request is for the same domain.
     */
    function isSameDomain(requestUrl, locationUrl) {
        var IS_SAME_DOMAIN_URL_MATCH = /^(([^:]+):)?\/\/(\w+:{0,1}\w*@)?([\w\.-]*)?(:([0-9]+))?(.*)$/;
        var match = IS_SAME_DOMAIN_URL_MATCH.exec(requestUrl);
        // if requestUrl is relative, the regex does not match.
        if (match === null) {
            return true;
        }

        var domain1 = {
            protocol: match[2],
            host: match[4],
            port: int(match[6]) || DEFAULT_PORTS[match[2]] || null,
            // IE8 sets unmatched groups to '' instead of undefined.
            relativeProtocol: match[2] === undefined || match[2] === ''
        };

        match = URL_MATCH.exec(locationUrl);
        var domain2 = {
            protocol: match[1],
            host: match[3],
            port: int(match[5]) || DEFAULT_PORTS[match[1]] || null
        };

        return (domain1.protocol == domain2.protocol || domain1.relativeProtocol) &&
            domain1.host == domain2.host &&
            (domain1.port == domain2.port || (domain1.relativeProtocol &&
                domain2.port == DEFAULT_PORTS[domain2.protocol]));
    }

})();

(function () {
    'use strict';

    angular.module('appverse.security')

    /**
     * @ngdoc directive
     * @name appverse.security.directive:oauth
     * @description
     * Oauth Login Directive.
     * You can use the directive with or without data in the directive declaration.
     * If data are not included they will be loaded from configuration files.
     * Data in declaration overwrites data from configuration files.
     *
     * @restrict B
     * @requires SECURITY_OAUTH
     * @requires Oauth_AccessToken
     * @requires Oauth_Endpoint
     * @requires Oauth_Profile
     * @requires https://docs.angularjs.org/api/ng/service/$location $location
     * @requires https://docs.angularjs.org/api/ng/service/$rootScope $rootScope
     * @requires https://docs.angularjs.org/api/ng/service/$compile $compile
     * @requires https://docs.angularjs.org/api/ng/service/$http $http
     * @requires https://docs.angularjs.org/api/ng/service/$templateCache $templateCache
     *
     * @example
     <example module="appverse.security">
        <file name="index.html">
            <p>OAuth test</p>
            <oauth ng-cloak
                site="http://myoauthserver.com"
                client="e72c43c75adc9665e4d4c13354c41f337d5a2e439d3da1243bb47e39745f435c"
                redirect="http://localhost:9000"
                scope="resources"
                profile="http://myoauthserver.com/me"
                storage="cookies">Sign In
            </oauth>
        </file>
    </example>

     * Note ng-cloak directive (http://docs.angularjs.org/api/ng.directive:ngCloak)
     * is used to prevent the Angular html template from being briefly displayed by
     * the browser in its raw (uncompiled) form while your application is loading.
     */
    .directive('oauth', ['SECURITY_OAUTH', 'Oauth_AccessToken', 'Oauth_Endpoint', 'Oauth_Profile', '$rootScope', '$compile', '$http', '$templateCache', '$log',
    function (SECURITY_OAUTH, AccessToken, Endpoint, Profile, $rootScope, $compile, $http, $templateCache, $log) {

            var definition = {
                restrict: 'AE',
                replace: false,
                scope: {
                    site: '@', // (required) set the oauth2 server host
                    client: '@', // (required) client id
                    redirect: '@', // (required) client redirect uri
                    scope: '@', // (optional) scope
                    flow: '@', // (required) flow (e.g password, implicit)
                    view: '@', // (optional) view (e.g standard, popup)
                    storage: '@', // (optional) storage (e.g none, cookies)
                    profile: '@', // (optional) user info URL
                    template: '@' // (optional) template to render
                }
            };

            definition.link = function postLink(scope, element) {
                scope.show = 'none';

                scope.$watch('client', function () {
                    init(); // set defaults
                    compile(); // gets the template and compile the desired layout
                    Endpoint.set(scope); // set the oauth client url for authorization
                    AccessToken.set(scope); // set the access token object (from fragment or cookies)
                    initProfile(); // get the profile info
                    initView(); // set the actual visualization status for the widget
                });


                /**
                 * @function
                 * @description set defaults into the scope object
                 */
                function init() {
                    $log.debug('oauth.init: ');

                    scope.site = scope.site || SECURITY_OAUTH.scopeURL;
                    scope.clientID = scope.clientID || SECURITY_OAUTH.clientID;
                    scope.redirect = scope.redirect || SECURITY_OAUTH.redirect;
                    scope.scope = scope.scope || SECURITY_OAUTH.scope;
                    scope.flow = scope.flow || SECURITY_OAUTH.flow;
                    scope.view = scope.view || SECURITY_OAUTH.view;
                    scope.storage = scope.storage || SECURITY_OAUTH.storage;
                    scope.scope = scope.scope || SECURITY_OAUTH.scope;
                    scope.authorizePath = scope.authorizePath || SECURITY_OAUTH.scope_authorizePath;
                    scope.tokenPath = scope.tokenPath || SECURITY_OAUTH.scope_tokenPath;
                    scope.template = scope.template || SECURITY_OAUTH.scope_template;
                }

                /**
                 * @function
                 * @description
                 * Gets the template and compile the desired layout.
                 * Based on $compile, it compiles a piece of HTML string or DOM into the retrieved
                 * template and produces a template function, which can then be used to link scope and
                 * the template together.
                 */
                function compile() {
                    $log.debug('oauth.compile');

                    $http.get(scope.template, {
                            //This allows you can get the template again by consuming the
                            //$templateCache service directly.
                            cache: $templateCache
                        })
                        .success(function (html) {
                            element.html(html);
                            $compile(element.contents())(scope);
                        });
                }

                /**
                 * @function
                 * @description
                 * Gets the profile info.
                 */
                function initProfile() {
                    $log.debug('oauth.initProfile');

                    var token = AccessToken.get();
                    if (token && token.access_token && SECURITY_OAUTH.profile) {
                        scope.profile = Profile.get();
                    }
                }

                /**
                 * @function
                 * @description
                 * Sets the actual visualization status for the widget.
                 */
                function initView() {
                    $log.debug('oauth.initView');

                    var token = AccessToken.get();
                    // There is not token: without access token it's logged out
                    if (!token) {
                        return loggedOut();
                    }
                    // The request exists: if there is the access token we are done
                    if (token.access_token) {
                        return loggedIn();
                    }
                    // The request is denied: if the request has been denied we fire the denied event
                    if (token.error) {
                        return denied();
                    }
                }

                scope.login = function () {
                    $log.debug('oauth.scope.login');
                    Endpoint.redirect();
                };

                scope.logout = function () {
                    $log.debug('oauth.scope.logout');
                    AccessToken.destroy(scope);
                    loggedOut();
                };

                /**
                 * @function
                 * @description
                 */
                function loggedIn() {
                    $log.debug('oauth.loggedIn');
                    $rootScope.$broadcast('oauth:success', AccessToken.get());
                    scope.show = 'logout';
                }

                /**
                 * @function
                 * @description
                 */
                function loggedOut() {
                    $log.debug('oauth.loggedOut');
                    $rootScope.$broadcast('oauth:logout');
                    scope.show = 'login';
                }

                /**
                 * @function
                 * @description
                 */
                function denied() {
                    $log.debug('oauth.denied');
                    scope.show = 'denied';
                    $rootScope.$broadcast('oauth:denied');
                }

                scope.$on('oauth:template', function (event, template) {
                    scope.template = template;
                    compile(scope);
                });
            };

            return definition;
  }]);


})();

(function () {
    'use strict';

    RoleServiceFactory.$inject = ["$log", "AUTHORIZATION_DATA", "avCacheFactory"];
    angular.module('appverse.security').factory('RoleService', RoleServiceFactory);

    /**
     * @ngdoc service
     * @name RoleService
     * @module  appverse.security
     * @description Manages user's roles.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires AUTHORIZATION_DATA
     * @requires avCacheFactory
     */
    function RoleServiceFactory($log, AUTHORIZATION_DATA, avCacheFactory) {

        return {

            /**
             * @ngdoc method
             * @name RoleService#validateRoleAdmin
             * @description Check if the passed user has a role in the adminsitrator family
             *
             * @returns {boolean} True if the role of the usder has admin previleges
             */
            validateRoleAdmin: function () {
                var roles = avCacheFactory._browserCache.get('loggedUser').roles;
                $log.debug('roles in session: ' + roles);

                var result;
                if (roles && AUTHORIZATION_DATA.adminRoles) {
                    for (var j = 0; j < AUTHORIZATION_DATA.adminRoles.length; j++) {
                        if (_.contains(roles, AUTHORIZATION_DATA.adminRoles[j])) {
                            result = true;
                            break;
                        } else {
                            result = false;
                        }
                    }
                    return result;
                } else {
                    return false;
                }
            },

            /**
             * @ngdoc method
             * @name appverse.security.factory:RoleService#validateRoleInUserOther
             * @description Check if the passed user has a given role
             *
             * @param {string} role The role to be validated
             * @returns {boolean} True if the user has that role
             */
            validateRoleInUserOther: function (role) {
                var user = avCacheFactory._browserCache.get('loggedUser');
                if (user) {
                    return _.contains(role, user.roles);
                } else {
                    return false;
                }

            }
        };
    }

})();

(function () {
    'use strict';

    UserServiceFactory.$inject = ["$log", "avCacheFactory"];
    angular.module('appverse.security').factory('UserService', UserServiceFactory);

    /**
     * @ngdoc service
     * @name UserService
     * @module appverse.security
     *
     * @description
     * Handles the user in the app.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires avCacheFactory
     */
    function UserServiceFactory($log, avCacheFactory) {

        return {
            /**
             * @ngdoc method
             * @name UserService#setCurrentUser
             * @description Writes the current user in cache ('loggedUser').
             *
             * @param {object} loggedUser The currently logged user
             */
            setCurrentUser: function (loggedUser) {

                avCacheFactory._browserCache.put('loggedUser', {
                    username: loggedUser.name,
                    roles: loggedUser.roles,
                    bToken: loggedUser.bToken,
                    xsrfToken: loggedUser.xsrfToken,
                    isLogged: loggedUser.isLogged
                });

                $log.debug('New user has been stored to cache.');
            },
            /**
             * @ngdoc method
             * @name UserService#getCurrentUser
             * @description Retrieves the current user from cache ('loggedUser').
             * @returns {appverse.security.global:User} The currently logged user
             */
            getCurrentUser: function () {
                var loggedUser = avCacheFactory._browserCache.get('loggedUser');

                if (loggedUser && loggedUser.isLogged) {
                    return new User(loggedUser.username, loggedUser.roles, loggedUser.bToken, loggedUser.xsrfToken, loggedUser.isLogged);
                }
            },
            /**
             * @ngdoc method
             * @name UserService#removeUser
             * @description Removes the current user from the app, including cache.
             */
            removeUser: function () {
                avCacheFactory._browserCache.remove('loggedUser');
            }
        };
    }


    /**
     * @ngdoc object
     * @name User
     * @module appverse.security
     * @description Entity with main data about a user to be handled by the module
     *
     * @param {string} name The name of the user to be registered
     * @param {object} roles Array with the list of assigned roles
     * @param {string} bToken The provided encrypted oauth token
     * @param {int} xsrfToken The XSRF token provided by the server
     * @param {boolean} isLogged The user is logged or not
     */
    function User(name, roles, bToken, xsrfToken, isLogged) {
        this.name = name;
        //Array
        this.roles = roles;
        //string
        this.bToken = bToken;
        //string
        this.xsrfToken = xsrfToken;
        //boolean
        this.isLogged = isLogged;
    }

    User.prototype.print = function () {
        return 'User data. Name:' + this.name + '| Roles: ' + this.roles.toString() + '| Bearer Token: ' + this.bToken + '| XSRFToken: ' + this.xsrfToken + '| Logged: ' + this.isLogged;
    };

})();
