//////////////////////////////////////////////////////////////////
/////////////////////////// Debug Mode ///////////////////////////
//////////////////////////////////////////////////////////////////

/******************/
window.debug = false;
/******************/

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

// insert window.debugger('message') somewhere you need to debug. Works the same as console.log()
// Set to true to activate debug mode, many built in console loggers already

window.debugger = function (x) {
	if (window.debug == true) {
     console.log(x);
  };
};

// General debuggers //

$(document).ready(function () {
	if (window.debug == true) {
		$('#debug').removeClass('hidden');
	}
});

// Loading //

function loading(bool, visual) {
  if (bool) {
		window.debugger('[LOADING] - On')
		if (visual) {
			$('#loading').show()
			$(this).parents('[id^="veventcontainer"]').find('[id^="miniloading"]').show();
		}
	  $('section button').each(function() {
	    $(this).prop('disabled', true);
	  });
		$('.k-dropdown').each(function() {
      $(this).children('input, select').data('kendoDropDownList').enable(false);
    });
    $('.k-datetimepicker').each(function() {
      $(this).find('input').data('kendoDateTimePicker').enable(false);
    });
	}
	else if (!bool) {
		$('#loading').hide()
		$(this).parents('[id^="veventcontainer"]').find('[id^="miniloading"]').hide();
	  $('section button').each(function() {
	    $(this).prop('disabled', false);
	  });
    $('.k-dropdown').each(function() {
      $(this).children('input, select').data('kendoDropDownList').enable(true);
    });
    $('.k-datetimepicker').each(function() {
      $(this).find('input').data('kendoDateTimePicker').enable(true);
    });
		window.debugger('[LOADING] - Off')
	}
};

// Navigation //

$(document).ready(function () {

	// General body resizing //

	function bodyResize() {
		var headerSize = $('header').outerHeight()

		$('section.mainsection').css('top', headerSize)
	}

	$(window).resize(function() {
		bodyResize()
	});

	$(window).trigger('resize');

	$('#navbuttons a').each(function() {
		if (document.location.pathname.match(/[^\/]+$/)) {
			if ($(this).attr('href') == document.location.pathname.match(/[^\/]+$/)[0]) {
				$(this).css('border-bottom', 'thin solid #aaa')
			}
		}
		else {
			if ($(this).attr('href') == '/') {
				$(this).css('border-bottom', 'thin solid #aaa')
			}
		}
	});

	// Feedback //
	$('#thanks').hide()
	$('#feedbacktitle').off('click').on('click', function(){
		if ($('#feedback').css('bottom') == '-260px') {
			$('#feedback').css('bottom', '0')
		}
		else {
			$('#feedback').css('bottom', '-260px')
		}
	})
	function hollowClick() {
		$('.ratingstar').off('click').on('click', function(){
			for (var i = 0; i <= parseInt($(this).attr('data-rating')); i++) {
				$('[data-rating="' + i + '"]').replaceWith('<img class="ratingstargold" src="./img/stargold.svg" data-rating="' + i + '"/>')
			}
			goldClick()
			window.rating = parseInt($(this).attr('data-rating'))
		})
	}
	function goldClick() {
		$('.ratingstargold').off('click').on('click', function(){
			for (var i = 5; i > parseInt($(this).attr('data-rating')); i--) {
				$('[data-rating="' + i + '"]').replaceWith('<img class="ratingstar" src="./img/starhollow.svg" data-rating="' + i + '"/>')
			}
			hollowClick()
			window.rating = parseInt($(this).attr('data-rating'))
		})
	}
	hollowClick()
	$('#feedbackbody button').click(function() {
	    window.feedback = $('#feedbackbody textarea').val()
	    socket.emit('userFeedback', { rating: window.rating, feedback: window.feedback } )
			$('#feedback').css('bottom', '-400px')
			for (var i = 5; i > 0; i--) {
				$('[data-rating="' + i + '"]').replaceWith('<img class="ratingstar" src="./img/starhollow.svg" data-rating="' + i + '"/>')
			}
			$('#feedbackbody textarea').val('');
			$('#thanks').fadeIn(300)
			setTimeout(function(){
				$('#thanks').fadeOut(1500)
			}, 1000)
	});
});

//////////////////////////////////
/////// App-wide Variables ///////
//////////////////////////////////

// Main Calendar View //

window.maincalendartarget = '#maincalendar';

// Booking Form //

window.minicalendartarget = '#bookingcalendar';

window.minicalendarcontainer = '#minical';

window.bookingformtarget = '#mainform';

window.formdialog = '#bookingform';

window.resourceselectors = '.room:checked';

window.reasonselectors = '.reason:checked';

window.roomlists = '#resourceselectors div ul';

window.attend = '1';

window.generatedicsfiles = [];

window.neweventindex = 0;

window.menuLeftOpen = false;

window.menuRightOpen = false;

window.resourceselection = '';

window.mintime = '06:00';

window.maxtime = '19:00';

window.rating = 0;

window.previousView = 'timelineDay';

///////////////////////////////////
