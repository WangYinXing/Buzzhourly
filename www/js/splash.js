

var progress = 0;


var advanceProgress = function (percentage) {
    setProgress(progress + percentage);
}

var setProgress = function (percentage) {
    if (percentage >= 100) {
        setTimeout(function () {
            $(".buzz-splash").remove();
        }, 1000);
        
        return;
    }

    progress = percentage;

    $(".buzz-splash-logo-wrapper").css('height', percentage * 2.0 + 'px');
    $(".buzz-progress").css('width', percentage + '%');
}