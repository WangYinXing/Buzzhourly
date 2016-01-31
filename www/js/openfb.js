/**
 * OpenFB is a micro-library that lets you integrate your JavaScript application with Facebook.
 * OpenFB works for both BROWSER-BASED apps and CORDOVA/PHONEGAP apps.
 * This library has no dependency: You don't need (and shouldn't use) the Facebook SDK with this library. Whe running in
 * Cordova, you also don't need the Facebook Cordova plugin. There is also no dependency on jQuery.
 * OpenFB allows you to login to Facebook and execute any Facebook Graph API request.
 * @author Christophe Coenraets @ccoenraets
 * @version 0.1
 */
var openFB = (function() {

    var FB_LOGIN_URL = 'https://www.facebook.com/dialog/oauth',

        // By default we store fbtoken in sessionStorage. This can be overriden in init()
        tokenStore = window.sessionStorage,

        fbAppId,
        oauthRedirectURL,

        // Because the OAuth login spawns multiple processes, we need to keep the success/error handlers as variables
        // inside the module as opposed to keeping them local within the function.
        loginSuccessHandler,
        loginErrorHandler;

    /**
     * Initialize the OpenFB module. You must use this function and initialize the module with an appId before you can
     * use any other function.
     * @param appId - The id of the Facebook app
     * @param redirectURL - The OAuth redirect URL. Optional. If not provided, we use sensible defaults.
     * @param store - The store used to save the Facebook token. Optional. If not provided, we use sessionStorage.
     */
    function init(appId, redirectURL, store) {
        fbAppId = appId;
        if (redirectURL) oauthRedirectURL = redirectURL;
        if (store) tokenStore = store;
    }

    /**
     * Login to Facebook using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
     * If running in Cordova container, it happens using the In-App Browser. Don't forget to install the In-App Browser
     * plugin in your Cordova project: cordova plugins add org.apache.cordova.inappbrowser.
     * @param scope - The set of Facebook permissions requested
     * @param success - Callback function to invoke when the login process succeeds
     * @param error - Callback function to invoke when the login process fails
     * @returns {*}
     */
    function login(scope, success, error) {

        if (!fbAppId) {
            return error({error: 'Facebook App Id not set.'});
        }

        var loginWindow;

        scope = scope || '';

        loginSuccessHandler = success;
        loginErrorHandler = error;

        if (!oauthRedirectURL) {
            if (runningInCordova()) {
                oauthRedirectURL = 'https://www.facebook.com/connect/login_success.html';
            } else {
                // Trying to calculate oauthRedirectURL based on the current URL.
                var index = document.location.href.indexOf('index.html');
                if (index > 0) {
                    oauthRedirectURL = window.document.location.href.substring(0, index) + 'oauthcallback.html';
                } else {
                    return alert("Can't reliably guess the OAuth redirect URI. Please specify it explicitly in openFB.init()");
                }
            }
        }

        loginWindow = window.open(FB_LOGIN_URL + '?client_id=' + fbAppId + '&redirect_uri=' + oauthRedirectURL +
            '&response_type=token&display=popup&scope=' + scope, '_blank', 'location=no');

        // If the app is running in Cordova, listen to URL changes in the InAppBrowser until we get a URL with an access_token
        if (runningInCordova()) {
            loginWindow.addEventListener('loadstart', function (event) {
                var url = event.url;
                if (url.indexOf("access_token=") > 0) {
                    loginWindow.close();
                    oauthCallback(url);
                }
            });

            loginWindow.addEventListener('exit', function (event) {
                // Handle the situation where the user closes the login window manually before completing the login process
                var url = event.url;
                if (url.indexOf("access_token=") > 0) {
                    deferredLogin.reject();
                }
            });
        }
        // Note: if the app is running in the browser the loginWindow dialog will call back by invoking the
        // oauthCallback() function. See oauthcallback.html for details.

    }

    /**
     * Called either by oauthcallback.html (when the app is running the browser) or by the loginWindow loadstart event
     * handler defined in the login() function (when the app is running in the Cordova/PhoneGap container).
     * @param url - The oautchRedictURL called by Facebook with the access_token in the querystring at the ned of the
     * OAuth workflow.
     */
    function oauthCallback(url) {
        // Parse the OAuth data received from Facebook
        var hash = decodeURIComponent(url.substr(url.indexOf('#') + 1)),
            params = hash.split('&'),
            oauthData = {};
        params.forEach(function (param) {
            var splitter = param.split('=');
            oauthData[splitter[0]] = splitter[1];
        });
        var fbtoken = oauthData['access_token'];
        if (fbtoken) {
            tokenStore['fbtoken'] = fbtoken;
            if (loginSuccessHandler) loginSuccessHandler();
        } else {
            if (loginErrorHandler) loginErrorHandler();
        }
    }

    /**
     * Application-level logout: we simply discard the token.
     */
    function logout() {
        tokenStore['fbtoken'] = undefined;
    }

    /**
     * Lets you make any Facebook Graph API request.
     * @param obj - Request configuration object. Can include:
     *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
     *  path:    path in the Facebook graph: /me, /me.friends, etc. - Required
     *  params:  queryString parameters as a map - Optional
     *  success: callback function when operation succeeds - Optional
     *  error:   callback function when operation fails - Optional
     */
    function api(obj) {

        var method = obj.method || 'GET',
            params = obj.params || {},
            xhr = new XMLHttpRequest(),
            url;

        params['access_token'] = tokenStore['fbtoken'];

        url = 'https://graph.facebook.com' + obj.path + '?' + toQueryString(params);

        xhr.onreadystatechange = function() {
            console.log(xhr.readyState + ' ' + xhr.status);
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (obj.success) obj.success(JSON.parse(xhr.responseText));
                } else {
                    var error = xhr.responseText ? JSON.parse(xhr.responseText).error : {message: 'An error has occurred'};
                    if (obj.error) obj.error(error);
                }
            }
        }

        xhr.open(method, url, true);
        xhr.send();
    }

    /**
     * Helper function to de-authorize the app
     * @param success
     * @param error
     * @returns {*}
     */
    function revokePermissions(success, error) {
        return api({method: 'DELETE',
            path:'/me/permissions',
            success: function() {
                tokenStore['fbtoken'] = undefined;
                success();
            },
            error: error});
    }

    function toQueryString(obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    }

    function runningInCordova() {
        //return window.device && window.device.cordova;
        return true;
    }

    // The public API
    return {
        init: init,
        login: login,
        logout: logout,
        revokePermissions: revokePermissions,
        api: api,
        oauthCallback: oauthCallback
    }

}());