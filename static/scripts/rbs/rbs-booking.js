
var isClick;
$(document).bind('click', function() { isClick = true; })
$(document).bind('keypress', function() { isClick = false; });

var now = new Date(moment().startOf('hour'))
var nowish = new Date(moment().startOf('hour').add('30', 'minutes'))

/*******************************
      Resource Selectors
*******************************/

function resourceselector(calselect, resselect) {
	// collect checked states //
	window.resourceselection = $(resselect).map(function(_, el) {
		return $(el).val();
	}).get();
	resourceselectionempty = (!$.trim(window.resourceselection).length);
	window.debugger('[RESOURCESELECT] - Selection empty: ' + resourceselectionempty);
		// remove and re-add all events and resources if no selection //
	if(resourceselectionempty) {
		// If no checkboxes checked remove all resources and eventsources and re-add all... //
		window.debugger('[RESOURCESELECT] - Removing all events');
		$(calselect).fullCalendar('removeEvents');
		window.debugger('[RESOURCESELECT] - Adding all resources and event sources');
		for(var k = 0; k < window.allsources.length; ++k) {
			$(calselect).fullCalendar('addResource', window.allresources[k]);
			window.debugger('[RESOURCESELECT] - Adding resource = ' + (window.allresources[k].title));
		};
	}
		// ...Otherwise remove all sources and resources, add sources and resources by id in window.resourceselection //
		// There is a custom function in the included fullcalendar.js that allows the use of removeEventSources //
		// Don't use a standard fullcalendar.js file with this app until this feature has been merged          //
	else {
		window.debugger('[RESOURCESELECT] - Currently selected resourceIds = ' + (window.resourceselection));
		$(calselect).fullCalendar('removeEvents');
		for(var l = 0; l < window.allsources.length; ++l) {
		$(calselect).fullCalendar('removeResource', window.allresources[l]);
		};
		for(var i = 0; i < window.resourceselection.length; ++i) {
			for(var j = 0; j < window.allresources.length; ++j) {
				if(window.allresources[j].id == window.resourceselection[i]) {
					window.debugger('[RESOURCESELECT] - Adding resource array item = ' + (window.allsources[j].id))
					$(calselect).fullCalendar('addResource', window.allresources[j]);
					break;
				};
			};
		};
	};
};

/*******************************
         Selector Reset
*******************************/

function selectorsreset(formtarget) {
	$(window.resourceselectors).map(function(_, el) {
  	$(el).prop('checked', false);
  })
  $(window.reasonselectors).map(function(_, el) {
  	$(el).prop('checked', false);
  })
	window.debugger('[SELECTORSRESET] - Checkboxes cleared')
};

/*******************************
      Start Date Selector
*******************************

function startdateselector(calselect, dateselect) {
	window.debugger('[DATESELECT] - Function start');
	startdateempty = (!$.trim(window.startdateselection).length);
	window.debugger('[DATESELECT] - Start date selection empty: ' + startdateempty);
	if(!startdateempty) {
		window.debugger('[DATESELECT] - Start date input: ' + window.startdateselection);
		window.startdateselection = $.fullCalendar.moment(window.startdateselection).format();
		window.debugger('[DATESELECT] - changing ' + calselect + ' to timeline view')
		$(calselect).fullCalendar('changeView', 'timelineDay');
		window.debugger('[DATESELECT] - changing ' + calselect + ' to auto height')
		$(calselect).fullCalendar('option', 'height', 'auto');
		window.debugger('[DATESELECT] - moving ' + calselect + ' to: ' + (window.startdateselection))
		window.timelineScrollHack(calselect)
	};
};

/*******************************
       Booking Attendance
*******************************/

