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
    if ($(window).width() <= 640) {
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
    $('#resourcelist').show()
  });
});
