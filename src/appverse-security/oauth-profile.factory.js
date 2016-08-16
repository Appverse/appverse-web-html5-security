(function() {
    'use strict';

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
