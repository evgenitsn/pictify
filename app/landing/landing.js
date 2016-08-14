'use strict';

angular.module('myApp.landing', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'landing/landing.html',
            controller: 'LandingCtrl',
            activetab: 'landing'
        });
    }])

    .controller('LandingCtrl', ['$rootScope', '$scope', '$q',
                                '$location', '$route', '$http',
                                'authentication', 'facebook', 'kinveyConfig',
        function ($rootScope, $scope, $q,
                  $location, $route, $http,
                  authentication, facebook, kinveyConfig) {

            $scope.login = function (user) {
                authentication.loginUser(user);
            };

            $scope.checkRegisterDetails = function (user) {
                authentication.registerUser(user);
            };

            $scope.loginFbk = function () {

                facebook.getLoginStatus()
                    .then(function (authResponse) {
                        var provider = 'facebook';
                        var tokens = {
                            'access_token': authResponse.accessToken,
                            'expires_in': authResponse.expiresIn
                        };
                        return Kinvey.User.loginWithProvider(provider, tokens).then(null, function (err) {
                            // Attempt to signup as a new user if no user with the identity exists.
                            if (Kinvey.Error.USER_NOT_FOUND === err.name) {
                                return Kinvey.User.signupWithProvider(provider, tokens)
                                .then(function (user) {
                                    return facebook.getProfilePicture(user._socialIdentity.facebook.id)
                                        .then(function (imageData) {
                                            console.log(imageData);
                                            let profilePicUrl = imageData.data.url;
                                            console.log(profilePicUrl);

                                            return $http.get(profilePicUrl, {responseType: "blob"})
                                                .then(function (response) {
                                                    console.log("https response");
                                                    console.log(response);
                                                    let profImageBlob = response.data;
                                                    return kinveyConfig.authorize
                                                        .then(function () {
                                                            return Kinvey.File.upload(profImageBlob, {
                                                                mimeType: profImageBlob.type,
                                                                size: profImageBlob.size,
                                                                _acl: {
                                                                    gr: true,
                                                                    gw: false
                                                                }
                                                            }, {public: true})
                                                                .then(function (success) {
                                                                    console.log("upload success");
                                                                    console.log(success);
                                                                    return success._id;
                                                                }, function (error) {
                                                                    console.log(error);
                                                                })
                                                                .then(function (imageId) {
                                                                    // Open comments, likes and dislike for pic
                                                                    return Kinvey.DataStore.save('pictures', {
                                                                        image: {
                                                                            _type: "KinveyFile",
                                                                            _id: imageId
                                                                        },
                                                                        _acl: {
                                                                            gr: true,
                                                                            gw: true
                                                                        },
                                                                        comments: [],
                                                                        votes: {
                                                                            likes: [],
                                                                            dislikes: []
                                                                        },
                                                                        caption: ''
                                                                    }, {public: true})
                                                                    .then(function (picture) {
                                                                        console.log("picture");
                                                                        console.log(picture);

                                                                        // Update user and return him
                                                                        let rawFacebookName = user._socialIdentity.facebook.name;
                                                                        let facebookUsernameParts = rawFacebookName.toLowerCase().split(' ');
                                                                        let facebookUsernameReady = facebookUsernameParts.join(".");

                                                                        user.username = facebookUsernameReady;
                                                                        user.profile_picture = picture._id;

                                                                        return Kinvey.User.update(user)
                                                                        .then(function (updatedUser) {
                                                                            $rootScope.currentUser = updatedUser;
                                                                            console.log("updatedUser: ");
                                                                            console.log(updatedUser);
                                                                            console.log("finished successfully");
                                                                            return updatedUser;
                                                                        }, function (error) {
                                                                            console.log(error)
                                                                        });
                                                                }, function (error) {
                                                                    console.log(error);
                                                                });
                                                            })
                                                        });
                                                    })
                                            }, function (error) {
                                                console.log("http response error!:");
                                                console.log(error);
                                            });
                                    }
                                );
                            }
                            return Kinvey.Defer.reject(err);
                        });
                    })
                    .then(function (user) {
                        console.log("user before path change");
                        $rootScope.currentUser = user;
                        console.log($rootScope.currentUser);
                        return $rootScope.currentUser;
                    }, function (error) {
                        console.log(error);
                    })
                    .then(function () {
                        console.log("changing path to profile");
                        $location.path("/profile");
                    });
                    };

            $scope.isRegistered = true;
            $scope.toggle = function () {
                $scope.isRegistered = !$scope.isRegistered;
            };

            // $scope.loginGoogle = function () {
            //     var promise = $kinvey.Social.connect(null, 'google', {redirect: 'http://localhost:8000'});
            //     console.log(promise);
            //     promise.then(function (user) {
            //         alert("VADETE UQ -> " + user.username)
            //     }, function (err) {
            //         alert("MAMKAMO OSRA SA -> " + err);
            //         console.log(err)
            //     });
            // };
            //
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