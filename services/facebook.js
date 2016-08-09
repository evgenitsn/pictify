angular.module('myApp.facebook', [])
    .factory('facebook', ['$q', '$kinvey', function ($q, $kinvey) {

        function getLoginStatus() {
            var deferred = $q.defer();
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    return deferred.resolve(response.authResponse);
                }
                FB.login(function (response) {
                    deferred.resolve(response.authResponse);
                });
            });
            return deferred.promise;
        }

        function getLastName() {
            var deferred = $q.defer();
            FB.api('/me', {
                fields: 'last_name'
            }, function (response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                } else {
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        }

        function getProfilePicture(userId) {
            var deferred = $q.defer();
            FB.api(
                "/" + userId + "/picture?width=300",
                function (response) {
                    if (response && !response.error) {
                        deferred.resolve(response);
                    }
                    else {
                        deferred.reject('Error occured');
                    }
                });
            return deferred.promise;
        }

        function updateUserInfo(key, value) {
            var user = $kinvey.getActiveUser();
            // console.log(user);
            user[key] = value;
            var promise = $kinvey.User.update(user);
            promise.then(function (user) {
                // console.log(user);
            }, function (err) {
                // console.log(err);
            });
        }


        return {
            getLastName: getLastName,
            getProfilePicture: getProfilePicture,
            updateUserInfo: updateUserInfo,
            getLoginStatus: getLoginStatus
        }
    }]);