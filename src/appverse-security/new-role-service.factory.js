(function() {
    'use strict';

    angular.module('appverse.security').factory('NewRoleService', NewRoleServiceFactory);

    function NewRoleServiceFactory($log, ROLE_DATA, CacheFactory) {

        return {

            validateRouteByRol: function(route, role) {
                $log.debug('validateRouteByRol: route->' + route + ' , role->' + role);
                var result = false;
                var routes;
                if (validateRole(role)) {
                    routes = getRoutesByRol(role);
                    if (routes != undefined) {
                        for (var i = 0; routes.length; i++) {
                            if (routes[i] == route) {
                                result = true;
                                return result;
                            }
                        }
                        for (var j = 0; publicRoutes.length; i++) {
                            if (publicRoutes[j] == route) {
                                result = true;
                                return result;
                            }
                        }
                    }
                }
                return result;
            },

            isPublicRoute: function(route) {
                $log.debug('isPublicRoute: route->' + route);
                var routes = getPublicRoutes();
                var result = false;
                if (routes) {
                    for (var i = 0; i < routes.length; i++) {
                        if (routes[i] == route) {
                            result = true;
                            return result;
                        }
                    }
                }
                return result;
            },

            getRedirectionUrl: function() {
                $log.debug('getRedirectionUrl');
                var route = ROLE_DATA.redirection;
                return route;
            },

            getPublicRoutes: function() {
                $log.debug('getPublicRoutes');
                var routes = ROLE_DATA.publicRoutes;
                return routes;
            },

            getRoutesByRol: function(role) {
                $log.debug('getRoutesByRol: role->' + role);
                var routes;
                if (validateRole(role)) {
                    for (var i = 0; ROLE_DATA.routerRoles.length; i++) {
                        if (_.contains(role, ROLE_DATA.routerRoles[i].roles)) {
                            routes = ROLE_DATA.routerRoles[i].routes;
                        }
                    }
                }
                return routes;
            },

            validateRole: function(role) {
                $log.debug('validateRole: role->' + role);
                if (ROLE_DATA.roles) {
                    for (var i = 0; ROLE_DATA.roles.length; i++) {
                        if (_.contains(role, ROLE_DATA.roles[i])) {
                            //Role is valid because is in the array
                            return true;
                        }
                    }
                }
            }

        };
    }

})();
