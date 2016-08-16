(function() {
    'use strict';

    angular.module('appverse.security').factory('Oauth_AccessToken', OauthAccessTokenFactory);

    /**
     * @ngdoc service
     * @name Oauth_AccessToken
     * @module  appverse.security
     * @description
     * OAuth access token service.
     * Management of the access token.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$location $location
     * @requires https://docs.angularjs.org/api/ng/service/$cookie $cookies
     */
    function OauthAccessTokenFactory($location, $cookies, UserService, $log) {

        var factory = {};
        var token = null;
        var xsrfToken = null;

        /**
         * @ngdoc method
         * @name Oauth_AccessToken#get
         * @description Returns the access token.
         * @returns {object} The user token from the oauth server
         */
        factory.get = function() {
            getTokenFromCache();
            return token;
        };

        /**
         * @ngdoc method
         * @name Oauth_AccessToken#getXSRF
         * @description Returns the XSRF token to be input in each request header.
         * @returns {object} The xsrf token from the oauth server in the current session
         */
        factory.getXSRF = function() {
            getXSRFTokenFromCache();
            return xsrfToken;
        };

        /**
         * @ngdoc method
         * @name Oauth_AccessToken#set
         * @description
         * Sets and returns the access token taking it from the fragment URI or eventually
         * from the cookies. Use `AccessToken.init()` to load (at boot time) the access token.
         * @returns {object} The user token from the oauth server
         *
         * @param {object} scope The current scope
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
         * @name Oauth_AccessToken#destroy
         * @description Delete the access token and remove the cookies.
         *
         * @param {object} scope The current scope
         * @returns {object} The user token from the oauth server
         */
        factory.destroy = function(scope) {
            $log.debug('OauthAccessTokenFactory.destroy: ');
            token = null;
            xsrfToken = null;
            delete $cookies[scope.client];
            return token;
        };

        /**
         * @ngdoc method
         * @name Oauth_AccessToken#expired
         * @description Tells when the access token is expired.
         *
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
            $log.debug('OauthAccessTokenFactory.setTokenFromString: ');

            var token = getTokenFromString($location.hash());

            if (token) {
                removeFragment();
                setToken(token, scope);
            }
        }

        function getTokenFromCache() {
            $log.debug('OauthAccessTokenFactory.getTokenFromCache: ');

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
            $log.debug('OauthAccessTokenFactory.getTokenFromString: ');

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
            $log.debug('OauthAccessTokenFactory.setTokenFromCookies: ' + $cookies[scope.client]);

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
            $log.debug('OauthAccessTokenFactory.setTokenInCookies: ');

            if (scope.storage === SECURITY_OAUTH.storage_cookies) {
                if (params && params.access_token) {
                    $cookies[scope.client] = JSON.stringify(params);
                }
            }
        }

        function setTokenInCurrentUser(scope, params) {
            $log.debug('OauthAccessTokenFactory.setTokenInCurrentUser: ');

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
            $log.debug('OauthAccessTokenFactory.setToken: ');

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
            $log.debug('OauthAccessTokenFactory.setExpiresAt: ');

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
        function removeFragment() {
            $log.debug('OauthAccessTokenFactory.removeFragment: ');

            //TODO we need to let the fragment live if it's not the access token
            //$location.hash('');

            var stringUrl = $location.hash();
            var fragment = stringUrl.substring(stringUrl.lastIndexOf("client_id=") + 1, stringUrl.lastIndexOf("redirect_uri="));
            var newURL = stringUrl.replace(fragment, '');
            $location.hash(newURL);
            $log.debug('OauthAccessTokenFactory.removeFragment: hash' + $location.hash());

        }

        return factory;
    }

})();
