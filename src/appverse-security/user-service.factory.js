(function() {
    'use strict';

    angular.module('appverse.security').factory('UserService', UserServiceFactory);

    /**
     * @ngdoc service
     * @name UserService
     * @module appverse.security
     *
     * @description
     * Handles the user in the app.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires CacheFactory
     */
    function UserServiceFactory ($log, CacheFactory) {

        return {
            /**
             * @ngdoc method
             * @name UserService#setCurrentUser
             * @description Writes the current user in cache ('currentUser').
             *
             * @param {object} loggedUser The currently logged user
             */
            setCurrentUser: function (loggedUser) {

                CacheFactory._browserCache.put('loggedUser', {
                    username: loggedUser.name,
                    roles: loggedUser.roles,
                    bToken: loggedUser.bToken,
                    xsrfToken: loggedUser.xsrfToken,
                    isLogged: loggedUser.isLogged
                });

                $log.debug('New user has been stored to cache.');
            },
            /**
             * @ngdoc method
             * @name UserService#getCurrentUser
             * @description Retrieves the current user from cache ('currentUser').
             * @returns {appverse.security.global:User} The currently logged user
             */
            getCurrentUser: function () {
                var loggedUser = CacheFactory._browserCache.get('loggedUser');

                if (loggedUser && loggedUser.isLogged) {
                    return new User(loggedUser.username, loggedUser.roles, loggedUser.bToken, loggedUser.xsrfToken, loggedUser.isLogged);
                }
            },
            /**
             * @ngdoc method
             * @name UserService#removeUser
             * @description Removes the current user from the app, including cache.
             *
             * @param {User} loggedUser The currently logged user
             */
            removeUser: function (loggedUser) {
                CacheFactory._browserCache.remove('loggedUser');
            }
        };
    }


    /**
     * @ngdoc object
     * @name User
     * @module appverse.security
     * @description Entity with main data about a user to be handled by the module
     *
     * @param {string} name The name of the user to be registered
     * @param {object} roles Array with the list of assigned roles
     * @param {string} bToken The provided encrypted oauth token
     * @param {int} xsrfToken The XSRF token provided by the server
     * @param {boolean} isLogged The user is logged or not
     */
    function User(name, roles, bToken, xsrfToken, isLogged) {
        this.name = name;
        //Array
        this.roles = roles;
        //string
        this.bToken = bToken;
        //string
        this.xsrfToken = xsrfToken;
        //boolean
        this.isLogged = isLogged;
    }

    User.prototype.print = function () {
        return 'User data. Name:' + this.name + '| Roles: ' + this.roles.toString() + '| Bearer Token: ' + this.bToken + '| XSRFToken: ' + this.xsrfToken + '| Logged: ' + this.isLogged;
    };

})();