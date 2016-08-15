'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        // var routeChecks = {
        //     authenticated: ['$q', 'authentication', function ($q, authentication) {
        //         if (authentication.isLogged()) {
        //             return $q.when(true);
        //         }
        //
        //         return $q.reject('Unauthorized Access');
        //     }]
        // };

        $routeProvider.when('/', {
            templateUrl: 'home/home.html',
            controller: 'HomeCtrl',
            activetab: 'home',
            // resolve: routeChecks.authenticated
        });
    }])

    .controller('HomeCtrl', ['$rootScope', '$scope', 'facebook',
        function ($rootScope, $scope, facebook) {

            $scope.msg = "This will be news feed.";


            // let init = function () {
            //     kinveyConfig.authorize.then(function () {
            //         $rootScope.currentUser = Kinvey.getActiveUser();
            //         if (!$rootScope.currentUser) {
            //             console.log("No active user");
            //         }
            //
            //         let promise = Kinvey.File.stream($rootScope.currentUser.profile_picture);
            //         promise.then(function (image) {
            //             $rootScope.profPic = image;
            //         }, function (error) {
            //             console.log(error);
            //         })
            //     });
            // };
            //
            // init();
        }]);