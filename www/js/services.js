/**
 * Created by ace on 10/17/15.
 */
angular.module('conference')
.service('UIHelper', function($q, $ionicLoading, $ionicPopup, $http) {
  this.showLoadingWheel = function () {
    $ionicLoading.show({
      templateUrl: 'templates/loadingwheel.html'
    });
  };

  this.hideLoadingWheel = function() {
    $ionicLoading.hide();
  };

  this.alert = function(title, msg) {
    var alertPopup = $ionicPopup.alert({
      title: (typeof(title) == "undefined" ? "" : title),
      template: (typeof(msg) == "undefined" ? "" : msg)
    });
  };
})

  .service('Http', function($q, $ionicLoading, $ionicPopup, $http, SERVER_API_PATH) {
    this.favorite = function(userId, id, favor) {
      var deferred = $q.defer();

      var url = SERVER_API_PATH + 'favorites';
      var param = {
        user_id: userId,
        favor: favor,
        post_id: id
      };

      $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        cache:false,
        data: { param: param },
        success: function (data) {
          deferred.resolve(data);
        },
        error: function(error) {
          deferred.reject(error);
        }
      });

      return deferred.promise;
    };
  });
