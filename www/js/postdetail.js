angular.module('conference.postdetail', ['conference.config'])
//postdetailthumb
    .directive('postdetailthumb', function ($ionicScrollDelegate, $rootScope, $ionicPopup) {
        return {
            link: function (scope, element, attrs) {

                element.bind("load", function (e) {

                    // success, "onload" catched
                    // now we can do specific stuff:
                    //scope.loadCompleted = true;
                    //alert(scope.loadCompleted);

                    scope.$apply(function () {
                        scope.loadCompleted = true;
                        $rootScope.hideLoadingWheel();
                    });

                });

                element.bind('error', function () {
                    //angular.element(this).attr("src", "/img/img-not-found.png");
                    //angular.element(this).css("padding", "30%");

                    scope.$apply(function () {
                        scope.loadCompleted = true;
                        $rootScope.hideLoadingWheel();
                    });
                });
            }
        }
    })
    .directive('compile', ['$compile', function ($compile) {
        return function(scope, element, attrs) {
            scope.$watch(
              function(scope) {
                  // watch the 'compile' expression for changes
                  return scope.$eval(attrs.compile);
              },
              function(value) {
                  // when the 'compile' expression changes
                  // assign it into the current DOM
                  element.html(value);

                  // compile the new DOM and link it to the current
                  // scope.
                  // NOTE: we only compile .childNodes so that
                  // we don't get into infinite loop compiling ourselves
                  $compile(element.contents())(scope);
              }
          );
        };
    }])
    .config(function ($stateProvider) {

        $stateProvider
            .state('app.postdetail', {
                url: "/postdetail",
                views: {
                    'menuContent': {
                        templateUrl: "templates/postdetail.html",
                        controller: "PostDetailCtrl"
                    }
                }
            });
    })

    .controller('PostDetailCtrl', function ($scope, $rootScope, $state, $cordovaSocialSharing, $ionicScrollDelegate, $ionicPopup, $ionicLoading, SERVER_API_PATH) {
        $scope.init = function () {
            $scope.data = {};
            $rootScope.showLoadingWheel();

            /*
                Load post contents.
            */
            var url = SERVER_API_PATH + "get_post_detail/";
            var param = {};

            param.post_id = $rootScope.selectedPostID;

            try {
                param.user_id = $rootScope.userInfo.id;
            }
            catch(e) {
                console.log("User didn't log in yet..");
            }

            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                data:{param: param},
                cache:false,
                success: function (data) {
                    console.log(data);

                    $scope.blog = data['post'];
                    $scope.subPosts = data['sub_posts'];

                    $scope.blog.displayDate = moment(new Date(data.post.post_date_gmt)).format('MMM DD,YYYY');

                    /*
                        Refile the image tags.
                    */
                    var content = $("<div></div>").html($scope.blog.html_content);
                    content.find("img").addClass("buzz-img-content");
                    content.find("iframe").addClass("buzz-iframe-content");

                    content.find("a").each(function() {
                        $(this).attr("onclick", "window.open('" + $(this).attr('href') + "', '_blank', 'location=no')");
                        $(this).attr("href", "");
                    });

                    $scope.blog.contentHTML = content.html();

                    $scope.comments = $scope.blog.comments;

                    $scope.commentsTitle = $scope.blog.comments.length == 0 ? 'No comments' : 'Comments (' + $scope.blog.comments.length + ')';

                    for (var i in $scope.comments) {
                        $scope.comments[i].displayDate = moment(new Date($scope.comments[i].comment_date_gmt)).fromNow();

                    }

                    $scope.favored = data.info.favored;

                    //$rootScope.hideLoadingWheel();
                    $scope.$broadcast('scroll.infiniteScrollComplete');

                    $ionicScrollDelegate.scrollTop();
                    $scope.loadCompleted = true;
                }
            });
        };

    $scope.onBack = function() {
      $state.go("app.blogs");
    }

        $scope.shareAnywhere = function(error, app) {
            alert(app + " isn't installed in device.");

            //$cordovaSocialSharing.share("This is your message", "This is your subject", "www/imagefile.png", "http://blog.nraboy.com");
        };

        $scope.shareViaTwitter = function(message, image, link) {

        };

        $scope.onShare = function(appName) {
            var errorHandler = function(error) {
                $scope.shareAnywhere( error, appName );
            }

            if (appName == "facebook") {
              //window.plugins.socialsharing.shareVia('com.facebook.orca', 'Message via FB', null, null, null, function(){console.log('share ok')}, function(msg) {alert('error: ' + msg)});
              //window.plugins.socialsharing.canShareVia('com.apple.social.facebook', 'msg', null, null, null, function(e){alert(e)}, function(e){alert(e)});

              window.plugins.socialsharing.shareViaFacebookWithPasteMessageHint(
                $scope.blog.post_title + " (" + $scope.blog.guid + ") ",
                $scope.blog.thumbnail,
                //url,
                $scope.blog.guid,
                //'https://play.google.com/store/apps/details?id=com.fsrc.destinystars',
                null,
                null,
                null,
                null);
            }
            else if (appName == "twitter") {
              $cordovaSocialSharing.canShareVia("twitter", $scope.blog.contentHTML, null, null).then(function(result){
                window.plugins.socialsharing.shareViaTwitter(
                  $scope.blog.post_title,
                  $scope.blog.thumbnail,
                  //url,
                  $scope.blog.guid,
                  //'https://play.google.com/store/apps/details?id=com.fsrc.destinystars',
                  null,
                  null,
                  null,
                  null);
                }, errorHandler);
            }
            else if (appName == "mail") {
                $cordovaSocialSharing.canShareVia("email", $scope.blog.contentHTML, null, null).then(function(result) {
                  window.plugins.socialsharing.shareViaEmail(
                    $scope.blog.post_title + "  (" + $scope.blog.guid + ")",
                    $scope.blog.thumbnail,
                    null,
                    null,
                    null,
                    null,
                    null);
                    }, errorHandler);
            }
            else if (appName == "pinterest") {
              /*
                $cordovaSocialSharing.canShareVia("pinterest", $scope.blog.post_content, null, null).then(function(result) {
                    $cordovaSocialSharing.shareViaWatsapp($scope.blog.post_content, null, null);
                    }, errorHandler);
                   */
            }
            else if (appName == "whatsapp") {
                $cordovaSocialSharing.canShareVia("whatsapp", $scope.blog.post_content, null, null).then(function(result) {
                  window.plugins.socialsharing.shareViaWhatsApp(
                    $scope.blog.post_title,
                    $scope.blog.thumbnail,
                    $scope.blog.guid,
                    null,
                    null,
                    null,
                    null);
                    }, errorHandler);
            }
        }

        $scope.onClickPost = function ($index) {
            $rootScope.selectedPostID = $scope.subPosts[$index].id;
            $scope.loadComplete = false;
            $scope.init();
        };

        $scope.onComment = function () {
            if (typeof($scope.data.newComment) == "undefined" || $scope.data.newComment == "") {
                var alertPopup = $ionicPopup.alert({
                    title: 'Please input comment!'
                });

                return;
            }


            var url = SERVER_API_PATH + 'posts/new_comment';

            var param = {
                user_id: $rootScope.userInfo.id,
                comment: $scope.data.newComment,
                post_id: $rootScope.selectedPostID
            };

            $rootScope.showLoadingWheel();

            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                data: { param: param },
                success: function (data) {
                    $scope.$apply(function() {
                        $scope.comments.push(data);
                        $scope.commentsTitle = $scope.blog.comments.length == 0 ? 'NO COMMENTS' : 'COMMENTS (' + $scope.blog.comments.length + ')';

                        $scope.data.newComment = "";
                    });

                    $rootScope.hideLoadingWheel();
                }
            });
        };


        $scope.onFavorite = function () {
            $rootScope.showLoadingWheel();
            var favor = ($scope.favored + 1) % 2;

            var url = SERVER_API_PATH + 'favorites';
            var param = {
                user_id: $rootScope.userInfo.id,
                favor: favor,
                post_id: $rootScope.selectedPostID
            };

            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                cache:false,
                data: { param: param },
                success: function (data) {
                    $scope.favored = favor;

                    $rootScope.hideLoadingWheel();
                }
            });
        }
    });
