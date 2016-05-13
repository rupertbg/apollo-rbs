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
socket.on('bookingData', function(eventData) {
	if (eventData) {
		setTimeout(function(){
			window.debugger('[SOCKET] - Received data from server')
			window.debugger('[SOCKET] - ' + eventData.events.length + ' events loaded')
			var origins = [];
			$('[id^="veventcontainer"]').each(function(){
				if ($(this).attr('data-origin')) {
					var o = $(this).attr('data-origin');
					if (origins.indexOf(o) == -1) {
						origins.push(parseInt(o))
					}
				}
			});
			if (window.bookingdata) {
				var j = window.bookingdata.length;
				while( j-- ) {
					if (origins.indexOf(parseInt(window.bookingdata[j].origin)) == -1) {
						window.debugger('[SOCKET] - Removed origin ' + window.bookingdata[j].origin)
						window.bookingdata.splice(j, 1);
					}
					else if (window.bookingdata[j].origin === eventData.origin) {
						window.debugger('[SOCKET] - Updating data for origin ' + window.bookingdata[j].origin)
						window.bookingdata.splice(j, 1);
					}
				}
			}
			window.bookingdata.push(eventData)
			loading(false)
		}, 25)
	}
})
socket.on('calendarData', function(eventData) {
	window.debugger('[SOCKET] - Received data from server')
	if (!loading) {
		loading(true)
	}
	if (eventData.events.length > 0) {
		window.debugger('[SOCKET] - Loading ' + eventData.events.length + ' event(s)')
	}
	else {
		window.debugger('[SOCKET] -  Received empty event data')
	}
	setTimeout(function(){
		$(window.activecalendartarget).fullCalendar('removeEventSource', window.serverSource);
		$(window.activecalendartarget).fullCalendar('addEventSource', eventData);
		window.serverSource = eventData
		window.eventsLoaded(eventData)
	}, 250)
})
socket.on('roomFree', function(bool) {
	window.debugger('[SOCKET] - Received resource status')
	if (bool) {
		window.debugger('[SOCKET] - Resource free')
		if (/ipad/i.test($('#resourcetype').text())) {
			$('#resourcefree').html('Available <p><a href="http://www.otago.ac.nz/its/forms/otago106010.html">Make a booking</a></p>')
		}
		else {
			$('#resourcefree').html('Available <p><a href="booking.html">Make a booking</a></p>')
		}
	}
	else {
		window.debugger('[SOCKET] - Resource in use')
		$('#resourcefree').html('Currently in use')
	}
})
socket.on('analysisData', function(eventData) {
	generateResourceInfo(eventData)
	$('#dataloading').hide()
	$('.datatoggle').css('visibility', 'visible')
})
socket.on('resourceUpdate', function(){
	window.debugger('[SOCKET] - Server update received')
	$('#update').fadeIn(300)
});
socket.on('disconnect', function(){
	window.debugger('[SOCKET] - Disconnected')
});
