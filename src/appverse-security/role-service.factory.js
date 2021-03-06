(function () {
    'use strict';

    angular.module('appverse.security').factory('RoleService', RoleServiceFactory);

    /**
     * @ngdoc service
     * @name RoleService
     * @module  appverse.security
     * @description Manages user's roles.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires AUTHORIZATION_DATA
     * @requires avCacheFactory
     */
    function RoleServiceFactory($log, AUTHORIZATION_DATA, avCacheFactory, UserService, SECURITY_GENERAL, $location) {

        return {

            /**
             * @ngdoc method
             * @name RoleService#validateRoleAdmin
             * @description Check if the passed user has a role in the adminsitrator family
             *
             * @returns {boolean} True if the role of the usder has admin previleges
             */
            validateRoleAdmin: function () {
                var roles = avCacheFactory._browserCache.get('loggedUser').roles;
                $log.debug('roles in session: ' + roles);

                var result;
                if (roles && AUTHORIZATION_DATA.adminRoles) {
                    for (var j = 0; j < AUTHORIZATION_DATA.adminRoles.length; j++) {
                        if (_.contains(roles, AUTHORIZATION_DATA.adminRoles[j])) {
                            result = true;
                            break;
                        } else {
                            result = false;
                        }
                    }
                    return result;
                } else {
                    return false;
                }
            },

            /**
             * @ngdoc method
             * @name appverse.security.factory:RoleService#validateRoleInUserOther
             * @description Check if the passed user has a given role
             *
             * @param {string} role The role to be validated
             * @returns {boolean} True if the user has that role
             */
            validateRoleInUserOther: function (role) {
                var user = avCacheFactory._browserCache.get('loggedUser');
                if (user) {
                    return _.contains(role, user.roles);
                } else {
                    return false;
                }

            },

            /**
             * @ngdoc method
             * @name appverse.security.factory:RoleService#validateRoleInUserOther
             * @description Check if the passed user has a given role
             *
             * @param {string} role The role to be validated
             * @returns {boolean} True if the user has that role
             */
            isRouteAllowed: function () {

                if (!SECURITY_GENERAL.routes) {
                    return true;
                }

                var rolesAllowed = SECURITY_GENERAL.routes[$location.path()];

                if (rolesAllowed) {
                    var user = UserService.getCurrentUser();
                    if (user) {
                        return _.intersection(user.roles, rolesAllowed).length > 0;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }
        };
    }

})();
