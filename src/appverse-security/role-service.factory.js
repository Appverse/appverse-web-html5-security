(function () {
    'use strict';

    angular.module('appverse.security').factory('RoleService', RoleServiceFactory);

    /**
     * @ngdoc service
     * @name appverse.security.factory:RoleService
     * @requires $log
     * @requires AppConfiguration.constant:AUTHORIZATION_DATA
     * @requires AppCache.factory:CacheFactory
     * @description
     * Manages user's roles.
     */
    function RoleServiceFactory($log, AUTHORIZATION_DATA, CacheFactory) {

        return {
            /**
             * @ngdoc method
             * @name appverse.security.factory:RoleService#validateRoleAdmin
             * @methodOf appverse.security.factory:RoleService
             * @description Check if the passed user has a role in the adminsitrator family
             * @returns {boolean} True if the role of the usder has admin previleges
             */
            validateRoleAdmin: function () {
                var roles = CacheFactory._browserCache.get('loggedUser').roles;
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
             * @methodOf appverse.security.factory:RoleService
             * @param {string} role The role to be validated
             * @description Check if the passed user has a given role
             * @returns {boolean} True if the user has that role
             */
            validateRoleInUserOther: function (role) {
                var user = CacheFactory._browserCache.get('loggedUser');
                if (user) {
                    return _.contains(role, user.roles);
                } else {
                    return false;
                }

            }
        };
    }

})();
