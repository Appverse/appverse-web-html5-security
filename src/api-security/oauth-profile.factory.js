(function() {
    'use strict';

    angular.module('AppSecurity').factory('Oauth_Profile', OauthProfileFactory);

    /**
     * @ngdoc service
     * @name AppSecurity.factory:Oauth_Profile
     * @requires AppSecurity.factory:Oauth_RequestWrapper
     * @requires $resource
     * @requires SECURITY_OAUTH
     *
     * @description
     * Profile model. *
     */
    function OauthProfileFactory(RequestWrapper, $resource, SECURITY_OAUTH) {
        var resource = $resource(SECURITY_OAUTH.profile, {}, {
            //get: { method: 'JSONP', params: { callback: 'JSON_CALLBACK' } }
        });
        return RequestWrapper.wrap(resource, ['get']);
    }

})();