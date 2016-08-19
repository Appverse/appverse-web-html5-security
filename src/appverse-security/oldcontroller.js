angular.module('appverse.security')

.controller('SecurityController',
    function($scope, $log, $http, $window, $interval, $rootScope, $state) {

        'use strict';

        $log.debug('SecurityController');

        $scope.url = $window.location.origin + $window.location.pathname + '#' + $state.current.url;

        $scope.remembered = JSON.parse(localStorage.getItem('remember'));

        var response = JSON.parse(localStorage.getItem('oauth_response'));

        $log.debug('localStorage oauth_response', response);

        if (response) {
            checkResponse(response);
        }

        var expirationInterval;

        var code = localStorage.getItem('code');

        if (code) {
            $log.debug('localStorage code', code);
            getToken(code);
            localStorage.removeItem('code');
        } else if (!$scope.isAuthenticated) {
            $scope.isAuthenticated = false;
        }

        $scope.remember = function() {

            $log.debug('remembered', $scope.remembered);

            if ($scope.remembered) {
                localStorage.setItem('remember', true);
            } else {
                localStorage.removeItem('remember');
            }
        };

        $scope.logOut = function() {

            $http({
                method: 'POST',
                url: '/oauth-server/api/sec/logout',
                data: $.param({
                    access_token: $scope.oauth_response.access_token
                })
            }).then(function(response) {
                $log.debug('logOut response', response);
                $scope.logOutSuccess = true;

                localStorage.removeItem('oauth_response');
                localStorage.removeItem('token_date');
                $scope.isAuthenticated = false;
                $scope.oauth_response = null;
                $interval.cancel(expirationInterval);
            });
        };


        function refreshToken() {

            $log.debug('refreshToken');

            if (!$scope.oauth_response || !$scope.oauth_response.refresh_token) {
                return {
                    then: function(callback) {
                        callback({
                            status: 400
                        });
                    }
                };
            }

            $scope.refreshingToken = true;

            return $http({
                method: 'POST',
                url: '/oauth-server/oauth/token',
                data: $.param({
                    code: code,
                    grant_type: 'refresh_token',
                    refresh_token: $scope.oauth_response.refresh_token,
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'authorization': 'Basic ' + btoa('oauth-server-showcase-client:our-secret')
                }
            }).then(function(response) {
                $log.debug('refreshToken success', response);

                $scope.oauth_response = response.data;

                if (localStorage.getItem('remember')) {
                    localStorage.setItem('oauth_response', JSON.stringify($scope.oauth_response));
                } else {
                    localStorage.removeItem('oauth_response');
                }
                localStorage.setItem('token_date', new Date().getTime());

                checkResponse($scope.oauth_response);

                setTimeout(function() {
                    $scope.refreshingToken = false;
                }, 1000);

                return response;
            }, function(response) {
                $log.debug('refreshToken error', response);
                return response;
            });
        }

        function getToken(code) {

            $log.debug('getToken', code);

            $http({
                method: 'POST',
                url: '/oauth-server/oauth/token',
                data: $.param({
                    code: code,
                    grant_type: 'authorization_code',
                    client_id: 'oauth-server-showcase-client',
                    redirect_uri: $window.location.href
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'authorization': 'Basic ' + btoa('oauth-server-showcase-client:our-secret')
                }
            }).success(function(response) {
                $log.debug('getToken success', response);

                $scope.oauth_response = response;

                if (localStorage.getItem('remember')) {
                    localStorage.setItem('oauth_response', JSON.stringify($scope.oauth_response));
                } else {
                    localStorage.removeItem('oauth_response');
                }
                localStorage.setItem('token_date', new Date().getTime());

                checkResponse($scope.oauth_response);
            }).error(function(response, statusCode) {
                $log.debug('getToken error', response);

                if (statusCode === 400) {
                    $scope.isAuthenticated = false;
                }
            });
        }

        function send(refresh) {

            if (refresh) {
                $scope.isSending = true;
                $scope.sendLogResponse = null;
            } else {
                $scope.isSending2 = true;
                $scope.sendLogResponse2 = null;
            }

            $http({
                method: 'POST',
                url: '/oauth-server/api/remotelog/log',
                data: {
                    "logLevel": "DEBUG",
                    "message": "string",
                    "userAgent": "string"
                },
                headers: {
                    'authorization': 'Bearer ' + $scope.oauth_response.access_token
                },
            }).success(function(data, status, headers) {
                $log.debug('remotelog response', data);
                if (refresh) {
                    $scope.isSending = false;
                    $scope.sendLogResponse = {
                        statusCode: status,
                        body: data,
                        headers: headers()
                    };
                } else {
                    $scope.isSending2 = false;
                    $scope.sendLogResponse2 = {
                        statusCode: status,
                        body: data,
                        headers: headers()
                    };
                }
            }).error(function(response, statusCode) {
                $log.debug('remotelog error', response);
                $rootScope.preventNextLocation = true;
                if (refresh) {
                    $scope.isSending = false;
                    $scope.sendLogResponse = response;
                } else {
                    $scope.isSending2 = false;
                    $scope.sendLogResponse2 = response;
                    if (statusCode === 401) {
                        refreshToken().then(function(response) {
                            if (response.status === 200) {
                                send();
                            }
                        });
                    }
                }
            });
        }
    });
