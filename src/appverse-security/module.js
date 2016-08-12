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
            $provide.factory('CacheFactory', function($cacheFactory) {
                return {
                    _browserCache: $cacheFactory('basicCache')
                };
            });
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
