(function() {
    'use strict';

    angular.module('appverse.security').factory('Oauth_Profile', OauthProfileFactory);

    /**
     * @ngdoc service
     * @name appverse.security.factory:Oauth_Profile
     * @requires appverse.security.factory:Oauth_RequestWrapper
     * @requires $resource
     * @requires SECURITY_OAUTH
     *
     * @description
     * Profile model. *
     */
    function OauthProfileFactory(Oauth_RequestWrapper, $resource, SECURITY_OAUTH) {
        var resource = $resource(SECURITY_OAUTH.profile, {}, {
            //get: { method: 'JSONP', params: { callback: 'JSON_CALLBACK' } }
        });
        return Oauth_RequestWrapper.wrapRequest(resource, ['get']);
    }

})();