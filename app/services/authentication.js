angular.module('pictifyApp.authentication', [])
    .factory('authentication', ['$rootScope', '$kinvey', 'kinveyConfig', '$route', '$location',
        function ($rootScope, $kinvey, kinveyConfig, $route, $location) {

            function registerUser(user) {
                kinveyConfig.authorize
                    .then(function () {
                        let promise = $kinvey.User.signup({
                            username: user.username,
                            password: user.password,
                            profile_picture: '57b62a7420a1306254c52f29', // Anonymous profile pic assigned
                            fullname: user.fullname,
                            followersCount: 0,
                            followingCount: 0
                        });
                        promise.then(function (user) {
                            $rootScope.currentUser = $kinvey.getActiveUser();

                            let profilePicture = {
                                _id: "57b62a7420a1306254c52f29",
                            };

                            user.profilePicture = profilePicture;

                            let social = {
                                _id: $rootScope.currentUser._id,
                                _acl: {
                                    gr: true,
                                    gw: true
                                },
                                followers: {},
                                following: {}
                            };

                            $kinvey.DataStore.save('socials', social)
                                .then(function (success) {
                                }, function (error) {
                                    console.log(error);
                                });

                            $kinvey.User.update(user, {
                                exclude: ['profilePicture'],
                                relations: {profilePicture: "pictures"}
                            });
                            // // $route.reload();
                            $location.path("/profile");
                        }, function (err) {
                            console.log(err);
                        });
                    });
            }

            function loginUser(user) {
                kinveyConfig.authorize
                    .then(function () {
                        let promise = $kinvey.User.login({
                            username: user.username,
                            password: user.password
                        });
                        promise.then(function (user) {
                            $rootScope.currentUser = $kinvey.getActiveUser();
                            let promise = $kinvey.DataStore.get("pictures", $rootScope.currentUser.profile_picture);
                            promise.then(function (pic) {
                                $rootScope.profPic = pic;
                                $location.path("/profile")
                            }, function (error) {
                                console.log(error);
                            })
                        }, function (err) {
                            console.log(err);
                        });
                    })
            }

            function logout() {
                kinveyConfig.authorize
                    .then(function () {
                        $rootScope.currentUser = $kinvey.getActiveUser();
                        let user = $rootScope.currentUser;
                        if (user !== null) {
                            let promise = $kinvey.User.logout();
                            promise.then(function (success) {
                                $rootScope.currentUser = null;
                                $rootScope.profPic = null;
                                localStorage.removeItem("Kinvey.kid_BkwgJlt_.activeUser");
                                $location.path('/login');
                            }, function (err) {
                                console.log(err);
                            });
                        }
                    })
            }

            function isLogged() {
                let user = $rootScope.currentUser;
                if (!user) {
                    $location.path("/login");
                    return false;
                }
                return true;
            }

            function changePassword(newPass) {
                let user = $rootScope.currentUser;
                user.password = newPass;
                let promise = $kinvey.User.update(user);
                promise.then(function (user) {
                }, function (err) {
                    console.log(err);
                });

            }

            function changeFullName(fullname) {
                let user = $rootScope.currentUser;
                user.fullname = fullname;
                let promise = $kinvey.User.update(user);
                promise.then(function (user) {
                }, function (err) {
                    console.log(err);
                });
            }

            function changeUserName(username) {
                let user = $rootScope.currentUser;
                user.username = username;
                let promise = $kinvey.User.update(user);
                promise.then(function (user) {
                }, function (err) {
                    console.log(err);
                });
            }

            return {
                registerUser: registerUser,
                loginUser: loginUser,
                logout: logout,
                changePassword: changePassword,
                isLogged: isLogged,
                changeFullName: changeFullName,
                changeUserName: changeUserName
            }
        }]);