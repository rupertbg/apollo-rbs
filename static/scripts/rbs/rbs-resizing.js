$(document).ready(function () {
	if ($(window).resize && ($(window).width() <= 640)) {
		window.debugger('[DISPLAY MODE] - Mobile View');
	}
	else if ($(window).resize && ($(window).width() <= 960 && $(window).width() >= 640)) {
		window.debugger('[DISPLAY MODE] - Tablet View');
	}
	else {
		window.debugger('[DISPLAY MODE] - Desktop View');
	}
});
/////////////////////////////////

$(document).ready(function () {

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

	function infoResize() {

		var headerSize = $('header').outerHeight();
		var footerSize = $('footer').outerHeight();
		var mapSize = $('#resourcemap').outerHeight();
		var pageSize = ($(window).height() - headerSize - footerSize);
		var infoSize = (pageSize - mapSize);

		$('#roomsinfo').css('height', pageSize)
		if (!$('#resourcemap').css('visibility') == 'hidden') {
			$('#resourceselect').css('height', infoSize)
		}
		else {
			$('#resourceselect').css('height', pageSize)
		}
		if ($(window).width() <= 640) {
			$('#resourcelist').hide()
			$('#mobileresourcemenu').show()
			$('#resourcecontainer').css('width', '100%')
		}
		else {
			$('#resourcelist').show()
			$('#mobileresourcemenu').hide()
			$('#resourcecontainer').css('width', '')
		}
		window.debugger('[WINDOWRESIZER] - Info section resized');
	};

	$(window).resize(function() {
		navResize();
		infoResize();
	});

	$(window).trigger('resize');

});

///// Main Calendar Resize //////

window.maincalendarresize = $(document).ready(function () {

			function calResize() {

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

				var calSpacing = (($(window.maincalendartarget).margin().top) + ($(window.maincalendartarget).margin().bottom) + ($(window.maincalendartarget).padding().top) + ($(window.maincalendartarget).padding().bottom) + ($(window.maincalendartarget).border().top) + ($(window.maincalendartarget).border().bottom));
	      var siteSize = (($('header').outerHeight( true ) + $('#toolbartop').outerHeight( true ) + $('#toolbarbottom').outerHeight( true ) + $('footer').outerHeight( true )));
	      var viewSize = $(window).height();

	      var calSize = (viewSize - (siteSize + calSpacing));

	      $(window.maincalendartarget).fullCalendar('option', 'height', calSize);
				window.debugger('[WINDOWRESIZER] - Main calendar (' + window.maincalendartarget + ') resized');
			};

      $(window).resize(function() {
				calResize();
      });

      $(window).trigger('resize');

});
