angular.module('conference.useragreement', ['conference.config'])
    .config(function ($stateProvider) {

       $stateProvider

            .state('app.useragreement', {
                url: "/useragreement",
                views: {
                    'menuContent': {
                        templateUrl: "templates/useragreement.html",
                        controller: "UserAgreementCtrl"
                    }
                }
            });
    })
    .controller('UserAgreementCtrl', function ($scope, $rootScope) {
        $scope.init = function () {
            
        }
    });