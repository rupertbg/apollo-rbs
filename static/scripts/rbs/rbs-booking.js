// Sets NZ date / time format for Kendo UI inputs //
kendo.culture("en-NZ");

window.resourceselection = '';
window.bookingdata = [];

var isClick;
$(document).bind('click', function() { isClick = true; })
$(document).bind('keypress', function() { isClick = false; });

var now = new Date(moment().startOf('hour'))
var nowish = new Date(moment().startOf('hour').add('30', 'minutes'))





function initRemoteCounter(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotecount"]').append('<label for="remotelocationcount">How many remote locations?</label><input id="remotelocationcount" type="number" min="1" max="10" class="extratypeoptions noenter">')
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotelocationcount"]').kendoNumericTextBox({ format: '0', value: 1, decimals: 0, min: 1 });
	noEnter()
	remoteSelect(el)
}

function remoteSelect(el) {
	remoteCounter(el)
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotelocationcount"]').parents('.k-widget').on('click', function() {
		remoteCounter(el)
  });
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotelocationcount"]').on('change', function() {
		remoteCounter(el)
  });
  $(el).parents('[id^="veventcontainer"]').find('[id^="remotelocationcount"]').keyup(function() {
		if ($(el).parents('[id^="veventcontainer"]').find('[id^="remotelocationcount"]').val() > 10) {
			$(el).parents('[id^="veventcontainer"]').find('[id^="remotelocationcount"]').val('10')
		}
		remoteCounter(el)
  });
	initRoomSelect(el)
}

function remoteCounter(el) {
	var remoteCount = $(el).parents('[id^="veventcontainer"]').find('[id^="remotelocationcount"]').val()
	var dataorigin = parseInt($(el).parents('[id^="veventcontainer"]').attr('data-origin'))
	if (locCount[dataorigin] == null) {
		locCount[dataorigin] = 0;
	}
	if (locCount[dataorigin] < remoteCount) {
		for (var i = locCount[dataorigin]; i < remoteCount; i++) {
			var id = i + 'r' + dataorigin
			$(el).parents('[id^="veventcontainer"]').find('[id^="remotedetails"]').append('<div class="remotecont' + i + '"></div>')
			$(el).parents('[id^="veventcontainer"]').find('.remotecont' + i).append(
				'<div id="remoteinfocont' + id + '"><label for="remoteinfo' + id + '">Remote location ' + (i+1) + ': </label><textarea id="remoteinfo' + id + '" name="remoteinfo' + id + '"></textarea></div>'
				+ '<div id="remoteattendcont' + id + '"><label for="remoteattend' + id + '">Participants: </label><input id="remoteattend' + id + '" type="number" name="remoteattend' + id + '" class="noenter"></div>'
				+ '<div id="remotesendcont' + id + '"><label for="remotesend' + id + '">Sending content: </label><select id="remotesend' + id + '" name="remotesend' + id + '" class="noenter"><option value="no">No</option><option value="yes">Yes</option></select></div>'
			)
			$(el).parents('[id^="veventcontainer"]').find('#remoteattend' + id).kendoNumericTextBox({ format: '0', value: 1, decimals: 0, min: 1 });
			$(el).parents('[id^="veventcontainer"]').find('#remotesend' + id).kendoDropDownList().data("kendoDropDownList");
		}
		locCount[dataorigin] = i
	}
	else if (locCount[dataorigin] > remoteCount) {
		while (locCount[dataorigin] > remoteCount) {
			locCount[dataorigin]--
			$(el).parents('[id^="veventcontainer"]').find('div.remotecont' + locCount[dataorigin]).remove()
		}
	}
	noEnter()
};

