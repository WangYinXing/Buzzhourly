var pictureSource;
var destinationType;

angular.module('conference', ['ionic', 'ngCordova', 'wu.masonry', 'conference.blogs', 'conference.settings', 'conference.profiles', 'conference.posts', 'conference.postdetail', 'conference.useragreement', 'conference.editprofile', 'ngOpenFB'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
          // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
          // for form inputs)
          /*
          if (window.cordova && window.cordova.plugins.Keyboard) {
              cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          }
          */
          if (window.StatusBar) {
              // org.apache.cordova.statusbar required
              StatusBar.styleDefault();
          }
          if (navigator.camera) {
            pictureSource = navigator.camera.PictureSourceType;
            destinationType = navigator.camera.DestinationType;
          }
        });
    })

  .constant("MenuItems", [
    {text: "Sign In", subtext:"", icon:"fa fa-user"},
    {text: "My Profile", subtext:"", icon:"fa fa-user"},
    {text: "Settings", subtext:"", icon:"fa fa-cog"},
    {text: "Version", subtext:"v1.02", icon:"fa fa-flag"},
    {text: "Request Desktop Site", subtext:"", icon:"fa fa-share-square-o"}
  ])

    .config(function ($stateProvider, $urlRouterProvider/*, $ionicConfigProvider*/) {
        $stateProvider
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            });


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/blogs');
        //$ionicConfigProvider.navBar.alignTitle('left');
    })

    .controller('AppCtrl', function ($scope, MenuItems, $cordovaOauth, FB_APP_ID, $http, $state, $timeout, $ionicPopup, $rootScope, $ionicSideMenuDelegate, $ionicNavBarDelegate, $ionicLoading, $ionicModal, $timeout, $location, SERVER_API_PATH, $openFB) {
        $rootScope.showLoadingWheel = function () {
            $ionicLoading.show({
                templateUrl: 'templates/loadingwheel.html'
            });
        };

        $rootScope.sideMenuIsOpen = function() {
            return $ionicSideMenuDelegate.isOpen();
        };

    $rootScope.getPostViewClass = function() {
      if ($state.current.name == "app.blogs")
        return "buzz-posts";
      else if ($state.current.name == "app.profile")
        return "buzz-profile-posts";
    };

        $rootScope.getMenuClass = function() {
            if (typeof ($rootScope.userInfo) == "undefined" || typeof ($rootScope.userInfo.signedIn) == "undefined")
                return "buzz-hidden";

            return "nav-icon-wrapper";
        };

        $rootScope.getAvatarURL = function () {
            if (typeof ($rootScope.userInfo) == "undefined" || typeof ($rootScope.userInfo.avatar) == "undefined")
                return "img/no-avatar.png";

            return $rootScope.userInfo.avatar;
        };

        $rootScope.isPostDetailPage = function () {
            return $state.current.name == "app.postdetail";
        };

        $rootScope.isIndexMode = function () {
            return $state.current.name == "app.blogs" && ($rootScope.mode == "search" || ($rootScope.mode == "category" && $rootScope.selectedCategory == -1));
        };

        $rootScope.getNavBarClass = function () {
            return $rootScope.isIndexMode() || $rootScope.isPostDetailPage() ? "buzz-nav-bar-transparent" : "buzz-nav-bar";
        };

        $rootScope.useDefaultBackButton = function () {
            return (!$rootScope.isIndexMode() && !$rootScope.isPostDetailPage());
        };

        $rootScope.getContentClass = function () {
          if ($state.current.name == "app.profile")
            return "buzz-sub-blogs";

            return $rootScope.isIndexMode() || $rootScope.isPostDetailPage() ? "buzz-no-header" : "has-header";
        };

        $rootScope.getArticleClass = function ($index) {
            return $rootScope.isFullWideArticle($index) ? "buzz-post-fullwidth-item" : "buzz-post-halfwidth-item";
        };

        $rootScope.isFullWideArticle = function ($index) {
            return ($rootScope.mode == "search" || ($rootScope.mode == "category" && $rootScope.selectedCategory == -1)) && $state.current.name == "app.blogs" && $index == 0;
        };

        $rootScope.isFavoredPost = function () {
            return ($state.current.name == "app.blogs" || $state.current.name == "app.profile") && $rootScope.mode == "favorites";
        }

        $rootScope.hideLoadingWheel = function () {
            $ionicLoading.hide();
        };

        $rootScope.onBack = function () {
            $ionicNavBarDelegate.back();
        };


        $scope.onLogout = function () {
          $rootScope.userInfo = {};


          $rootScope.mode = "category";
          $scope.$broadcast("load_blogs");

          $scope.userMenuOpened = false;

          $state.go("app.blogs");
        };

        $rootScope.signedIn = function() {
          var signedIn = false;

          try {
            signedIn = $rootScope.userInfo.signedIn;
          }
          catch(e) {

          }

          return signedIn;
        };



        $rootScope.setTransparentNavBar = function (transparent) {
            transparent = typeof (transparent) == "undefined" ? true : transparent;

            if (transparent) {
                $("ion-nav-bar").addClass("buzz-nav-transparent");
                $("ion-content").removeClass("has-header");
            }
            else {
                $("ion-nav-bar").removeClass("buzz-nav-transparent");
                $("ion-content").addClass("has-header");
            }
        };

        $scope.init = function() {

          $scope.menus = MenuItems;
          $scope.userMenuOpened = false;
        };

        $scope.onUserMenu = function() {
          $scope.userMenuOpened = !$scope.userMenuOpened;
        };

        $scope.onClickBackdrop = function() {
          $scope.menuPoppedup = false;
        };

        $scope.onBackToHome = function() {
          $rootScope.mode = "category";
          $rootScope.selectedCategory = -1;
        }
    /*
      Load popup menu.....
     */
        $scope.$on('menu-popup', function (evt, args) {
          if ($scope.menuPoppedup = args.popupStatus) {
            var target = args.target;
            var menus = "";

            for (var i in args.popupMenus) {
              menus += "<li>" + args.popupMenus[i] + "</li>"
            }

            $(".popup-menus ul").html(menus);

            $(".popup-menus ul li").click(function(evt) {
              var menu =$(evt.target).html();
              $rootScope.$broadcast("onPopupMenuClicked", {index: args.index, menu:menu});
            });

            $(".popup-menus").css({left:target.offset().left + "px", top:target.offset().top + "px"});
          }
        });

        $scope.onMenu = function(text) {
          if (text == "Sign In") {
            $scope.modal.show();
          }else if (text == "My Profile") {
            var signedIn = false;

            try {
              signedIn = $rootScope.userInfo.signedIn;
            }
            catch (e) {
              console.log(e);
            }

            if (!signedIn) {
              return;
            }

            $state.go("app.profile");
          }else if (text == "Settings") {
            $state.go("app.settings");
          }
        };

        $scope.getCategory = function () {

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /*
            $rootScope.userInfo = {
                name: 'admin',
                signedIn: true,
                id: 1
            };
            */
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            $rootScope.sortModes = [
                { name: "DATE", fullName: "Date Descending" },
                { name: "DATE", fullName: "Date Ascending" },
                { name: "VIEWS", fullName: "Views Ascending" },
                { name: "VIEWS", fullName: "Views Descending" },
                { name: "COMMENTS", fullName: "Comments Ascending" },
                { name: "COMMENTS", fullName: "Comments Descending" },
            ];
            // Dummy data....
            $rootScope.categories = [];

            $ionicLoading.show();

            //taxonomies
            $.ajax({
              type: 'GET',
              url: SERVER_API_PATH + 'taxonomies/category/terms',
              dataType: 'json',
              cache:false,
              success: function (data) {
                  for (var i in data) {
                      data.selected = false;
                      $rootScope.categories.push(data[i]);
                  }

                  $scope.onSelectCategory(-1);

                  $rootScope.hideLoadingWheel();
              }
            });


            //$scope.onSelectSortMode(0);
        };


        $scope.onFavorites = function () {
            $rootScope.mode = "favorites";
            $rootScope.category = -1;

            //$rootScope.postTitle = "MY FAVORITES";

            $state.go("app.blogs");

            $rootScope.$broadcast('load_blogs');
        };

        $scope.onMyPosts = function () {
            $rootScope.mode = "my_posts";
            $rootScope.category = -1;

            //$rootScope.postTitle = "MY POSTS";

            $state.go("app.blogs");
            $rootScope.$broadcast('load_blogs');
        };

        $scope.onSelectCategory = function (index) {
            $rootScope.mode = "category";

            $rootScope.selectedCategory = index;

            $("ion-nav-bar").removeClass("buzz-nav-bar-invisible");

            //$rootScope.postTitle = (($rootScope.selectedCategory = index) == -1) ? "HOME" : $rootScope.categories[index].name;

            $rootScope.category = index == -1 ? null : $rootScope.categories[index].ID;

          if (index == -1) {
            $rootScope.orderby = "DATE";
            $rootScope.order = "dec";
          }

          if ($state.current.name != "app.blogs") {
            $state.go("app.blogs");
          }

            $rootScope.showFavorites = false;
            $rootScope.keyword = "";
            $rootScope.$broadcast('load_blogs');
        };

        /*
        $scope.onSelectSortMode = function (index) {
            $rootScope.selectedSortModeName = $rootScope.sortModes[index].name;
        }
        */

        // Form data for the login modal
        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;

          //$scope.doLogin();
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.modal.hide();
        },

        // Open the login modal
            $scope.login = function () {
                $scope.modal.show();
            };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            console.log('Login', $scope.loginData);
            //alert("Only the Facebook login is implemented in this sample app.");
            $scope.closeLogin();

          $scope.loginWPWithOAuth({email:"wang198904@gmail.com"});
        };

        $scope.doLoginToFB = function () {
            $rootScope.showLoadingWheel();

            $openFB.init({ appId: '1619058378361920' });


            $openFB.login({ scope: 'email,user_friends,public_profile' })
                .then(
                  function (response) {
                      // token = response.authResponse.accessToken;

                      $ionicLoading.show({ template: 'Loging in..' });
                      $openFB.api(
                        {
                            method: 'GET',
                            path: '/me',
                            params: {
                                fields: 'email,name,link,first_name,last_name'
                            }
                        }).then(function (response) {

                            $scope.loginWPWithOAuth({
                                email: response.email,
                                first_name: response.first_name,
                                last_name: response.last_name,
                                site: response.link,
                                name: response.name
                            });
                        },
                        function (error) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Facebook fetching email error!'
                            });

                            $rootScope.hideLoadingWheel();
                        });
                  },
                  function (error) {
                      var alertPopup = $ionicPopup.alert({
                          title: 'Facebook Error!'
                      });

                      $rootScope.hideLoadingWheel();
                  }
                );

        };

        $scope.doLoginToTwitter = function() {
          $ionicLoading.show();
          var api_key = "uuL5ZldJLhUMZxV0ftWIaYkMg"; //Enter your Consumer Key (API Key)
          var api_secret = "OqACg3YLgMAdm4PQx2A41jAH9pu2CWHkCNzj4SFjvuSIfpL37s"; // Enter your Consumer Secret (API Secret)
          console.log("twitterlogin function got called");
          $ionicLoading.show({template: 'Loading...'});
          $cordovaOauth.twitter(api_key, api_secret, {redirect_uri:'http://online-orders.azurewebsites.net'}).then(function(result) {
            alert(JSON.stringify(result));
            $ionicLoading.hide();
          }, function(err){
            alert('error'+ JSON.stringify(err));
            $ionicLoading.hide();
          });

          return;
          /*
          OAuth.popup("twitter").done( function(result){
            alert(JSON.stringify(result));
          })
            .fail(function(error) {
              alert(JSON.stringify(error));
            });
          */
          alert($cordovaOauth.twitter);
          $cordovaOauth.twitter("vC0zkUm3wZ6YGS7AVfdIVCOOE", "Yy253hfpuiLg2IRkQeelWBAC4hOf07RbcKlCMEjRHso5dVFjNc").then(function(result) {
            alert(JSON.stringify(result));
          }, function(error) {
            alert(JSON.stringify(error));
          });

        };

        $scope.onLogin = function () {
            $scope.modal.hide();
            $scope.onSelectCategory(-1);
          $scope.$broadcast("load_blogs");
        }

        $scope.loginWPWithOAuth = function (param) {
          var url = SERVER_API_PATH + "login_oauth/";

          //var recursiveDecoded = decodeURIComponent($.param({param: param}));

          $.ajax({
            type: 'GET',
            url: SERVER_API_PATH + "login_oauth/",
            dataType: 'json',
            data: { param : param },
            cache:false,
            success: function (result) {
              var data = result.data;
              var eleToken = data.token;


              $rootScope.userInfo = {
                id: data.ID,
                signedIn: true,
                name: data.display_name,
                email: data.user_email,
                avatar: data.avatar,
                //ajax_url: data.ajax_url,
                //token: data.token,
                //description: data.description
              };

              $scope.onLogin();
            },
            error: function(error) {

            }
          });

        };


        // Fetch category .......
        $scope.getCategory();
    });