function bookingattendance(attend) {
	document.querySelector('#attendance').value = attend;
	document.querySelector('#attendancebar').value = attend;
	var roomlistsmap = $(roomlists).map(function(_, el) {
		return $(el).attr('class');
	}).get();
	window.debugger('[BOOKINGATTENDACE] - Values collected')
	var resarray = $('.room').sort(valueaz).toArray()
	function valueaz(a, b){
			return ($(b).attr('value')) < ($(a).attr('value')) ? 1 : -1;
	}
	window.debugger('[BOOKINGATTENDACE] - Values sorted & mapped')
	if ($('.showall').is(":checked")) {
		for(var j = 0; j < window.allresources.length; ++j) {
			var currentres = $(resarray).get([j] - 1);
			$(currentres).parent().show();
			$(currentres).removeAttr('disabled');
			window.debugger('[BOOKINGATTENDACE] - Show all active')
		}
		for (var l = 0; l < roomlistsmap.length; l++) {
			var roomlist = roomlistsmap[l]
			if($('.' + roomlist + ' ul').children(':visible').length < 1) {
				$('.' + roomlist).children('.capacityerror').show();
			}
			else {
				$('.' + roomlist).children('.capacityerror').hide();
			};
		};
	}
	else {
		for(var i = 0; i < window.allresources.length; ++i) {
			var currentres = $(resarray).get([i]);

			$(currentres).parent().hide();
			$(currentres).attr('disabled', 'disabled');
			if(attend <= parseInt(window.allresources[i].capacity) || parseInt(window.allresources[i].capacity) == 0) {
				$(currentres).parent().show();
				$(currentres).removeAttr('disabled');
				window.debugger('[BOOKINGATTENDACE] - ' + attend + ' | Available Room: ' + window.allresources[i].title + ' | Capacity: ' + window.allresources[i].capacity);
			}
			else {
				$(currentres).prop('checked', false);
				$(currentres).parent().hide();
				$(currentres).attr('disabled', 'disabled');
				window.debugger('[BOOKINGATTENDACE] - ' + window.allresources[i].title + ' hidden')
			};
		};
		for (var l = 0; l < roomlistsmap.length; l++) {
			var roomlist = roomlistsmap[l]
			if($('.' + roomlist + ' ul').children(':visible').length < 1) {
				$('.' + roomlist).children('.capacityerror').show();
			}
			else {
				$('.' + roomlist).children('.capacityerror').hide();
			};
		};
	};
};

/*******************************
    Booking Event Generator
*******************************/