function loadRooms(el, rooms, roomtype) {
	window.debugger('[LOADROOMS] - "' + roomtype + '" selected')
	if (roomtype === undefined) {
		roomtype = ''
	}
	else if (roomtype == 'Video Conferencing') {
		roomtype = roomtype + ' rooms'
	}
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').append('<p class="roompresent">Please select from the following ' + roomtype.toLowerCase() + ' that are available: </p>');
	for (var i = 0; i < rooms.length; i++) {
		var roomremain = rooms[i].id
		if (window.bookedresources.indexOf(roomremain) == -1) {
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
		$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').append('<div><img src="./img/warn.png" alt="warning"></div><p class="noroom">Our apologies, there are no ' + roomtype + ' available that suit the following selections. You may still submit this request to have it manually reviewed by reception.</p>');
	}

}

function loadResources(el, resources, resourcename) {
	window.debugger('[LOADRESOURCES] - "' + resourcename + '" selected')
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').append('<p class="resourcepresent">Please select from the following ' + resourcename.toLowerCase() + ' that are available: </p>');
	for (var i = 0; i < resources.length; i++) {
		var resremain = resources[i].id
		if (window.bookedresources.indexOf(resremain) == -1) {
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
		$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').append('<div><img src="./img/warn.png" alt="warning"></div><p class="noresource">Our apologies, there are no ' + resourcename + ' available that suit the following selections. You may still submit this request to have it manually reviewed by reception.</p>');
	};
};

function resetDateSelection(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeselect"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotecount"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotedetails"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').empty();
};

function resetTypeSelection(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotecount"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotedetails"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').empty();
};

function resetTypeOptionSelection(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotecount"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotedetails"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').empty();
};

function resetExtraTypeOptionSelection(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingresources"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="resourcesmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="bookingrooms"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomsmessage"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotecount"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="remotedetails"]').empty();
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').empty();
};

function resetRoomSelection(el) {
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
		var dataorigin = parseInt($(el).parents('[id^="veventcontainer"]').attr('data-origin'))
		locCount[dataorigin] = 0;
		if (optionselection == 'vivid') {
			loadCalendarResults($(this));
			loadRooms($(this), parseResources('Vivid Rooms'), 'Vivid-compatible rooms')
			loadResources($(this), parseResources('Vivid Trolleys'), 'Vivid trolleys');
		}
		else if (optionselection == 'room') {
			loadCalendarResults($(this));
			loadRooms($(this), parseResources('Video Conferencing'), 'video conferencing rooms')
		}
		else if (optionselection == '') {
			resetTypeOptionSelection($(this))
		}
		else {
			initRemoteCounter(el)
		}
		$(this).blur();
    window.debugger('[TYPEOPTION] - End')
	});
}

function initRoomSelect(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"]').append('<label for="roomrequire">Do you require a room booking?</label><select id="roomrequire" class="attendanceselect"><option value="">Select...<option value="yes">Yes</option><option value="no">No</option><option value="unknown">Not sure</option></select>')
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"] select').kendoDropDownList().data("kendoDropDownList");
	roomOptions(el)
}

function roomOptions(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"] select').off('change').on('change', function(){
		if ($(this).val() == 'yes') {
			initAttendance(el);
			roomResults(el);
			vidConfDetails(el);
		}
		else if ($(this).val() == 'no') {
			initAttendance(el);
			resetRoomSelection(el);
			vidConfDetails(el);
		}
		else if ($(this).val() == 'unknown') {
			initAttendance(el);
			resetRoomSelection(el);
			vidConfDetails(el);
		}
		else {
			$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').empty();
			$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').empty();
			resetRoomSelection(el);
		}
	})
}

function vidConfDetails(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').empty();
	var dataorigin = $(el).parents('[id^="veventcontainer"]').attr('data-origin')
	if ($(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"] select').val() != 'yes') {
		$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').append('<label for="vidconflocationdetails">Where will you be video conferencing from? </label><textarea id="vidconflocationdetails' + dataorigin + '" name="vidconflocationdetails' + dataorigin + '"></textarea>');
	}
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').append(
		'<label for="vidconfinfo">Additional information for video conferencing team: </label><textarea id="vidconfinfo' + dataorigin + '" name="vidconfinfo' + dataorigin + '"></textarea>'
	);
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').append(
		'<label for="receptioninfo">Additional information for reception: </label><textarea id="receptioninfo' + dataorigin + '" name="receptioninfo' + dataorigin + '"></textarea>'
	);
}

function vidConf(el) {
  window.debugger('[VIDCONF] - Begin')
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"]').append('<label for="bookingtype">Video Conference type: </label><select class="typeoptions"><option value="">Select...<option value="skype">Skype</option><option value="zoom">Zoom</option><option value="vivid">Vivid</option><option value="polycom">Polycom</option><option value="connect">Otago Connect</option><option value="unknown">Not sure</option></select>')
	$(el).parents('[id^="veventcontainer"]').find('[id^="typeoptions"] select').kendoDropDownList().data("kendoDropDownList");
  window.debugger('[VIDCONF] - Booking type option created')
	typeOption(el);
  window.debugger('[VIDCONF] - End')
}

