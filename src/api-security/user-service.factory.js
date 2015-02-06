(function() {
    'use strict';

    angular.module('AppSecurity').factory('UserService', UserServiceFactory);

    /**
     * @ngdoc service
     * @name AppSecurity.factory:UserService
     * @requires $log
     * @requires AppCache.factory:CacheFactory
     * @description
     * Handles the user in the app.
     */
    function UserServiceFactory ($log, CacheFactory) {

        return {
            /**
             * @ngdoc method name, roles, bToken, xsrfToken, isLogged
             * @name AppSecurity.factory:UserService#setCurrentUser
             * @methodOf AppSecurity.factory:UserService
             * @param {AppSecurity.global:User} loggedUser The currently logged user
             * @description Writes the current user in cache ('currentUser').
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
             * @name AppSecurity.factory:UserService#getCurrentUser
             * @methodOf AppSecurity.factory:UserService
             * @description Retrieves the current user from cache ('currentUser').
             * @returns {AppSecurity.global:User} The currently logged user
             */
            getCurrentUser: function () {
                var loggedUser = CacheFactory._browserCache.get('loggedUser');

                if (loggedUser && loggedUser.isLogged) {
                    return new User(loggedUser.username, loggedUser.roles, loggedUser.bToken, loggedUser.xsrfToken, loggedUser.isLogged);
                }
            },
            /**
             * @ngdoc method
             * @name AppSecurity.factory:UserService#removeUser
             * @methodOf AppSecurity.factory:UserService
             * @param {AppSecurity.global:User} loggedUser The currently logged user
             * @description Removes the current user from the app, including cache.
             */
            removeUser: function (loggedUser) {
                CacheFactory._browserCache.remove('loggedUser');
            }
        };
    }


    /* @doc function
     * @name AppSecurity.global:User
     * @param {string} name The name of the user to be registered
     * @param {object} roles Array with the list of assigned roles
     * @param {string} bToken The provided encrypted oauth token
     * @param {int} xsrfToken The XSRF token provided by the server
     * @param {boolean} isLogged The user is logged or not
     * @description Entity with main data about a user to be handled by the module
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