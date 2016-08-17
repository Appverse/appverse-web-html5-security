(function () {
    'use strict';

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