function newevent() {
  window.debugger('[EVENTGEN] - Begin')
	// Step newevent counter //
	window.neweventindex++;
	// Clone booking request template //
	$('#vevents').append($('#newevent').clone().attr('id','newevent' + window.neweventindex));
	$('#newevent' + window.neweventindex).css('display','flex');
	$('#newevent' + window.neweventindex + ' :input').each(function(){
		$(this).attr('name',$(this).attr('name') + window.neweventindex);
		$(this).attr('id',$(this).attr('id') + window.neweventindex);
	});
	$('#newevent' + window.neweventindex + ' label').each(function(){
		$(this).attr('for',$(this).attr('for') + window.neweventindex);
	});
	$('#newevent' + window.neweventindex + ' div').each(function(){
		$(this).attr('id',$(this).attr('id') + window.neweventindex);
	});
	$('#newevent' + window.neweventindex + ' img').each(function(){
		$(this).attr('id',$(this).attr('id') + window.neweventindex);
	});
	$('#newevent' + window.neweventindex + ' p').each(function(){
		$(this).attr('id',$(this).attr('id') + window.neweventindex);
	});
	$('#removeevent' + window.neweventindex).click(function(){
			$(this).parent().remove();
	});
  window.debugger('[EVENTGEN] - Created event ID: ' + window.neweventindex)

	// Initialize content //

	$('#newevent' + window.neweventindex + ' div[id^="veventdetails"]').append(
		'<div id="detailsleft' + window.neweventindex + '">'
		+ '<label for="eventitle">Booking Title (Available in Calendar)</label><input placeholder="Required" class="noenter" type="text" name="title' + window.neweventindex + '" required="required">'
		+ '</div>'
		+ '<div id="detailsright' + window.neweventindex + '">'
		+ '<label for="presenter">Presenter Name</label><input placeholder="Required" class="noenter" type="text" name="presenter' + window.neweventindex + '" required="required">'
		+ '</div>'
	);

	$('#newevent' + window.neweventindex + ' div[id^="veventdescription"]').append(
	'<label for="description' + window.neweventindex + '">Booking Description (Available in calendar)</label>'
	+ '<textarea id="description' + window.neweventindex + '" class="noenter" name="description' + window.neweventindex + '"></textarea>'
	);

	$('#newevent' + window.neweventindex + ' div[id^="veventdescription"]').append(
	'<label for="receptioninfo' + window.neweventindex + '">Information for Reception (Private)</label>'
	+ '<textarea id="receptioninfo' + window.neweventindex + '" class="noenter" name="receptioninfo' + window.neweventindex + '"></textarea>'
	);

	$('#newevent' + window.neweventindex + ' div[id^="veventdescription"]').append(
	'<label for="itinfo' + window.neweventindex + '">Information for IT / AV Support (Private)</label>'
	+ '<textarea id="itinfo' + window.neweventindex + '" class="noenter" name="itinfo' + window.neweventindex + '"></textarea>'
	);

  $('#newevent' + window.neweventindex + ' div[id^="containerdatetime"]').append(
  '<label for="timestart' + window.neweventindex + '">Event Begins: </label><input onkeypress="return window.noKey(event)" class="k-input timestart" type="text" value="" name="timestart' + window.neweventindex + '" id="timestart' + window.neweventindex + '">'
   + '<label for="timeend' + window.neweventindex + '">Event Ends: </label><input onkeypress="return window.noKey(event)" class="k-input timeend" type="text" value="" name="timeend' + window.neweventindex + '" id="timeend' + window.neweventindex + '">'
  );

  $('#newevent' + window.neweventindex + ' div[id^="containerdatetime"]').append(
   '<button type="button" id="loaddatetime'+ window.neweventindex + '" value="Select Date">Select Date</button>'
  );

  $('#newevent' + window.neweventindex + ' div[id^="containerdatetime"] button').kendoButton();

	$('#newevent' + window.neweventindex + ' input[id^="timestart"]').kendoDateTimePicker({
			value: now,
			min: now,
			interval: 30,
			start: 'year',
      close: datetimeClose
	}).data("kendoDateTimePicker");

  $('#newevent' + window.neweventindex + ' input[id^="timestart"]').off('focus').on('focus', function() {
    var cal = $(this).data("kendoDateTimePicker")
    $(this).keyup(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 9) {
           cal.open('date')
        }
    });
  });

	$('#newevent' + window.neweventindex + ' input[id^="timeend"]').kendoDateTimePicker({
			interval: 30,
			min: nowish,
			value: nowish,
			start: 'year',
      close: datetimeClose
	}).data("kendoDateTimePicker");

  function datetimeClose(e) {
    if (e.view == 'date') {
      this.open('time');
    }
  }

  $('#newevent' + window.neweventindex + ' input[id^="timeend"]').off('focus').on('focus', function() {
    var cal = $(this).data("kendoDateTimePicker")
    $(this).keyup(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 9) {
           cal.open('date')
        }
    });
  });

  window.debugger('[EVENTGEN] - DateTimePickers initialized on event ID: ' + window.neweventindex)

	///////// Enter -> Tab key fix ////////
	$('.noenter').keydown( function(e) {
			var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
			if(key == 13) {
					e.preventDefault();
					var inputs = $(this).closest('form').find(':input:visible');
					inputs.eq( inputs.index(this)+ 1 ).focus();
			}
	});
	initBookingSelectors();
	$('#resourcecal' + window.neweventindex).fullCalendar(window.bookingengine);
  window.debugger('[EVENTGEN] - FullCalendar initialized on event ID: ' + window.neweventindex)
	$('#newevent' + window.neweventindex).find('[id^="resourcecal"]').empty(); // Comment this out to debug the selection calendar engine.
  window.debugger('[EVENTGEN] - End')
};

