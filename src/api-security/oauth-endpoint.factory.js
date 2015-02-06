(function() {
    'use strict';

    angular.module('AppSecurity').factory('Oauth_Endpoint', OauthEndpointFactory);

    /**
     * @ngdoc service
     * @name AppSecurity.factory:Oauth_Endpoint
     * @requires AppSecurity.factory:Oauth_AccessToken
     * @requires $location
     * @description
     * OAuth Endpoint service.
     * Contains one factory managing the authorization's (endpoint) URL.
     */
    function OauthEndpointFactory ($location) {

        var factory = {};
        var url;

        //TODO Check against other oauth providers (linkedin, twitter).

        /*
         *NOTE
         *Google uses the same url for authentication and authorization, so just
         *redirect your users to the authorize url with the appropriate parameters in
         *the query string. Google then determines if the user needs to login,
         *authorize your app, or both.
         *The flow would go something like this...
         *1-Get the request token
         *2-Redirect your users to the authorization link
         *https://www.google.com/accounts/OAuthAuthorizeToken?scope=http%3A%2F%2Fwww.google.com%2Fm8%2Ffeeds&oauth_token=REQUEST_TOKEN&oauth_callback=http%3A%2F%2Fwww.mysite.com%2Fcallback
         *3-User authorizes your app, then exchange the request token for an access token.
         */


        /**
         * @ngdoc method
         * @name AppSecurity.factory:Oauth_Endpoint#set
         * @methodOf AppSecurity.factory:Oauth_Endpoint
         * @param {object} scope The current scope
         * @description Defines the authorization URL with correct attributes.
         * @returns {String} The URL for the oauth endpoint
         */
        factory.set = function (scope) {
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
         * @name AppSecurity.factory:Oauth_Endpoint#get
         * @methodOf AppSecurity.factory:Oauth_Endpoint
         * @description Returns the authorization URL.
         * @returns {String} The URL for the oauth endpoint
         */
        factory.get = function () {
            return url;
        };

        /**
         * @ngdoc method
         * @name AppSecurity.factory:Oauth_Endpoint#redirect
         * @methodOf AppSecurity.factory:Oauth_Endpoint
         * @description Redirects the app to the authorization URL.
         */
        factory.redirect = function () {
            window.location.replace(url);
        };

        return factory;
    }

})();