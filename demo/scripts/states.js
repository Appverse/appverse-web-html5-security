'use strict';

angular.module('security-demo-app')

.config(function ($urlRouterProvider, $stateProvider) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider

        .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'loginController'
    })

    .state('admin', {
        url: '/admin',
        templateUrl: 'views/admin.html'
    })

    .state('customer', {
        url: '/customer',
        templateUrl: 'views/customer.html'
    })

    .state('routeDenied', {
        url: '/routeDenied',
        templateUrl: 'views/routeDenied.html'
    })

    .state('profile', {
        url: '/profile',
        templateUrl: 'views/profile.html'
    })

    .state('help', {
        url: '/help',
        templateUrl: 'views/help.html'
    });
});