function receptionDetails(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').empty();
	var dataorigin = $(el).parents('[id^="veventcontainer"]').attr('data-origin')
	$(el).parents('[id^="veventcontainer"]').find('[id^="extradetails"]').append(
		'<label for="receptioninfo">Additional information for reception: </label><textarea id="receptioninfo' + dataorigin + '" name="receptioninfo' + dataorigin + '"></textarea>'
	);
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
			initAttendance(el)
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

///////// Enter -> Tab key fix ////////

function noEnter() {
	$('.noenter').keydown( function(e) {
			var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
			if(key == 13) {
					e.preventDefault();
					var inputs = $(this).closest('form').find(':input:visible');
					inputs.eq( inputs.index(this)+ 1 ).focus();
			}
	});
}

/////////////// Booking Form ///////////////

window.book = $(function() {

	window.debugger('Booking Window Opened');
	$('#miniloading').hide();

  $('form button').each(function() {
    $(this).kendoButton();
  });

	noEnter()

	window.locCount = []

	//////////////////////////////////
  ///////// Date Selectors /////////
	//////////////////////////////////

  $('#createevent').off('click').on('click', function(){
		newevent();
  });

	newevent();
	$('input[name="contactname"]').focus()
});

////////////////////////////////////////////

/************************************
   PAGE ELEMENT GENERATORS - BEGIN
************************************/

/*

---- Booking Event Generator ----

This function generates a 'New Booking Request' section. It is called on page load and whenever 'Additional Request' button is pressed.
The 'Booking Type' section is generated dynamically in initBookingSelectors(). Further selectors are generated by assorted functions
from then on, based on selection.

*/

function newevent() {
  window.debugger('[EVENTGEN] - Begin')
	window.neweventindex++;
	$('#vevents').append($('#newevent').clone().attr('id','newevent' + window.neweventindex));
	$('#newevent' + window.neweventindex).css('display','block');
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
	$('#newevent' + window.neweventindex + ' div[id^="veventdetails"]').append(
		'<ul id="detailslist">'
		+ '<li>'
		+ '<label for="eventitle">Booking Title <span class="subtext">(Available in calendar)</span></label><input placeholder="Required" class="noenter" type="text" name="title' + window.neweventindex + '" required="required">'
		+ '</li>'
		+ '<li>'
		+ '<label for="presenter">Name of Presenter / Chair</label><input placeholder="Required" class="noenter" type="text" name="presenter' + window.neweventindex + '" required="required">'
		+ '</li>'
		+ '</ul>'
	);
	$('#newevent' + window.neweventindex + ' div[id^="veventdescription"]').append(
	'<ul id="descriptionlist">'
	+ '<li>'
	+ '<label for="description' + window.neweventindex + '">Booking Description <span class="subtext">(Available in calendar)</span></label>'
	+ '<textarea id="description' + window.neweventindex + '" class="noenter" name="description' + window.neweventindex + '"></textarea>'
	+ '</li>'
	+ '</ul>'
	);
  $('#newevent' + window.neweventindex + ' div[id^="containerdatetime"]').append(
  '<label for="timestart' + window.neweventindex + '">Event Begins: </label><input onkeypress="return window.noKey(event)" class="k-input timestart" type="text" value="" name="timestart' + window.neweventindex + '" id="timestart' + window.neweventindex + '">'
   + '<label for="timeend' + window.neweventindex + '">Event Ends: </label><input onkeypress="return window.noKey(event)" class="k-input timeend" type="text" value="" name="timeend' + window.neweventindex + '" id="timeend' + window.neweventindex + '">'
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
	noEnter()
	initBookingSelectors('#newevent' + window.neweventindex);
	$('#newevent' + window.neweventindex).find('*').each(function(){
		$(this).attr('data-origin', window.neweventindex)
	})
	$('#newevent' + window.neweventindex + ' input[id^="timeend"]').trigger('change')
  window.debugger('[EVENTGEN] - End')
};

/*

---- Booking Selectors ----
Sets up 'Booking Type' select box in 'New Booking Request' section. Pass (el) as an element within the booking request
so that there is context suppied to separate it from other booking requests on the page.

*/

function initBookingSelectors(el) {
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
	$(el + ' input[id^="timestart"]').off('change').on('change', function() {
		startChange($(this).data("kendoDateTimePicker"), $(this).parents('[id^="veventcontainer"]').find('input[id^="timeend"]').data("kendoDateTimePicker"));
		$(el + ' input[id^="timeend"]').trigger('change')
	});
	$(el + ' input[id^="timeend"]').off('change').on('change', function() {
		resetDateSelection($(this));
		$(this).parents('[id^="veventcontainer"]').find('[id^="typeselect"]').append('<label for="bookingtype">Booking Type: </label><select class="bookingtype" data-placeholder="Select Booking Type..."></select>');
		$(this).parents('[id^="veventcontainer"]').find('.bookingtype').append('<option value="" selected>Select..</option>');
		$(this).parents('[id^="veventcontainer"]').find('.bookingtype').append(bookingTypeInit());
		$(this).parents('[id^="veventcontainer"]').find('select[class^="bookingtype"]').kendoDropDownList().data("kendoDropDownList");
		bookingSelectors($(this).parents('[id^="veventcontainer"]').find('select[class^="bookingtype"]'));
		loadCalendarDate($(this))
	});
};

/*

---- Booking Type Initialisation ----
Runs over window.allresources from rbs-resources.js and adds type to array if unique.
The array is then used to generate child option elements for the Booking Type select element.
Skips any resource types matching items in the array 'skip'.

*/

function bookingTypeInit() {
	var types = [],
			options = [],
			skip = ['Vivid Trolleys', 'iPads'];
	for (var i = 0; i < window.allresources.length; i++) {
		if (types.indexOf(window.allresources[i].type) == -1 && skip.indexOf(window.allresources[i].type) == -1) {
			types.push(window.allresources[i].type)
		}
	}
	for (var i = 0; i < types.length; i++) {
		options.push('<option value="' + types[i]	+ '">' + types[i] + '</option>')
	}
	options.join('')
	return options
}

/*

---- Attendance Input Generator ----
Generates the input for attendance number. Runs attendanceSelect() and attenanceTest() once initialised.

*/

function initAttendance(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').empty()
	if ($(el).parents('[id^="veventcontainer"]').find('select.bookingtype').val() == 'Video Conferencing') {
		$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').append('<label for="attendance">How many local participants?</label>');
		$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').append('<input id="attendance" type="number" class="extratypeoptions noenter">');
	}
	else if ($(el).parents('[id^="veventcontainer"]').find('select.bookingtype').val() != 'Laptops') {
		$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').append('<label for="attendance">Expected Attendance: </label>');
		$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').append('<input id="attendance" type="number" class="extratypeoptions noenter">');
	}
	$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"] input').kendoNumericTextBox({ format: '0', value: 1, decimals: 0, min: 1 });
	noEnter();
	attendanceSelect(el);
	roomResults(el);
	receptionDetails(el);
};

/*

---- Attendance Input Initialiser ----
Binds changes on attendance input field to attendanceTest().

*/

function attendanceSelect(el) {
	$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').on('click', function() {
		roomResults(el)
  });
	$(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"]').on('change', function() {
		roomResults(el)
  });
  $(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"] input').keyup(function() {
		roomResults(el)
  });
}

