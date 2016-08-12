(function() {
    'use strict';

    ////////////////////////////////////////////////////////////////////////////
    // COMMON API - 0.1
    // SECURITY
    // PRIMARY MODULE (appverse.security)
    // CONFIG KEY: AD
    ////////////////////////////////////////////////////////////////////////////
    // 2 services
    // A-AUTHENTICATION
    // Protect username and password
    // Manages authentication operations
    // Handles user session
    //
    // B-INTERNAL AUTHORIZATION
    // It handles access to site sections
    // Includes roles management and rights checking
    //////////////////////////////////////////////////////////////////////////////
    // NOTES
    // 1-INNER STRUCTURE
    // The module comprises 4 services and one directive.
    // It must be pre-configured.
    // DIRECTIVE: oauth
    // FACTORY: Oauth_AccessToken
    // FACTORY: Oauth_Endpoint
    // FACTORY: Oauth_RequestWrapper
    // FACTORY: Oauth_Profile
    // CONFIGURATION: SECURITY_OAUTH
    //////////////////////////////////////////////////////////////////////////////

    /**
     * @ngdoc module
     * @name appverse.security
     *
     * @description
     * 2 services:
     *
     *  A-AUTHENTICATION
     *  Protect username and password
     *  Manages authentication operations
     *  Handles user session
     *
     * B-INTERNAL AUTHORIZATION
     *  It handles access to site sections
     *  Includes roles management and rights checking
     *
     * @requires https://docs.angularjs.org/api/ngCookies  ngCookies
     * @requires AppCache
     * @requires AppConfiguration
     * @requires AppUtils
     * @requires AppREST
     */
    configModule.$inject = ["$provide", "$httpProvider", "ModuleSeekerProvider"];
    run.$inject = ["$log"];
    angular.module('appverse.security', [
            'ngCookies', // Angular support for cookies
            'appverse.configuration', // Common API Module
            'appverse.utils',
            'ngResource'
        ])
        .config(configModule)
        .run(run);

    function configModule($provide, $httpProvider, ModuleSeekerProvider) {

        if (!ModuleSeekerProvider.exists('appverse.cache')) {

            //appverse.cache module not found. Adding basic CacheFactory.
            $provide.factory('CacheFactory', ["$cacheFactory", function($cacheFactory) {
                return {
                    _browserCache: $cacheFactory('basicCache')
                };
            }]);
        }

        var requestInterceptor = ['$q', '$location', '$injector',
            function($q, $location, $injector) {
                var interceptorInstance = {
                    request: function(config) {
                        var url = config.url;
                        var roleService = $injector.get('NewRoleService');
                        if (roleService.isPublicRoute(url)) {
                            //O si es válida para el tipo de usuario
                        } else {
                            //si no tiene permisos se le redirecciona
                            config.url = roleService.getRedirectionUrl();
                        }
                        return config || $q.when(config);
                    }
                };
                return interceptorInstance;
            }
        ];

        $httpProvider.interceptors.push(requestInterceptor);


        var logsOutUserOn401 = ['$q', '$location', function($q, $location) {

            return {
                'responseError': function(rejection) {
                    if (rejection.status === 401) {
                        //Redirects them back to main/login page
                        $location.path('/home');

                        return $q.reject(rejection);
                    } else {
                        return $q.reject(rejection);
                    }
                }
            };

        }];

        $provide.factory('logsOutUserOn401', logsOutUserOn401);
        $httpProvider.interceptors.push('logsOutUserOn401');


    }

    function run($log) {
        $log.debug('appverse.security run');
    }

})();

(function() {
    'use strict';

    AuthenticationServiceFactory.$inject = ["$rootScope", "UserService", "Base64", "$http", "$q", "$log", "SECURITY_GENERAL"];
    angular.module('appverse.security').factory('AuthenticationService', AuthenticationServiceFactory);

    /**
     * @ngdoc service
     * @name AuthenticationService
     * @module  appverse.security
     * @description Exposes some useful methods for apps developers.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$rootScope $rootScope
     * @requires UserService
     * @requires Base64
     * @requires https://docs.angularjs.org/api/ng/service/$http $http
     * @requires https://docs.angularjs.org/api/ng/service/$q $q
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires SECURITY_GENERAL
     */
    function AuthenticationServiceFactory ($rootScope, UserService, Base64, $http, $q, $log, SECURITY_GENERAL) {

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

            /**
             * @ngdoc method
             * @name  AuthenticationService#sendLogoutRequest
             * @description Send the login request based on Basic Authorization
             *
             * @return {object}             A promise resolving to the response
             */
            sendLogoutRequest: function () {
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
                //$log.debug(' -- bToken -- : ' + bToken);
                var user = new User(name, roles, bToken, xsrfToken, isLogged);
                $log.debug(user.print());
                UserService.setCurrentUser(user);
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
            logOut: function (user) {
                UserService.removeUser(user);
            }

        };
    }

})();
(function() {
    'use strict';

    NewRoleServiceFactory.$inject = ["$log", "ROLE_DATA", "CacheFactory"];
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

(function () {
    'use strict';

    RoleServiceFactory.$inject = ["$log", "AUTHORIZATION_DATA", "CacheFactory"];
    angular.module('appverse.security').factory('RoleService', RoleServiceFactory);

    /**
     * @ngdoc service
     * @name RoleService
     * @module  appverse.security
     * @description Manages user's roles.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$log $log
     * @requires AUTHORIZATION_DATA
     * @requires CacheFactory
     */
    function RoleServiceFactory($log, AUTHORIZATION_DATA, CacheFactory) {

        return {

            /**
             * @ngdoc method
             * @name RoleService#validateRoleAdmin
             * @description Check if the passed user has a role in the adminsitrator family
             *
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
             * @description Check if the passed user has a given role
             *
             * @param {string} role The role to be validated
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

(function () {
    'use strict';

    UserServiceFactory.$inject = ["$log", "CacheFactory"];
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
    function UserServiceFactory($log, CacheFactory) {

        return {
            /**
             * @ngdoc method
             * @name UserService#setCurrentUser
             * @description Writes the current user in cache ('loggedUser').
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
             * @description Retrieves the current user from cache ('loggedUser').
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
             */
            removeUser: function () {
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
