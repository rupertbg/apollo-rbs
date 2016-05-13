////// Calendar Configuration File //////
/////////////////////////////////////////

kendo.culture("en-NZ");

// FullCalendar socket.io event communication //

function eventCall(start, end, timezone, callback) {
	loading(true)
	if (window.resourceselection == '') {
		window.debugger('[CALENDAREVENTS] - Calling server for all resources');
	}
	else {
		window.debugger('[CALENDAREVENTS] - Calling server for: ' + window.resourceselection);
	}
	socket.emit('calendarRequest', { start: start, end: end, resources: window.resourceselection } )
	window.eventsLoaded = function eventsLoaded(eventData){
		callback()
	}
}

///// Main Calendar Resize //////

$(document).ready(function () {

	function calResize() {
		var calSpacing = (($(window.maincalendartarget).margin().top) + ($(window.maincalendartarget).margin().bottom) + ($(window.maincalendartarget).padding().top) + ($(window.maincalendartarget).padding().bottom) + ($(window.maincalendartarget).border().top) + ($(window.maincalendartarget).border().bottom));
		var siteSize = ($('header').outerHeight( true ) + $('#toolbartop').outerHeight( true ) + $('#toolbarbottom').outerHeight( true ) + $('footer').outerHeight( true ));
		var viewSize = $(window).height();
		var calSize = (viewSize - (siteSize + calSpacing));
		if ($(window).width() > 640) {
			if (window.menuLeftOpen && window.menuRightOpen) {
				var calWidth = $(window).width() - ($('#menuleft').width() + $('#menuright').width());
				$('#calendarcontainer').css('margin', '0 auto');
				$('#calendarcontainer').css('width', calWidth)
			}
			else if (window.menuRightOpen) {
				var calWidth = $(window).width() - $('#menuright').width();
				$('#calendarcontainer').css('left', '0');
				$('#calendarcontainer').css('right', '');
				$('#calendarcontainer').css('width', calWidth)
			}
			else if (window.menuLeftOpen) {
				var calWidth = $(window).width() - $('#menuleft').width();
				$('#calendarcontainer').css('left', '');
				$('#calendarcontainer').css('right', '0');
				$('#calendarcontainer').css('width', calWidth)
			}
			else {
				var calWidth = $(window).width()
				$('#calendarcontainer').css('left', '0');
				$('#calendarcontainer').css('right', '');
				$('#calendarcontainer').css('width', '100%' )
			}
	    $(window.maincalendartarget).fullCalendar('option', 'height', calSize);
			window.debugger('[WINDOWRESIZER] - Main calendar (' + window.maincalendartarget + ') resized');
		}
		else {
			$(window.maincalendartarget).fullCalendar('changeView', 'agendaDay')
			$(window.maincalendartarget).fullCalendar('option', 'height', calSize);
		}
	};

	function navResize() {

		var headerSize = $('header').outerHeight() + $('#toolbartop').outerHeight();
		var footerSize = $('footer').outerHeight();
		var navSize = ($(window).height() - headerSize - footerSize);

		$('[id^="menu"]').each(function() {

			$(this).css('height', navSize + 'px')
			$(this).css('top', headerSize + 'px')

		});
		window.debugger('[WINDOWRESIZER] - Navigation sliders resized');
	};


	$(window).resize(function() {
		navResize();
		calResize();
	});

	$(window).trigger('resize');

});
