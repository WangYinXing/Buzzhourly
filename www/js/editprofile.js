angular.module('conference.editprofile', ['conference.config'])
    .config(function ($stateProvider) {

       $stateProvider

            .state('app.editprofile', {
                url: "/editprofile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/editprofile.html",
                        controller: "EditProfileCtrl"
                    }
                }
            });
    })
  .controller('EditProfileCtrl', function ($scope, UIHelper, $rootScope, SERVER_API_PATH) {
    var ajax_object = {};


    $scope.init = function () {
      UIHelper.showLoadingWheel();

      var param = {email:$rootScope.userInfo.email};

      $(".upload-avatar").load(function() {
        UIHelper.hideLoadingWheel();
      });
      $(".upload-avatar").error(function() {
        UIHelper.hideLoadingWheel();
      });



      $.ajax({
        type: 'GET',
        url: SERVER_API_PATH + "get_profile/",
        dataType: 'json',
        data: { param : param },
        cache:false,
        success: function (result) {
          $scope.$apply(function() {
            $scope.data = result.data;
            $scope.data.original_avatar = result.data.avatar;
            $scope.data.original_avatar_fileName = $scope.data.original_avatar.replace(/^.*[\\\/]/, '');
            //alert($scope.data.original_avatar_fileName);
          });
        },
        error: function(error) {

        }
      });
    };

    $scope.fromLibrary = function() {
      UIHelper.showLoadingWheel();


      navigator.camera.getPicture(
        $scope.onSavedPhotoURISuccess,
        $scope.onFail,
        {
          quality: 30,
          destinationType: destinationType.FILE_URI,
          sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
          }
      );
    };
    $scope.getPicture = function() {
      UIHelper.showLoadingWheel();

      navigator.camera.getPicture(
        $scope.onPhotoURISuccess,
        $scope.onFail,
        { quality: 30, destinationType: Camera.DestinationType.FILE_URI });
    };

    $scope.onPhotoURISuccess = function(uri) {
      UIHelper.hideLoadingWheel();

      try {
        window.resolveLocalFileSystemURL(uri, function(fileEntry) {
          $scope.$apply(function() {
            $scope.data.avatar = fileEntry.nativeURL;
          });
        });
      }
      catch(e) {

      }



    };

    $scope.onSavedPhotoURISuccess = function(uri) {
      UIHelper.hideLoadingWheel();

      window.FilePath.resolveNativePath(uri, function(result) {


        // onSuccess code
        $scope.$apply(function() {
          $scope.data.avatar = 'file://' + result;
          //alert($scope.data.avatar);
        });
      }, function (error) {
        // onError code here
      });

    };

    $scope.onFail = function(message) {
      UIHelper.alert('Failed because: ' + message);
    };

    $scope.upload = function() {
      UIHelper.showLoadingWheel();

      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = $scope.data.avatar.substr($scope.data.avatar.lastIndexOf('/') + 1);
      options.mimeType = "image/jpg";
      options.chunkedMode = true;

      var params = {};
      params.value1 = "someparams";
      params.value2 = "otherparams";

      options.params = params;

      var ft = new FileTransfer();
      ft.upload($scope.data.avatar,
        encodeURI("http://buzzhourly.com/wp-content/themes/sociallyviral/fileupload.php"),
        function(result) {
          var obj = JSON.parse(result.response);

          $scope.data.new_avatar_fileName = obj.systemname;

          if (obj.success) {
            $scope.updateChange();
          }
          else {
            UIHelper.hideLoadingWheel();

            UIHelper.alert("Upload failed. Please try again later.");
          }


        },
        function(error) {
          //alert(JSON.stringify(error));
          UIHelper.hideLoadingWheel();
          UIHelper.alert("Upload failed. Please try again later.");

        },
        options);
    };

    $scope.updateChange = function() {
      //alert(JSON.stringify($scope.data));

      $.ajax({
        type: 'GET',
        url: SERVER_API_PATH + "set_profile/",
        dataType: 'json',
        data: { param : $scope.data },
        cache:false,
        success: function (result) {
          $scope.$apply(function() {
            UIHelper.hideLoadingWheel();
            $scope.data = result.data;

            /*
             Now we should update user avatar for other pages.

             ........
             */
            $rootScope.userInfo.avatar = $scope.data.avatar;
          });
        },
        error: function(error) {
          UIHelper.hideLoadingWheel();
        }
      });
    }
  });
