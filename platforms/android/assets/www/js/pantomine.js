// requier cordova.js
// require jquery.js
// require jquery.mobile.js

pantomine = {

    CANVAS_ID: 'image',
    BUTTON_ID: 'getpic',
    
    picture_source: null,
    destination_type: null,
    canvas: null,
    context: null,

    onReady: function () {
	if ($.mobile) {
	    $.support.cors = true;
	    $.mobile.allowCrossDomainPages = true;
	}

	if (navigator && navigator.camera) {
	    pantomine.picture_source = navigator.camera.PictureSourceType;
	    pantomine.destination_type = navigator.camera.DestinationType;
	} else {
	    pantomine.setCanvas('img/sky.jpg');
	}

	pantomine.canvas = document.getElementById(pantomine.CANVAS_ID);
	pantomine.context = pantomine.canvas.getContext('2d');

	$('#'+pantomine.BUTTON_ID).click(pantomine.capturePhoto);
	$('#'+pantomine.CANVAS_ID).click(pantomine.getColor);
    },

    getColor: function (evt) {
	var offset, x, y, image_data, pixel;

	offset = $(pantomine.canvas).offset();
	x = Math.floor(evt.pageX - offset.left);
	y = Math.floor(evt.pageY - offset.top);

	image_data = pantomine.context.getImageData(x, y, 1, 1);
	pixel = image_data.data;

	$('#rgb').val(pixel[0]+','+pixel[1]+','+pixel[2]);
	pantomine.getPantone(pixel[0], pixel[1], pixel[2]);
    },

    setCanvas: function (image_source) {
	var image = new Image();
	image.src = image_source;
	image.onload = function () {
	    pantomine.canvas.width = image.width;
	    pantomine.canvas.height = image.height;
	    pantomine.context.drawImage(image, 0, 0, image.width, image.height);
	};
    },    

    updateImageData: function (image_data) {
	pantomine.setCanvas('data:image/jpeg;base64,' + image_data);
    },

    updateImageURI: function (image_uri) {
	pantomine.setCanvas(image_uri);
    },

    showError: function (message) {
	alert('Image capture failed: ' + message);
    },

    capturePhoto: function () {
	navigator.camera.getPicture(pantomine.updateImageData, pantomine.showError, {
		quality: 50,
		destinationType: navigator.camera.DestinationType.DATA_URL });
    },

    capturePhotoEdit: function () {
	navigator.camera.getPicture(pantomine.updateImageURI, pantomine.showError, {
		quality: 50,
		destinationType: pantomine.destination_type.DATA_URL });
    },

    getPhoto: function (source) {
	navigator.camera.getPicture(pantomine.updateImageURI, pantomine.showError, {
		quality: 50,
		destinationType: pantomine.destination_type.FILE_URI,
		sourceType: source });
    },
    
    getPantone: function (r, g, b) {
	var url = 'http://www.harrisonaw.com/pantomine/'+r+'/'+g+'/'+b+'/'; 

	$('#pantone').val('Loading...');
	$.ajax({
		url: url,
		method: 'GET',
	        dataType: 'jsonp',
		jsonp: 'callback',
	    }).done(function (data, textStatus, jqXHR) {
		    var name;
		    for (name in data) {
			$('#pantone').val(name);
			break;
		    }
		}).fail(function (jqXHR, textStatus, error) {
			alert(textStatus + '; ' + error);
		    });
    }
};

document.addEventListener('deviceready', pantomine.onReady, false);
//$(pantomine.onReady);