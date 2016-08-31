'use strict';

angular.module('security-demo-app')

.controller('loginController', function ($log, $scope, AuthenticationService) {

    $log.debug('loginController');

    $scope.login = function () {

        $scope.errorStatus = null;

        AuthenticationService.sendLoginRequest({
            name: $scope.username,
            password: $scope.password
        }).then(function (response) {

            var data = response.data;

            $log.debug('Login request successful.', data);

            AuthenticationService.login(data.name, data.roles, data.bToken, data.xsrfToken, true);
        }, function (response) {

            $log.debug('Login request failed with response: ', response);

            $scope.errorStatus = response.status;
        });
    };
});
