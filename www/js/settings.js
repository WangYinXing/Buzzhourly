angular.module('conference.settings', ['conference.config'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/settings.html",
                        controller: "SettingsCtrl"
                    }
                }
            })

    })

    // Services
    .factory('Speaker', function ($http, $rootScope, SERVER_PATH) {
        return {
            all: function() {
                return $http.get(SERVER_PATH + '/settings');
            },
            get: function(speakerId) {
                return $http.get(SERVER_PATH + '/settings/' + speakerId);
            }
        };
    })

    //Controllers
    .controller('SettingsCtrl', function ($scope, Speaker, SERVER_PATH) {
        $scope.serverPath = SERVER_PATH;
        $scope.speakers = [];

        Speaker.all().success(function(speakers) {
            $scope.speakers = speakers;
        });

        $scope.init = function () {
        }

        $scope.doRefresh = function() {
            $scope.speakers = Speaker.all().success(function(speakers) {
                $scope.speakers = speakers;
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.getVersion = function () {
            $scope.version = "1.0";
        };

        $scope.getVersion();
    })
