(function () {
    'use strict';

    angular.module('appverse.security').factory('AuthenticationService', AuthenticationServiceFactory);

    /**
     * @ngdoc service
     * @name AuthenticationService
     * @module  appverse.security
     * @description Exposes some useful methods for apps developers.
     *
     * @requires UserService
     * @requires Base64
     * @requires https://docs.angularjs.org/api/ng/service/$http $http
     * @requires https://docs.angularjs.org/api/ng/service/$q $q
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires SECURITY_GENERAL
     */
    function AuthenticationServiceFactory(UserService, Base64, $http, $q, $log, SECURITY_GENERAL, $rootScope) {

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
                var encoded = Base64.encode(credentials.name + ':' + credentials.password);

                return $http({
                    method: SECURITY_GENERAL.loginHTTPMethod,
                    url: SECURITY_GENERAL.loginURL,
                    headers: {
                        'Authorization': 'Basic ' + encoded,
                        'Content-Type': SECURITY_GENERAL.Headers_ContentType
                    },
                    timeout: 30000,
                    cache: false
                });
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
                var self = this;

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

                        self.logOut();
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

                UserService.setCurrentUser({
                    name: name,
                    roles: roles,
                    bToken: bToken,
                    xsrfToken: xsrfToken,
                    isLogged: isLogged
                });
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
            logOut: function () {
                UserService.removeUser();
                $rootScope.$emit('$locationChangeStart');
            }

        };
    }

})();
