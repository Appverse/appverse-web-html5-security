(function () {
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
     * @requires avCacheFactory
     */
    function UserServiceFactory($log, avCacheFactory) {

        return {
            USER_CACHE_NAME: 'loggedUser',
            _currentUser: null,
            /**
             * @ngdoc method
             * @name UserService#setCurrentUser
             * @description Writes the current user in cache ('loggedUser').
             *
             * @param {object} loggedUser The currently logged user
             */
            setCurrentUser: function (user) {

                var newUser = new User(user.name, user.roles, user.bToken, user.xsrfToken, user.isLogged);

                avCacheFactory._browserCache.put(this.USER_CACHE_NAME, newUser);

                $log.debug('New user has been stored to browser cache.');

                this._currentUser = newUser;
            },
            /**
             * @ngdoc method
             * @name UserService#getCurrentUser
             * @description Retrieves the current user from cache ('loggedUser').
             * @returns {appverse.security.global:User} The currently logged user
             */
            getCurrentUser: function () {
                if (this._currentUser) {
                    return this._currentUser;
                } else {
                    var user = avCacheFactory._browserCache.get(this.USER_CACHE_NAME);

                    if (user && user.isLogged) {
                        this._currentUser = user;
                        return user;
                    } else {
                        return null;
                    }
                }
            },
            /**
             * @ngdoc method
             * @name UserService#removeUser
             * @description Removes the current user from the app, including cache.
             */
            removeUser: function () {
                this._currentUser = null;
                avCacheFactory._browserCache.remove(this.USER_CACHE_NAME);
                $log.debug('User has been removed from browser cache.');
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
