angular.module('conference.blogs', ['ionic', 'ngResource', 'conference.config', 'conference.push'])

    // Routes
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.blogs', {
                url: "/blogs",
                views: {
                    'menuContent': {
                        templateUrl: "templates/blogs.html",
                        controller: "BlogsCtrl"
                    }
                }
            });

    })
  .constant("BuzzTabs", [
    {text:"LATEST"},
    {text:"FAVORITES"},
    {text:"MY POSTS"}
  ])
    .controller('BlogsCtrl', function ($scope, BuzzTabs, UIHelper, $ionicBackdrop, $ionicModal, $rootScope, SERVER_PATH, $ionicActionSheet, $timeout) {
        $scope.init = function () {
          $scope.tabs = BuzzTabs;
          $scope.selTab = 0;

            $ionicModal.fromTemplateUrl('templates/searchpad.html', {
                scope: $scope,
                animation: 'slide-in-up',
                controller: 'BlogsCtrl'
            }).then(function (modal) {
                $scope.searchPad = modal;
            });

          //Cleanup the modal when we're done with it!
          $scope.$on('$destroy', function () {
              $scope.searchPad.remove();
          });
          // Execute action on hide modal
          $scope.$on('modal.hidden', function () {
              // Execute action
          });
          // Execute action on remove modal
          $scope.$on('modal.removed', function () {
              // Execute action
          });

          $(".buzz-searchbox").on("keydown", function(evt) {
            if (evt.keyCode == 9 || evt.keyCode == 13) {
              //you got tab i.e "NEXT" Btn
              $rootScope.onSearch($(".buzz-searchbox").val());
              $(".buzz-searchbox").blur();
            }
          });


          $rootScope.onSearch = function (keyword) {
              $scope.searchPad.hide();

              $rootScope.mode = "search";
              $rootScope.keyword = keyword;

              //$rootScope.postTitle = "Search Result for " + keyword;

              $scope.$broadcast('load_blogs');
          };

          $scope.title = $rootScope.selectedCategory;

          $scope.setSortMode( typeof ($rootScope.sortMode) == "undefined" ? 0 : $rootScope.sortMode);

            //$scope.fetchBlogs();
        };

      $scope.onTab = function(index) {
        if ($scope.selTab == index) {
          return;
        }

        $scope.selTab = index;

        // Latest
        if (index == 0) {
          $rootScope.mode = "category";
          $rootScope.category = -1;

          $rootScope.$broadcast('load_blogs');
        }
        // Favorites
        else if (index == 1) {
          if (!$rootScope.signedIn()) {
            UIHelper.alert("MY FAVORITES", "You should login first.");
            $scope.onTab(0);
            return;
          }

          $rootScope.mode = "favorites";
          $rootScope.category = -1;

          $rootScope.$broadcast('load_blogs');
        }
        // My posts
        else if (index == 2) {
          if (!$rootScope.signedIn()) {
            UIHelper.alert("MY POSTS", "You should login first.");
            $scope.onTab(0);
            return;
          }

          $rootScope.mode = "my_posts";
          $rootScope.category = -1;

          $rootScope.$broadcast('load_blogs');
        }
      };

      $scope.getTabStatus = function(index) {
        return $scope.selTab == index ? "selected" : "";
      };
      $scope.getTitle = function () {
          if ($rootScope.mode == "search") {
              return "Search result for " + $rootScope.keyword;
          }
          else if ($rootScope.mode == "category") {
              if ($rootScope.selectedCategory == -1)
                  return "HOME";
              else {
                  if (typeof($rootScope.categories[$rootScope.selectedCategory]) != "undefined")
                      return $rootScope.categories[$rootScope.selectedCategory].name;

                  return "";
              }
          }
          else if ($rootScope.mode == "my_posts") {
              return "MY POSTS";
          }
          else if ($rootScope.mode == "favorites") {
              return "MY FAVORITES"
          }

          return "";
      }


      $scope.onClick = function () {
          if ($scope.isBackdropShowing) {
              $scope.isBackdropShowing = false;
              $ionicBackdrop.release();
          }
      }

      $scope.showSearchBox = function () {
          $rootScope.mode = "search";
          //$scope.searchPad.show();
      }

      $scope.showSortModes = function () {
          var sortBtns = [];

          for (var i in $rootScope.sortModes) {
              sortBtns.push({ text: "<div class='buzz-btn-sort-mode-title'><div class='buzz-hidden selected-sort-mode-indent'></div><i >" + $rootScope.sortModes[i].fullName + "</i></div>" });
          }

          var hideSheet = $ionicActionSheet.show({
              buttons: sortBtns,
              buttonClicked: $scope.setSortMode
          });

          var interval = setInterval(function () {
              if ($scope.setMarkSortMode($rootScope.sortModeIndex)) {
                  clearInterval(interval);
              }

          }, 300);
      };

      $scope.setMarkSortMode = function (index) {
          var target = $($('.buzz-btn-sort-mode-title .selected-sort-mode-indent')[$rootScope.sortModeIndex = index]);

          if (target.length == 0)
              return false;

          $('.buzz-btn-sort-mode-title .selected-sort-mode-indent').addClass("buzz-hidden");
          target.removeClass("buzz-hidden");

          return true;
      }

      $scope.isSorted = function() {
        return !($rootScope.order == "dec" && $rootScope.orderby == "DATE");
      }

      $scope.clearSort = function() {
        $scope.setSortMode(0);
      }

      $scope.setSortMode = function (index) {
          $scope.setMarkSortMode($rootScope.sortMode = index);

          $scope.sortName = $rootScope.sortModes[index].fullName;

          var chevron = $(".btn-sort");
          var sortMode = Math.floor(index / 2);

          if (index % 2 == 0) {
              chevron.removeClass("ion-chevron-up").addClass("ion-chevron-down");
              $rootScope.order = sortMode == 0 ? "dec" : "asc";
          }
          else {
              chevron.removeClass("ion-chevron-down").addClass("ion-chevron-up");
              $rootScope.order = sortMode == 0 ? "asc" : "dec";
          }

          //$rootScope.order = ( (index % 2 ) == 0) ? "asc" : "dec";

          if      (sortMode == 0) {
              $rootScope.orderby = "DATE";
          }
          else if (sortMode == 1) {
              $rootScope.orderby = "POPULARITY";
          }
          else if (sortMode == 2) {
              $rootScope.orderby = "COMMENTS";
          }


          $scope.$broadcast('load_blogs');

          return true;
      }
    });