/*******************************
       Booking Selectors
*******************************/

function initBookingSelectors() {

	var bookingevent = $('fieldset[id^="newevent"]:visible').map(function(_, el) {
		return $(el).attr('id');
	}).get();

	// Kendo UI DateTimePickers //

	function startChange(start, end) {
		var startTime = start.value();
		if (startTime) {
			startTime = new Date(startTime);
			startTime.setMinutes(startTime.getMinutes() + start.options.interval);
			start.min(now);
			end.min(startTime);
			end.value(startTime);
		};
	};

	$('input[id^="timestart"]').off('change').on('change', function() {
		startChange($(this).data("kendoDateTimePicker"), $(this).parents('[id^="veventcontainer"]').find('input[id^="timeend"]').data("kendoDateTimePicker"));
	});

	$('button[id^="loaddatetime"]').off('click').on('click', function() {
		resetDateSelection($(this));
		$(this).parents('[id^="veventcontainer"]').find('[id^="typeselect"]').append('<label for="bookingtype">Booking Type: </label><select class="bookingtype" data-placeholder="Select Booking Type..."></select>');
		$(this).parents('[id^="veventcontainer"]').find('.bookingtype').append('<option value="" selected>Select..</option>');
		$(this).parents('[id^="veventcontainer"]').find('.bookingtype').append(
			function() {
				var types = [],
						options = [];
				for (var i = 0; i < window.allresources.length; i++) {
					if (types.indexOf(window.allresources[i].type) == -1) {
						types.push(window.allresources[i].type)
					}
				}
				for (var i = 0; i < types.length; i++) {
					options.push('<option value="' + types[i]	+ '">' + types[i] + '</option>')
				}
				options.join('')
				return options
			}
		);
		$(this).parents('[id^="veventcontainer"]').find('select[class^="bookingtype"]').kendoDropDownList().data("kendoDropDownList");
		bookingSelectors($(this).parents('[id^="veventcontainer"]').find('select[class^="bookingtype"]'));
		resetCalendar($(this));
		loadCalendarDate($(this))
	});

};

/******************************
     Calendar Functionality
******************************/

function loadCalendarDate(el) {
	window.activecalendartarget = $(el).parents('[id^="veventcontainer"]').find('[id^="resourcecal"]')
	window.debugger('[CALENDARDATE] - Begin');
	var dateselect = $(el).parents('[id^="veventcontainer"]').find('[id^="timestart"]').data("kendoDateTimePicker").value();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcecal"]').fullCalendar('gotoDate', dateselect );
	window.debugger('[CALENDARDATE] - Loading ' + dateselect)
  window.debugger('[CALENDARDATE] - End');
}

function loadCalendarResults(el) {
	window.debugger('[CALENDARRESULTS] - Begin');
	window.bookedresources = [];
	var eventsInMemory = $(el).parents('[id^="veventcontainer"]').find('[id^="resourcecal"]').fullCalendar('clientEvents');
	var timestart = $(el).parents('[id^="veventcontainer"]').find('input[id^="timestart"]').data("kendoDateTimePicker").value();
	var timeend = $(el).parents('[id^="veventcontainer"]').find('input[id^="timeend"]').data("kendoDateTimePicker").value();
	window.debugger('[CALENDARRESULTS] - ' + eventsInMemory.length + ' events in memory')
	for(var i = 0; i < eventsInMemory.length; i++){
		var eventstart = new Date(eventsInMemory[i].start)
		var eventend = new Date(eventsInMemory[i].end)
		var selectionstart = new Date(timestart)
		var selectionend = new Date(timeend)
		var eventrange = moment.range(eventstart, eventend);
		var selectionrange = moment.range(selectionstart, selectionend);
		if(selectionrange.overlaps(eventrange) || eventrange.contains(selectionend) || eventrange.contains(selectionstart)){
			window.debugger('[CALENDARRESULTS] - Event: "' + eventsInMemory[i].title + '" in resource ID: "' + eventsInMemory[i].resourceId + '" conflicts with time selection.');
			window.bookedresources.push(eventsInMemory[i].resourceId);
		};
	};
  window.debugger('[CALENDARRESULTS] - ' + window.bookedresources.length + ' conflicting bookings found');
  window.debugger('[CALENDARRESULTS] - End');
};

