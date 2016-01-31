angular.module('conference.profiles', ['conference.config'])

    .config(function ($stateProvider, FB_APP_ID) {

        //openFB.init({appId: FB_APP_ID});

        $stateProvider

            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/profile.html",
                        controller: "ProfileCtrl"
                    }
                }
            });
    })
  .constant("ProfileTabs", [
    {text:"ABOUT ME"},
    {text:"MY POSTS"},
    {text:"MY FAVORITES"}
  ])

    .controller('ProfileCtrl', function ($scope, $state, $ionicActionSheet, ProfileTabs, $rootScope) {
        $scope.init = function () {
          $scope.tabs = ProfileTabs;
          $scope.selTab =  0;
            $scope.profile = {
                src: "img/no-avatar.png",
                name: $rootScope.userInfo.name,
                aboutme: "I love long walks on the beach."
            };

            $scope.profileView = "templates/aboutme.html";
        };

    $scope.onTab = function(index) {
      if ($scope.selTab == index) {
        return;
      }

      $scope.selTab = index;

      if (index == 0) {
        $scope.profileView = "templates/aboutme.html";
      }
      else {
        if (index == 1)
          $rootScope.mode = "my_posts";
        else if (index == 2)
          $rootScope.mode = "favorites";

        $scope.profileView = "templates/posts.html";
        $rootScope.$broadcast('load_blogs');
      }
    };

    $scope.onMenu = function() {
      var menus = [];

      //for (var i in $rootScope.sortModes) {
      menus.push({ text: "<div class='buzz-profile-menu-item buzz-btn-sort-mode-title'><i>Edit profile</i></div>" });

      var hideSheet = $ionicActionSheet.show({
        buttons: menus,
        buttonClicked: $scope.onMenuClicked
      });
    };

    $scope.onMenuClicked = function(index) {
      if (index == 0) {
        $state.go("app.editprofile");
      }
    };

    $scope.getTabStatus = function(index) {
      return $scope.selTab == index ? "selected" : "";
    };

        $scope.onClick = function (mode) {
            if (mode == "about") {
                $scope.profileView = "templates/aboutme.html";
            }
            else if (mode == "favorites" || mode == "my_posts") {
                $rootScope.mode = mode;
                $scope.profileView = "templates/posts.html";

                $rootScope.$broadcast('load_blogs');
            }
        };
    });
