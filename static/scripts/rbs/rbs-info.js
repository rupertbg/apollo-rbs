$(document).ready(function() {
  $('#resourcelist').append(
		function() {
			var types = [],
					listitems = [];
			for (var i = 0; i < window.allresources.length; i++) {
				if (types.indexOf(window.allresources[i].type) == -1) {
					types.push(window.allresources[i].type)
				}
			}
			for (var i = 0; i < types.length; i++) {
				listitems.push('<li id="' + types[i].replace(/\s+/g, '') + '"><h2>' + types[i] + '</h2></li>')
			}
			listitems.join('')
			return listitems
		}
	);
  for (var i = 0; i < window.allresources.length; i++) {
    var resource = window.allresources[i]
    $('#' + resource.type.replace(/\s+/g, '')).append('<a id="' + resource.id + '" href="" onclick="return false;"><li>' + resource.title + '</li></a>')
  }
  $('#resourcelist a').off('click').on('click', function(){
    window.debugger('[SOCKET] - Sending room status request')
    $('#resourcefree').empty()
    socket.emit('roomCheck', $(this).attr('id'))
    $('#resourceselect').css('visibility', 'visible')
    j = window.allresources.length;
    while( j-- ) {
      if(window.allresources[j].id === $(this).attr('id')) break;
    }
    if (window.allresources[j].type == 'Lecture Theatres') {
      $('#resourcetitle').html(window.allresources[j].title)
      $('#resourcetype').html('Category: ' + window.allresources[j].type)
      $('#resourcecapacity').html('Capacity: ' + window.allresources[j].capacity)
      $('#levelcmap').css('opacity', '1')
      $('#leveldmap').css('opacity', '1')
      $('#resourcedescription').html(window.allresources[j].description)
    }
    else if (window.allresources[j].type == 'Vivid Trolleys') {
      $('#resourcetitle').html(window.allresources[j].title)
      $('#resourcetype').html('Category: ' + window.allresources[j].type)
      $('#resourcecapacity').html('Capacity: Requires a compatible room booking')
      $('#levelcmap').css('opacity', '0.5')
      $('#leveldmap').css('opacity', '0.5')
      $('#resourcedescription').html(window.allresources[j].description)
    }
    else if (window.allresources[j].level == 'c') {
      $('#resourcetitle').html(window.allresources[j].title)
      $('#resourcetype').html('Category: ' + window.allresources[j].type)
      $('#resourcecapacity').html('Capacity: ' + window.allresources[j].capacity)
      $('#levelcmap').css('opacity', '1')
      $('#leveldmap').css('opacity', '0.5')
      $('#resourcedescription').html(window.allresources[j].description)
    }
    else if (window.allresources[j].level == 'd'){
      $('#resourcetitle').html(window.allresources[j].title)
      $('#resourcetype').html('Category: ' + window.allresources[j].type)
      $('#resourcecapacity').html('Capacity: ' + window.allresources[j].capacity)
      $('#levelcmap').css('opacity', '0.5')
      $('#leveldmap').css('opacity', '1')
      $('#resourcedescription').html(window.allresources[j].description)
    }
    else {
      $('#resourcetitle').html(window.allresources[j].title)
      $('#resourcetype').html('Category: ' + window.allresources[j].type)
      if (window.allresources[j].capacity > 0) {
        $('#resourcecapacity').html('Capacity: ' + window.allresources[j].capacity)
      }
      else {
        $('#resourcecapacity').html('Capacity: N/A')
      }
      $('#levelcmap').css('opacity', '1')
      $('#leveldmap').css('opacity', '1')
      $('#resourcedescription').html(window.allresources[j].description)
    }
    $('#resourcemap img').each(function(){
      $(this).parents('a').addClass('image-popup-no-margins');
      $(this).parents('a').magnificPopup({
    		type: 'image',
    		closeOnContentClick: true,
    		closeBtnInside: false,
    		fixedContentPos: true,
    		mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
    		image: {
    			verticalFit: true
    		},
    		zoom: {
    			enabled: true,
    			duration: 300 // don't foget to change the duration also in CSS
    		}
    	});
    })
    if ($(window).width() <= 960) {
      $('#resourcelist').hide()
		}
  })
  $('#resourcemap img').each(function(){
    $(this).parents('a').addClass('image-popup-no-margins');
    $(this).parents('a').magnificPopup({
      type: 'image',
      closeOnContentClick: true,
      closeBtnInside: false,
      fixedContentPos: true,
      mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
      image: {
        verticalFit: true
      },
      zoom: {
        enabled: true,
        duration: 300 // don't foget to change the duration also in CSS
      }
    });
  })
  $('#resourcelist a').first().click()
  $('.mobileresourcemenu').off('click').on('click', function(){
    $('#resourcelist').show();
  });
});

// Resizing //

$(document).ready(function () {

	function infoResize() {

		var headerSize = $('header').outerHeight();
		var footerSize = $('footer').outerHeight();
		var mapSize = $('#resourcemap').outerHeight();
		var pageSize = ($(window).height() - headerSize - footerSize);
		var infoSize = (pageSize - mapSize);

    $('#roomsinfo').css('height', pageSize)

    if ($(window).width() > 960) {
      if (!$('#resourcemap').css('visibility') == 'hidden') {
  			$('#resourceselect').css('height', infoSize);
  		}
  		else {
  			$('#resourceselect').css('height', pageSize);
  		}
      $('#resourcelist').show()
			$('#mobileresourcemenu').hide()
			$('#resourcecontainer').css('width', '')
    }
		else if ($(window).width() <= 960) {
			$('#mobileresourcemenu').show()
			$('#resourcecontainer').css('width', '100%')
		}
		window.debugger('[WINDOWRESIZER] - Info section resized');
	};

	$(window).resize(function() {
		infoResize();
	});

	$(window).trigger('resize');

});