/************************************
    PAGE ELEMENT GENERATORS - END
************************************/

/************************************
       DATA PROCESSING - BEGIN
************************************/

/*

---- Server Calendar Data ----
This function calls the front-end server using socket.io to request calendar data. The bookingRequest method is used to differentiate
from other socket calls. See /server.js for server-side and /static/scripts/rbs/rbs-socket.js for client-side socket calls and processing.
loading() is called to disable input until the server has responded with data and it has been processed.

*/

function loadCalendarDate(el) {
	window.debugger('[BOOKINGDATE] - Begin');
	var start = $(el).parents('[id^="veventcontainer"]').find('[id^="timestart"]').data("kendoDateTimePicker").value();
	var end = $(el).parents('[id^="veventcontainer"]').find('[id^="timeend"]').data("kendoDateTimePicker").value();
	loading(true)
	socket.emit('bookingRequest', { start: start, end: end, resources: window.resourceselection, origin: parseInt($(el).attr('data-origin')) } )
	window.debugger('[BOOKINGDATE] - Requested range: ' + start + ' to ' + end)
  window.debugger('[BOOKINGDATE] - End');
}

/*

---- Booking Data Processing ----
This function processes window.bookingdata[*] where .origin matches the data-origin attribute of (el)'s parent veventcontainer. This restricts the processing to the
relevant date/time range for that specific booking request section. Data is then flattened to output an array (window.bookedresources) of the resourceId that are NOT available.
If debugging is enabled you can see specific event conflicts in the browser's console.
Capacity of each resource in the array is then checked against the value of the attendance field, if present, via attendaceTest().

*/