function resetCalendar(el) {
  window.debugger('[CALENDARRESET] - Begin');
	window.resourceselection = '';
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcecal"]').fullCalendar('refetchEvents');
  window.debugger('[CALENDARRESET] - End');
}

/******************************
******************************/

function resourceSelection(resources, resourcename) {
  var newresources = [],
      parseCount = 0;
  for (var i = 0; i < resources.length; i++) {
    parseCount++
    newresources.push(resources[i].id)
    if (parseCount == resources.length) {
      window.resourceselection = newresources
      loadResources(resources, resourcename)
    }
  }
}

function initAttendance(el) {
	var veventId = $(el).parents('[id^="newevent"]').attr('id');
	$(el).parents('[id^="veventcontainer"]').find('[id^="extratypeoptions"]').append('<label for="' + veventId + 'attendance">Attendance: </label><input id="' + veventId + 'attendance"')
};

function loadRooms(el, rooms, roomtype) {
	window.debugger('[LOADROOMS] - "' + roomtype + '" selected')
	if (roomtype === undefined) {
		roomtype = ''
	}
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').append('<p class="roompresent">The following ' + roomtype + ' are available: </p>');
	for (var i = 0; i < rooms.length; i++) {
		var roomremain = rooms[i].id
		if ($.inArray(roomremain, window.bookedresources) == -1) {
			for (var j = 0; j < rooms.length; j++) {
				if (rooms[j].id == roomremain) {
					var roomtitle = rooms[j].title
					window.debugger('[LOADROOMS] - Adding ' + roomtitle)
				}
			}
			var roomcont = $(el).parents('[id^="newevent"]').attr('id').replace(/\D/g,'');
			$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').append('<div class="bookingroom"><input type="radio" id="' + roomtitle + '-' + roomcont + '" name="room' + roomcont + '" value="' + roomtitle + '" ><label for="' + roomtitle + '-' + roomcont + '">' + roomtitle + '</label></div>');
		}
	}
	if ( $(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').is(':empty') ) {
		$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
		$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').append('<img src="./img/warn.png" alt="warning"><p class="noroom">There are no ' + roomtype + ' rooms available during the selected time range</p>');
	}

}

function loadResources(el, resources, resourcename) {
	window.debugger('[LOADRESOURCES] - "' + resourcename + '" selected')
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').append('<p class="resourcepresent">The following ' + resourcename + ' are available: </p>');
	for (var i = 0; i < resources.length; i++) {
		var resremain = resources[i].id
		if ($.inArray(resremain, window.bookedresources) == -1) {
			for (var j = 0; j < resources.length; j++) {
				if (resources[j].id == resremain) {
					var restitle = resources[j].title
					window.debugger('[LOADRESOURCES] - Adding ' + restitle)
				};
			};
			var rescont = $(el).parents('[id^="newevent"]').attr('id').replace(/\D/g,'');
			$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').append('<div class="bookingresource"><input type="radio" id="' + restitle + '-' + rescont + '" name="resource' + rescont + '" value="' + restitle + '" ><label for="' + restitle + '-' + rescont + '">' + restitle + '</label></div>');
		};
	};
	if ( $(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').is(':empty') ) {
		$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
		$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').append('<img src="./img/warn.png" alt="warning"><p class="noresource">There are no ' + resourcename + ' available during the selected time range</p>');
	};
};

function resetDateSelection(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="extratypeoptions"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeselect"]').empty();
};

function resetTypeSelection(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="extratypeoptions"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"]').empty();
};

function resetTypeOptionSelection(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="extratypeoptions"]').empty();
};

function resetExtraTypeOptionSelection(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
};

function typeOption(el) {
  	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"] select').off('change').on('change', function() {
    window.debugger('[TYPEOPTION] - Begin')
		var optionselection = $(this).val()
		window.debugger('[TYPEOPTION] - "' + optionselection + '" selected')
		resetTypeOptionSelection($(this))
		if (optionselection == 'vivid') {
			loadCalendarResults($(this));
			loadRooms($(this), parseResources('Vivid Rooms'), 'Vivid-compatible rooms')
			loadResources($(this), parseResources('Vivid Trolleys'), 'Vivid trolleys');
		}
		else if (optionselection == 'room') {
			loadCalendarResults($(this));
			loadRooms($(this), parseResources('Video Conferencing'), 'video conferencing rooms')
		}
		else {
			resetTypeOptionSelection($(this));
		}
		$(this).blur();
    window.debugger('[TYPEOPTION] - End')
	});
}

