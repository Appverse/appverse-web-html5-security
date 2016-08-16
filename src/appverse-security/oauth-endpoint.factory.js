(function() {
    'use strict';

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
            $log.debug('OauthEndpointFactory.set: ');
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
            $log.debug('OauthAccessTokenFactory.get: ');
            return url;
        };

        /**
         * @ngdoc method
         * @name Oauth_Endpoint#redirect
         * @description Redirects the app to the authorization URL.
         */
        factory.redirect = function() {
            $log.debug('OauthAccessTokenFactory.redirect: ');

            window.location.replace(url);
        };

        return factory;
    }

})();