function loadCalendarResults(el) {
	window.debugger('[CALENDARRESULTS] - Begin');
	window.bookedresources = [];
	var timestart = $(el).parents('[id^="veventcontainer"]').find('input[id^="timestart"]').data("kendoDateTimePicker").value();
	var timeend = $(el).parents('[id^="veventcontainer"]').find('input[id^="timeend"]').data("kendoDateTimePicker").value();
	if (window.bookingdata.length > 0) {
		var eventsInMemory = [];
		for (var i = 0; i < window.bookingdata.length; i++) {
			if (window.bookingdata[i].origin == $(el).parents('[id^="veventcontainer"]').attr('data-origin')) {
				eventsInMemory = window.bookingdata[i].events
				if (eventsInMemory.length > 0) {
					window.debugger('[CALENDARRESULTS] - ' + eventsInMemory.length + ' events in memory')
					for(var i = 0; i < eventsInMemory.length; i++){
						var eventstart = new Date(eventsInMemory[i].start),
								eventend = new Date(eventsInMemory[i].end),
								selectionstart = new Date(timestart),
								selectionend = new Date(timeend),
								eventrange = moment.range(eventstart, eventend),
								selectionrange = moment.range(selectionstart, selectionend);
						if(selectionrange.overlaps(eventrange) || eventrange.contains(selectionend) || eventrange.contains(selectionstart)){
							window.debugger('[CALENDARRESULTS] - Event: "' + eventsInMemory[i].title + '" in resource ID: "' + eventsInMemory[i].resourceId + '" conflicts with time selection.');
							window.bookedresources.push(eventsInMemory[i].resourceId);
						};
					};
					window.debugger('[CALENDARRESULTS] - ' + window.bookedresources.length + ' conflicting bookings found');
				}
				break
			}
		}
	}
	attendanceTest(el)
	window.debugger('[CALENDARRESULTS] - ' + window.bookedresources.length + ' conflicts found');
  window.debugger('[CALENDARRESULTS] - End');
};

/*

---- Attendance Input Test ----
Takes value of attendance input and tests it against resource object capacity property.

*/

function attendanceTest(el) {
	window.debugger('[ATTENDANCE] - Begin')
	var att = $(el).parents('[id^="veventcontainer"]').find('[id^="attendanceselect"] input').val()
	window.debugger('[ATTENDANCE] - Attendance: ' + att)
	for (var j = 0; j < window.allresources.length; j++) {
		if (window.allresources[j].capacity < $(el).parents('[id^="veventcontainer"]').find('input[id^="attendance"]').val()) {
			window.bookedresources.push(window.allresources[j].id);
			window.debugger('[CALENDARRESULTS] - ' + window.allresources[j].title + ' conflicting capacity');
		}
	}
	window.debugger('[ATTENDANCE] - End')
}

/*

---- Room Results ----
Resets all dependant elements via resetRoomSelection() then takes value of 'Booking Type' selection input
and re-calculates resources via loadCalendarResults()

*/

function roomResults(el) {
	window.debugger('[BOOKINGTYPE] - Begin');
	var typeselection = $(el).parents('[id^="veventcontainer"]').find('select.bookingtype').val(),
			roomOption = $(el).parents('[id^="veventcontainer"]').find('[id^="roomselect"] select').val();
	window.debugger('[BOOKINGTYPE] - "' + typeselection + '" selected');
	if (roomOption == 'yes' || roomOption == null) {
		resetRoomSelection(el);
		loadCalendarResults(el);
		loadRooms(el, parseResources(typeselection), typeselection);
	}
}
