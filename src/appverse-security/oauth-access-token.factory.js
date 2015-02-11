(function() {
    'use strict';

    angular.module('appverse.security').factory('Oauth_AccessToken', OauthAccessTokenFactory);

    /**
     * @ngdoc service
     * @name appverse.security.factory:Oauth_AccessToken
     * @requires $location
     * @requires $cookies
     * @requires CacheFactory
     * @description
     * OAuth access token service.
     * Management of the access token.
     */
    function OauthAccessTokenFactory ($location, $cookies, CacheFactory, UserService) {

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
        factory.get = function () {
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
        factory.getXSRF = function () {
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
        factory.set = function (scope) {
            // take the token from the query string and eventually save it in the cookies
            setTokenFromString(scope);
            // take the from the cookies
            setTokenFromCookies(scope);
            return token;
        };


        factory.setFromHeader = function (token) {
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
        factory.destroy = function (scope) {
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
        factory.expired = function () {
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
                removeFragment();
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
         * @param {object} scope The current scope
         * @description
         * Remove the fragment URI
         */
        function removeFragment(scope) {
            //TODO we need to let the fragment live if it's not the access token
            $location.hash('');
        }


        return factory;
    }

})();