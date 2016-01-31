var ajax_object = {};


function initUserProfile(url) {
  ajax_object.ajax_url = url;

  initUploader('../');

  /*
  $( "#settings-tabs" ).tabs();
  $( "#notifications" ).buttonset();

  $( "#public" ).buttonset();
  $( "#favorites" ).buttonset();
  $( "#posts" ).buttonset();
  */

  $('.btn-submit').on('click', function(){
    submitForm($(this).closest('form'));
  });
}


/**
 *
 */
function submitForm(form){
  $('.mts-submit-content .submit-mask').show();
  $.ajax({
    type: 'POST',
    url: '',
    data: form.serialize(),
    dataType: 'json',
    success: function(data) {
      $('.mts-submit-content .submit-mask').hide();
      if(data.status == 1){
        $('#message').html(data.message);
        $('.image-preview img').attr("src", data.avatar);
        $('.image-preview img').attr("srcset", data.avatar);
        $('#user-area .user-profile img.avatar').attr("src", data.avatar);
        $('#user-area .user-profile img.avatar').attr("srcset", data.avatar);
      } else {
        submitErrors(data.errors);
      }
    },
    error: function(){
      $('.mts-submit-content .submit-mask').hide();
      submitErrors(['Network error, please try again.']);
    }
  });
}

/**
 *
 * @param url
 */
function initUploader(url, field) {

	url = url || '';
	field = field || '';

	var btn = $('#uploadBtn'+field);
  var progressBar = $('#progressBar'+field);
  var progressOuter = $('#progressOuter'+field);
  var msgBox = $('#msgBox'+field);

  var data = {
  		'action' : 'mts_upload_image',
  		'token' : $('#token').val()
  	};


	var uploader = new ss.SimpleUpload({
		button : btn,
		//url : '/wp-content/themes/sociallyviral/fileupload.php',
		url : ajax_object.ajax_url,
		data: data,
		name : 'uploadfile',
		hoverClass : 'hover',
		focusClass : 'focus',
		responseType : 'json',
		allowedExtensions: ['jpg', 'jpeg', 'png'],
		startXHR : function() {
			progressOuter.show(); // make progress bar visible
			this.setProgressBar(progressBar);
		},
		onExtError: function( filename, extension ) {
			submitErrors(['Unsupported file type. Accepted file types are: .JPG, .JPEG, .PNG']);
		},
		onSubmit : function() {
			$('#file'+field).val('');
			$('#originalname'+field).val('');
			msgBox.html(''); // empty the message box
			btn.html('Uploading...'); // change button text to "Uploading..."
		},
		onComplete : function(filename, response) {
			btn.html('Choose Another File');
			progressOuter.hide(); // hide progress bar when upload is completed
			if (!response) {
				msgBox.html('Unable to upload file!');
				return;
			}
			if (response.success === true) {
				//msgBox.html('<strong>' + escapeTags(response.filename) + '</strong>' + ' successfully uploaded.');
				$('#file'+field).val(response.systemname);
				$('#originalname'+field).val(escapeTags(response.filename));
				$('.image-preview img').attr("src", response.uploadsurl + '/tmp/' + response.systemname);
				$('.image-preview img').attr("srcset", response.uploadsurl + '/tmp/' + response.systemname);
			} else {
				if (response.msg) {
					msgBox.html(escapeTags(response.msg));
				} else {
					msgBox.html(escapeTags('An error occurred and the upload failed.'));
				}
			}
		},
		onError : function() {
			progressOuter.hide();
			msgBox.html('Unable to upload file');
		}
	});

	// we need this for destroy() call
	btn.data('uploader', uploader);

}

function escapeTags( str ) {
  return String( str )
   .replace( /&/g, '&amp;' )
   .replace( /"/g, '&quot;' )
   .replace( /'/g, '&#39;' )
   .replace( /</g, '&lt;' )
   .replace( />/g, '&gt;' );
}

/**
 *
 */
function submitErrors(errors){
  var messages = [];
  $.each(errors, function(k,v){ messages.push(v) });
  var html = '<div class="error-header">ERROR! Please fix the following errors:</div>';
  html += ('<div class="mts_error">' + messages.join('</div><div class="mts_error">') + '</div>');
  $('#message-dialog .errors-list').html(html);
  $('#message-dialog').dialog( 'open' );
}
