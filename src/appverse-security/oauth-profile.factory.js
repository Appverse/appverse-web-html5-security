(function () {
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
    function OauthProfileFactory(Oauth_RequestWrapper, Restangular) {

        return Oauth_RequestWrapper.wrapRequest(Restangular);
    }

})();
