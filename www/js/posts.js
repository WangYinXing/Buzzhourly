angular.module('conference.posts', ['conference.config'])
    .directive('orientable', function () {
        return {
            link: function (scope, element, attrs) {
                element.bind("load", function (e) {

                    // success, "onload" catched
                    // now we can do specific stuff:
                    angular.element(this).css("padding", "0%");

                    advanceProgress(9);
                });

                element.bind('error', function () {
                    angular.element(this).attr("src", "/img/img-not-found.png");
                    angular.element(this).css("padding", "30%");

                });
            }
        }
    })
    .directive('colBlog', function ($window, $rootScope) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {

        }
      };
    })
  .directive('colBlogImage', function ($window, $rootScope, $compile) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        element.bind("error", function(error) {
          //--scope.$parent.pendingPosts;
          console.error(scope.$parent.pendingPosts);
        });

        element.bind("load", function(evt) {
          //console.log($(element));
          var blog = $(element).closest("col_blog");
          var blogWrapper = $(element).closest("blogs");

          var lWrapper = $(blogWrapper).find(".left-column");
          var rWrapper = $(blogWrapper).find(".right-column");

          var lH = lWrapper.outerHeight();
          var rH = rWrapper.outerHeight();
          console.log(scope.$parent.pendingPosts);

          if (--scope.$parent.pendingPosts == 0) {
            scope.arrange();
          }
        });
      }
    };
  })
    .directive('scrollDetector', function ($window, $rootScope, $ionicScrollDelegate) {
        return {
            restrict: 'A',

            link: function (scope, element, attrs) {

                var scrollableElement = element[0].querySelector('.scroll');

                element.on('scroll', function (evt) {
                    if (!$rootScope.isIndexMode() && !$rootScope.isPostDetailPage())
                        return;

                    var curTransform = new WebKitCSSMatrix(window.getComputedStyle(scrollableElement).webkitTransform);

                    if (curTransform.m42 < -50)
                        $("ion-nav-bar").addClass("buzz-nav-bar-invisible");
                    else
                        $("ion-nav-bar").removeClass("buzz-nav-bar-invisible");

                });
            }
        };
    })
  .directive('buzzPost', function ($window, $rootScope, $ionicScrollDelegate) {
    return {
      restrict: 'A',

      link: function (scope, element, attrs) {
        element.on("click", function(evt) {
          //alert("!");
        });
      }
    };
  })
  .directive('btnMenu', function ($window, $rootScope, $ionicScrollDelegate) {
    return {
      restrict: 'A',

      link: function (scope, element, attrs) {
        element.on("click", function(evt) {
          //alert("!");
        });
      }
    };
  })
    .controller('PostsCtrl', function ($scope, $ionicLoading, UIHelper, Http, $ionicScrollDelegate, $ionicPopup, $ionicModal, $http, $rootScope, $location, $state, SERVER_API_PATH) {
        $scope.init = function () {
          $scope.pendingPosts = 0;

          $scope.leftColumnH = 0;
          $scope.rightColumnH = 0;
          $scope.arranged = 0;

            ///
            $ionicModal.fromTemplateUrl('templates/confirm.html', {
                scope: $scope,
                animation: 'slide-in-up',
                controller: 'PostsCtrl'
            }).then(function (modal) {
                $scope.favoriteRemoveConfirm = modal;

                $scope.confirmMessage = "Are you sure you want to remove this post<br/> from favorites?"

            });

            if (typeof ($scope.blogs) == "undefined")
                $scope.blogs = [];

            $scope.loadMore();
        };

    $scope.arrange = function() {
      for (var i=$scope.arranged; i<$scope.blogs.length; i++) {
        var post = $("col_blog[index=" + i + "]");

        post.removeClass("buzz-temp");

        post.css("position", "absolute");
        post.css("width", "50%");

        if ($scope.leftColumnH < $scope.rightColumnH) {
          post.css("top", $scope.leftColumnH + "px");
          $scope.leftColumnH += post.outerHeight();
        }
        else {
          post.css("right", "0px");
          post.css("top", $scope.rightColumnH + "px");
          $scope.rightColumnH += post.outerHeight();
        }
      }

      $rootScope.hideLoadingWheel();
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.resize');

      $scope.arranged = $scope.blogs.length;
    };

    $scope.onMenu = function(index, evt) {
      var popup = [];
      evt.stopPropagation();

      if (!$rootScope.signedIn())
        return;

      if (!$scope.blogs[index].favored) {
        popup = ["Add To Favorites"];
      }
      else {
        popup = ["Remove From Favorites"];
      }

      $rootScope.$broadcast("menu-popup", {popupStatus:true, target:$(evt.target), popupMenus: popup, index: index});
    }

    $scope.viewerIcon = function(blog) {
      var strCnt = blog.viewers;
      var cnt = parseInt(strCnt);

      if (strCnt[strCnt.length - 1] == "k" || strCnt[strCnt.length - 1] == "K") {
        cnt = parseFloat(strCnt) * 1000;
      }

      return cnt > 1000 ? '/img/eye.png' : '/img/eye.png'
    }

        $scope.fetchBlogs = function () {
          $scope.blogs = [];
          $scope.totalCount = $scope.page = -1;
          $scope.hasMoreData = true;

          $scope.pendingPosts = 0;

          $scope.leftColumnH = 0;
          $scope.rightColumnH = 0;
          $scope.arranged = 0;

          $("col_blog").remove();

            $scope.loadMore();
        };

        $scope.getFirstBlog = function () {
            if (typeof ($scope.blogs[0]) != "undefined")
                return $scope.blogs[0];
        };

    $scope.isFavored = function(blog) {
      if (!$rootScope.signedIn())
        return false;

      for (var i in $rootScope.postsInfo.favorites) {
        if (parseInt($rootScope.postsInfo.favorites[i]) == blog.id)
          return true;
      }

      return false;
    };

    $scope.$on("onPopupMenuClicked", function(evt, args) {
      var post = $scope.blogs[args.index];

      var elePost = $("col_blog[index=" + args.index + "]");

      if (args.menu == "Add To Favorites") {
        UIHelper.showLoadingWheel();

        Http.favorite($rootScope.userInfo.id, post.id, 1).then(function() {
          UIHelper.hideLoadingWheel();
          post.favored = true;
        });
      }
      else if (args.menu == "Remove From Favorites") {
        $scope.onRemoveFromFavorites(args.index);


      }

      $rootScope.$broadcast("menu-popup", {popupStatus:false});
    });

    $scope.loadMore = function () {
        if (typeof($scope.totalCount) != "undefined" && $scope.totalCount != -1 ) {
            if (!($scope.hasMoreData = $scope.blogs.length < $scope.totalCount))
            {
                $rootScope.hideLoadingWheel();

                $scope.$broadcast('scroll.infiniteScrollComplete');

                return;
            }
        }

        $rootScope.showLoadingWheel();

        var page        = Math.ceil( $scope.blogs.length / 12 ) + 1;
        var order       = $rootScope.order;
        var orderby     = $rootScope.orderby;
        var category    = $rootScope.category;
        var search      = $rootScope.keyword;

        var favorites = -1;
        var author = -1;

        try {
            author = favorites = $rootScope.userInfo.id;
        }
        catch (e) {
            console.log(e);
        }

        var filter = {};

        //$rootScope.mode
        filter.posts_per_page = 12;
        filter.paged = page;
        filter.order = order;
        filter.orderby = orderby;
        filter.user = author;

        if      ($rootScope.mode == "favorites") filter.favorites = favorites;
        else if ($rootScope.mode == "my_posts") filter.author = author;
        else if ($rootScope.mode == "search") filter.search = search;
        else if ($rootScope.mode == "category") filter.category = category;

        var recursiveDecoded = decodeURIComponent($.param({ page: page, filter: filter }));

      if (typeof($scope.timer) == "undefined") {
        $scope.timer = setTimeout(function() {
          var alertPopup = $ionicPopup.alert({
            title: 'Buzzhourly timeout.',
            template: '<div style="color:#6a6a6a">Cannot reach server in this time.Please check your connectivity and try again later.</div>'
          }).then(function(res) {
            if (res)
              navigator.app.exitApp();
          });
        }, 20000);
      }


      $.ajax({
        //url: 'http://' + Global.cache.selectedServer.Host + '/api/dnad/getjoblist',
        url: SERVER_API_PATH + 'posts_ex?' + recursiveDecoded,
        type: 'GET',
        datatype: 'jsonp',
        crossOrigin: true,
        cache: false,
        //contentType: 'application/json; charset=utf-8',
        success: function (result) {
          clearInterval($scope.timer);

          //$rootScope.hideLoadingWheel();

          $scope.$apply(function() {
            var data = result;

            $scope.totalCount = data.info.totalCount;

            var favorites = data.info.favorites;

            var added = false;

            if ($scope.totalCount == 0) {
              $rootScope.hideLoadingWheel();

              $scope.$broadcast('scroll.infiniteScrollComplete');
            }

            // do something with the data here
            for (var i in data.posts) {
              added = false;
              data.posts[i].favored = false;

              for (var j in $scope.blogs) {
                if (data.posts[i].id == $scope.blogs[j].id) {
                  added = true;

                  break;
                }
              }

              if (!added) {
                for (var k in favorites) {
                  if (data.posts[i].id == parseInt(favorites[k])) {
                    data.posts[i].favored = true;
                  }
                }

                var blog = data.posts[i];

                var strCnt = blog.viewers;
                var cnt = parseInt(strCnt);

                if (strCnt[strCnt.length - 1] == "k" || strCnt[strCnt.length - 1] == "K") {
                  cnt = parseFloat(strCnt) * 1000;
                }

                blog.viewerIcon = cnt > 1000 ? 'img/hot.png' : 'img/eye.png'

                $scope.blogs.push(data.posts[i]);
                $scope.pendingPosts++;
              }
            }

            $scope.page = $scope.blogs.length / 12;
          });


        },
        error: function (error) {
          UIHelper.alert("error " + JSON.stringify(error));
        }
      });
    };

        $scope.$on('load_blogs', function () {
            $scope.fetchBlogs();

            $ionicScrollDelegate.scrollTop();
        });

        $scope.onClickPost = function (index) {
            $scope.totalCount = -1;
            console.log($scope.blogs[index]);
            $rootScope.selectedPostID = $scope.blogs[index].id;

            $rootScope.showLoadingWheel();

            $state.go("app.postdetail");
        };

        $scope.onRemoveFromFavorites = function (index) {
            $scope.favoriteRemoveConfirm.show();

            $scope.selected = index;
        }

        $scope.onYes = function () {
          $scope.favoriteRemoveConfirm.hide();

          var elePost = $("col_blog[index=" + $scope.selected + "]");
          var post = $scope.blogs[$scope.selected];


            $rootScope.showLoadingWheel();

            var url = SERVER_API_PATH + 'favorites';
            var param = {
                user_id: $rootScope.userInfo.id,
                favor: 0,
                post_id: post.id
            };

          Http.favorite($rootScope.userInfo.id, post.id, 0).then(function() {
            UIHelper.hideLoadingWheel();
            //elePost.remove();

            //$scope.blogs.splice($scope.selected, 1);

            post.favored = false;
            $rootScope.hideLoadingWheel();
          });
          /*
          var recursiveDecoded = decodeURIComponent($.param({ param: param }));

          $http.get(
            url + "?" + recursiveDecoded
          ).then(function (result) {

              //$("col_blog[index='" + $scope.selected + "']").remove();

              elePost.find(".buzz-bookmark").addClass("ng-hide");

              //$scope.$apply();
              //$scope.loadMore();
              post.favored = false;
              $rootScope.hideLoadingWheel();
            });
            */
        };

        $scope.onNo = function () {
            $scope.favoriteRemoveConfirm.hide();
        };
    });
