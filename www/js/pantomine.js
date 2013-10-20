// require cordova.js
// require jquery.js
// require jquery-ui.js

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

	$('#getpic').click(pantomine.getPhoto);
	$('#'+pantomine.CANVAS_ID).click(pantomine.getColor);
	$('#cell').click(function () {
		pantomine.capturePhoto();
		$('#overlay').css('display', 'none');
		$('#container').css('display', 'block');
	    });
	$('#tooltip').click(function () {
		$('#tooltip').css('display', 'none');
	    });
	$('#tab').click(function () {
		var $lefty = $($('#swatches')[0]);
		$lefty.animate({
			left: parseInt($lefty.css('left'),10) == 0 ?
			    -$lefty.outerWidth() :       
			0 
			    });  
	    });
		
    },

    getHex: function (r, g, b) {
	var hex;

	hex = ((r << 16) + (g << 8) + b).toString(16);
	if (hex.length == 4) {
	    hex = '#00' + hex;
	} else if (hex.length == 5) {
	    hex = '#0' + hex;
	} else {
	    hex = '#' + hex;
	}

	return hex;
    },

    getContrastHex: function (r, g, b) {
	if (r < 127 && g < 127 && b < 127) {
	    return '#ffffff';
	}
	return '#000000';
    },


    /* Get color from canvas */
    getColor: function (evt) {
	var offset, x, y, image_data, pixel, r, g, b, hex;

	offset = $('#image').offset();
	x = Math.floor(evt.pageX - offset.left);
	y = Math.floor(evt.pageY - offset.top);

	image_data = pantomine.context.getImageData(x, y, 1, 1);
	pixel = image_data.data;

	r = parseInt(pixel[0]);
	g = parseInt(pixel[1]);
	b = parseInt(pixel[2]);

	hex = pantomine.getHex(r, g, b);   
	$('#tooltip').text(''+r+','+g+','+b).css('display', 'block').css('background-color', hex).css('color', pantomine.getContrastHex(r, g, b));
	pantomine.placeTooltip(x, y);
	pantomine.getPantone(r, g, b);
    },

    /* Set the image on the canvas */
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
		    var swatches, colors, i;

		    colors = Object.keys(data);
		    swatches = $('.swatch');		    
		    $.each(swatches, function (i) {
			    $(swatches[i]).css('background-color', data[colors[i]]).text(colors[i]);
			});
		}).fail(function (jqXHR, textStatus, error) {
			alert(textStatus + '; ' + error);
		    });
    },

    placeTooltip: function (x, y) {
	$('#tooltip').css('top', (y > 100) ? y - 100 : y).css('left', (x > 100) ? x - 100 : x);
    }
};

document.addEventListener('deviceready', pantomine.onReady, false);
//$(pantomine.onReady);