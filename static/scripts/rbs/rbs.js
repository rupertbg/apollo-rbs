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

// Socket //

var socket = io.connect(window.location.host, { 'force new connection': true });
socket.on('connect', function(){
	window.debugger('[SOCKET] - Connected')
	window.debugger('[SOCKET] - Session ID: ' + socket.id)
	socket.emit('Connection ID', socket.id)
	window.socketid = socket.id
	$('#disconnected').fadeOut(300)
});
socket.on('serverError', function(err){
	$('#error').fadeIn(300)
	window.debugger('[SOCKET] - Server error: ' + err)
	setTimeout(function(){
		$('#error').fadeOut(300)
	}, 2500);
})
socket.on('calendarData', function(eventData) {
	loading(true)
	setTimeout(function(){
		window.debugger('[CALENDAREVENTS] - Received data from server')
		$(window.activecalendartarget).fullCalendar('removeEventSource', window.serverSource);
		$(window.activecalendartarget).fullCalendar('addEventSource', eventData);
		window.serverSource = eventData
		window.debugger('[CALENDAREVENTS] - ' + eventData.events.length + ' events loaded into calendar')
		window.eventsLoaded(eventData)
	}, 250)
})
socket.on('roomFree', function(bool) {
	window.debugger('[SOCKET] - Received room status')
	if (bool) {
		window.debugger('[SOCKET] - Room free')
		$('#resourcefree').html('Available <p><a href="booking.html">Make a booking</a></p>')
	}
	else {
		window.debugger('[SOCKET] - Room in use')
		$('#resourcefree').html('Currently in use')
	}
})
socket.on('analysisData', function(eventData) {
	generateResourceInfo(eventData)
})
socket.on('resourceUpdate', function(){
	window.debugger('[SOCKET] - Server update received')
	$('#update').fadeIn(300)
});
socket.on('disconnect', function(){
	window.debugger('[SOCKET] - Disconnected')
});

// Navigation //

$(document).ready(function () {
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
});

// FullCalendar socket.io event communication //

function eventCall(start, end, timezone, callback) {
	loading(true)
	if (window.resourceselection == '') {
		window.debugger('[CALENDAREVENTS] - Calling server for all resources');
	}
	else {
		window.debugger('[CALENDAREVENTS] - Calling server for: ' + window.resourceselection);
	}
	socket.emit('getData', { start: start, end: end, resources: window.resourceselection } )
	window.eventsLoaded = function eventsLoaded(eventData){
		callback()
	}
}

// Loading //

function loading(bool) {
  if (bool) {
		window.debugger('[LOADING] - On')
		$('#loading').show()
	  $('section button').each(function() {
	    $(this).prop('disabled', true);
	  });
		$('.k-dropdown').each(function() {
      $(this).children('input, select').data('kendoDropDownList').enable(false);
    });
    $('.k-datetimepicker').each(function() {
      $(this).find('input').data('kendoDateTimePicker').enable(false);
    });
    $(this).parents('[id^="veventcontainer"]').find('[id^="miniloading"]').show();
	}
	else if (!bool) {
		$('#loading').hide()
	  $('section button').each(function() {
	    $(this).prop('disabled', false);
	  });
		$(this).parents('[id^="veventcontainer"]').find('[id^="miniloading"]').hide();
    $('.k-dropdown').each(function() {
      $(this).children('input, select').data('kendoDropDownList').enable(true);
    });
    $('.k-datetimepicker').each(function() {
      $(this).find('input').data('kendoDateTimePicker').enable(true);
    });
		window.debugger('[LOADING] - Off')
	}
};

//////////////////////////////////
/////// App-wide Variables ///////
//////////////////////////////////

// Main Calendar View //

window.maincalendartarget = '#maincalendar'

window.dataanalyticsengine = '#dataengine'

// Booking Form //

window.minicalendartarget = '#bookingcalendar'

window.minicalendarcontainer = '#minical'

window.bookingformtarget = '#mainform'

window.formdialog = '#bookingform'

window.resourceselectors = '.room:checked'

window.reasonselectors = '.reason:checked'

window.roomlists = '#resourceselectors div ul'

window.attend = '1'

window.generatedicsfiles = []

window.today = moment();

window.neweventindex = 0;

window.menuLeftOpen = false;

window.menuRightOpen = false;

window.resourceselection = ''

///////////////////////////////////

kendo.culture("en-NZ");
