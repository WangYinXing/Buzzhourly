angular.module('services', [])

.service('LoginService', function($q, $http) {
    return {
        loginUser: function(email, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
 
            $http.get('http://laguia.happinezz.mx/api/index.php/user/login', {params: {"email":email, "password":pw} })
                .success(
                    function(loginResp) {
                        console.log(loginResp);
                        if (loginResp.resultCode == "RESULT_OK") {
                            deferred.resolve(loginResp.content.token);
                        } else {
                            deferred.reject('Wrong credentials.');
                        };
                    }
                )
                .error(
                    function(err) {
                        console.error('ERR', err);
                        // err.status will contain the status code
                        alert(err.status);
                    }
                );   
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})

.service('RegisterService', function($q, $http) {
    return {
        registerUser: function(fname, lname, email, pw, repw, birth, gender) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            if (fname != null || lname != null || email != null || pw != null || repw != null || birth != null || gender != null) {
                if (re.test(email)) {       

                    if (pw == repw) {

                        if (pw.length > 5) {

                            $http.get('http://laguia.happinezz.mx/api/index.php/user/signup', {params: {"email":email, "password":pw, "birthday":birth, "fname":fname, "lname":lname, "sex":gender} })
                                .success(
                                    function(signupResp) {
                                        console.log('response', signupResp);
                                        if ( signupResp.resultCode == "RESULT_OK") {
                                            $http.get('http://laguia.happinezz.mx/api/index.php/user/login', {params: {"email":email, "password":pw} })
                                            .success(
                                                function(loginResp) {
                                                    console.log(loginResp);
                                                    deferred.resolve('Welcome ' + email + '!');
                                                }
                                            )
                                            .error(
                                                function(err) {
                                                    console.error('ERR', err);
                                                    deferred.reject('Wrong credentials.');
                                                    // err.status will contain the status code
                                                    alert(err.status);
                                                }
                                            );   
                                        } else {
                                            alert("Signup usuario está fallado, vuelva a intentarlo con nueva identificación / contraseña");
                                        };
                                         
                                    }
                                )
                                .error(
                                    function(err) {
                                        console.error('ERR', err);
                                        // err.status will contain the status code
                                        alert(err.status);
                                    }
                                );
                        } else {
                            alert("Contraseña mosto contiene al menos seis caracteres!");
                        };
                        
                    } else {
                        alert("Llene la contraseña!");
                    };
                } else {
                    alert("Email no es válida!");
                };
            } else {
                alert("Rellene todos los campos");
            };


            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})

.service('sharedPreference', function() {
    var rightCount = 0;
    var problemCount = 0;
    var isBoard = "yes";
    var isReview = "yes";
    var isMark = "yes";	
    return {
        getRightCount: function() {
            return rightCount;
        },
        setRightCount: function(value) {
            rightCount = value;
        },
        getIsBoard: function() {
            return isBoard;
        },
        setIsBoard: function(value) {
            isBoard = value;
        },
        getProblemCount: function() {
            return problemCount;
        },
        setProblemCount: function(value) {
            problemCount = value;
        }
    };
});