function vidConf(el) {
  window.debugger('[VIDCONF] - Begin')
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"]').append('<label for="bookingtype">Option: </label><select class="typeoptions"><option value="">Select...<option value="room">Fixed Room</option><option value="vivid">Mobile Trolley</option></select>')
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"] select').kendoDropDownList().data("kendoDropDownList");
  window.debugger('[VIDCONF] - Booking type option created')
	typeOption(el);
  window.debugger('[VIDCONF] - End')
}

function bookingSelectors(el) {
	$(el).off('change').on('change', function() {
    window.debugger('[BOOKINGTYPE] - Begin');
		var typeselection = $(el).val()
		window.debugger('[BOOKINGTYPE] - "' + typeselection + '" selected')
		resetTypeSelection(el);
		if (typeselection == 'Video Conferencing') {
			vidConf(el);
		}
		else if (typeselection) {
			loadCalendarResults($(this));
			loadRooms($(this), parseResources(typeselection), typeselection)
		}
    window.debugger('[BOOKINGTYPE] - End');
	});
};

////////////////////////////////////////////

window.noKey = function(evt) {
   var charCode = (evt.which) ? evt.which : event.keyCode
   if (charCode != 13 || charCode != 9)
      return false;
   return true;
}


/////////////// Booking Form ///////////////

window.book = $(function() {

	window.debugger('Booking Window Opened');
	$('#miniloading').hide();

  $('form button').each(function() {
    $(this).kendoButton();
  });

	///////// Enter -> Tab key fix ////////

	$('.noenter').keydown( function(e) {
      var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
      if(key == 13) {
          e.preventDefault();
          var inputs = $(this).closest('form').find(':input:visible');
          inputs.eq( inputs.index(this)+ 1 ).focus();
      }
  });

  ///////// Booking Form Buttons /////////

  $('.formclose').off('click').click(function() {
  	window.debugger('Form close clicked')
  	$("#main-form").trigger("reset");
		$('#vevents').empty();
		window.neweventindex = 0;
    window.close();
  });

  $('.formreset').off('click').on('click', function() {
  	window.debugger('[FORMRESET] - Begin');
		window.neweventindex = 0;
    window.debugger('[FORMRESET] - New event index returned to 0');
		$("#main-form").trigger("reset");
    window.debugger('[FORMRESET] - Emptied all form fields');
		$('#vevents').empty();
    window.debugger('[FORMRESET] - Destroyed events');
    newevent();
    window.debugger('[FORMRESET] - End');
  });

	//////////////////////////////////
  ///////// Date Selectors /////////
	//////////////////////////////////

  $('#createevent').off('click').on('click', function(){
		newevent();
  });

	newevent();

});

////////////////////////////////////////////

///////////////////////////
//// Resource Calendar ////
///////////////////////////

window.bookingengine = {
    header: '',
		schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
    defaultView: 'month',
    height: 'auto',
    loading: function(bool) {
      loading(bool)
    },
    editable: false,
		resources: window.allresources,
		events: function(start, end, timezone, callback) {
			eventCall(start, end, timezone, callback)
		}
  }
