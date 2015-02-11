(function() {
    'use strict';

    angular.module('appverse.security').factory('AuthenticationService', AuthenticationServiceFactory);

    /**
     * @ngdoc service
     * @name appverse.security.factory:AuthenticationService
     * @requires appverse.security.factory:UserService
     * @description
     * Exposes some useful methods for apps developers.
     */
    function AuthenticationServiceFactory ($rootScope, UserService, Base64, $http, $q, $log, SECURITY_GENERAL) {

        return {
            sendLoginRequest: function (credentials) {
                var deferred = $q.defer();
                var encoded = Base64.encode(credentials.name + ':' + credentials.password);

                $http({
                    method: SECURITY_GENERAL.loginHTTPMethod,
                    url: SECURITY_GENERAL.loginURL,
                    headers: {
                        'Authorization': 'Basic ' + encoded,
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
                    })
                    .error(function (data, status) {
                        deferred.reject(data, status);
                    });
                return deferred.promise;
            },

            sendLogoutRequest: function (credentials) {
                var deferred = $q.defer();

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
                    })
                    .error(function (data, status) {
                        deferred.reject(data, status);
                    });
                return deferred.promise;
            },

            /**
             * @ngdoc method
             * @name appverse.security.factory:AuthenticationService#login
             * @methodOf appverse.security.factory:AuthenticationService
             * @param {string} name Name of the user
             * @param {object} roles Set of roles of the user as array
             * @param {string} token The token from the oauth server
             * @param {boolean} isLogged If the user is logged or not
             * @param {string} role The role to be validated
             * @description Sets the new logged user
             */
            login: function (name, roles, bToken, xsrfToken, isLogged) {
                //$log.debug(' -- bToken -- : ' + bToken);
                var user = new User(name, roles, bToken, xsrfToken, isLogged);
                $log.debug(user.print());
                UserService.setCurrentUser(user);
            },
            /**
             * @ngdoc method
             * @name appverse.security.factory:AuthenticationService#isLoggedIn
             * @methodOf appverse.security.factory:AuthenticationService
             * @param {string} role The role to be validated
             * @description Check if the user is logged
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
             * @name appverse.security.factory:AuthenticationService#logOut
             * @methodOf appverse.security.factory:AuthenticationService
             * @param {appverse.security.global:User} user The User object to be logged out
             * @description Removes the current user from the app
             */
            logOut: function (user) {
                UserService.removeUser(user);
            }

        };
    }

})();