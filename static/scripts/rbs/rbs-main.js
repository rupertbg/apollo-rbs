function viewtimehack() {
  var view = $(window.maincalendartarget).fullCalendar('getView')
  if (view.name.substring(0, 8) == 'timeline') {
    $(window.maincalendartarget).fullCalendar('changeView', 'agendaDay')
  }
  else {
    $(window.maincalendartarget).fullCalendar('changeView', 'timelineDay')
  }
  $(window.maincalendartarget).fullCalendar('changeView', view.name)
}

function resetMainCalendar() {
  window.debugger('[CALENDARRESET] - Begin');
  for (var i = 0; i < window.allresources.length; i++) {
		$(window.maincalendartarget).fullCalendar('removeResource', window.allresources[i]);
	}
  window.debugger('[CALENDARRESET] - Calendar resources removed');
  window.debugger('[CALENDARRESET] - End');
};

function reloadMainCalendar() {
  $(window.maincalendartarget).fullCalendar('refetchResources')
  $(window.maincalendartarget).fullCalendar('refetchResources')
  window.resourceselection = ''
  window.debugger('[CALENDARRELOAD] - Calendar resources reset');
  $(window.maincalendartarget).fullCalendar('refetchEvents')
  window.debugger('[CALENDARRELOAD] - End');
};

function loadResources(resources, resourcename) {
  var loadCount = 0
  if (resourcename === undefined) {
		resourcename = ''
	}
	window.debugger('[LOADRESOURCES] - "' + resourcename + '" selected')
	for (var i = 0; i < resources.length; i++) {
    loadCount++
    $(window.maincalendartarget).fullCalendar('addResource', resources[i]);
    if (loadCount == resources.length) {
      $(window.maincalendartarget).fullCalendar('refetchEvents')
      viewtimehack()
    }
	};
};

function resourceLoader(multiroomselected) {
  window.debugger('[LOADCUSTOMRESOURCES] - Start')
  if (multiroomselected != '') {
    window.debugger('[LOADCUSTOMRESOURCES] - Selected resource ID: ' + multiroomselected)
    resetMainCalendar();
    var addedresources = []
    var addedsources = []
    window.debugger('[LOADCUSTOMRESOURCES] - Adding resources')
    for (var i = 0; i < multiroomselected.length; i++) {
      for (var l = 0; l < window.allresources.length; l++) {
        if (multiroomselected[i] == window.allresources[l].id) {
          if ($.inArray(window.allresources[l].id, addedresources) == -1) {
            $(window.maincalendartarget).fullCalendar('addResource', window.allresources[l]);
            window.debugger('[LOADCUSTOMRESOURCES] - Added resource: ' + window.allresources[l].id)
            addedresources.push(window.allresources[l].id)
            window.debugger('[LOADCUSTOMRESOURCES] - Added resources array contents: ' + addedresources)
          }
        }
        else if (multiroomselected[i] == window.allresources[l].parentId) {
          if ($.inArray(window.allresources[l].id, addedresources) == -1) {
            $(window.maincalendartarget).fullCalendar('addResource', window.allresources[l]);
            window.debugger('[LOADCUSTOMRESOURCES] - Added resource: ' + window.allresources[l].id)
            addedresources.push(window.allresources[l].id)
            window.debugger('[LOADCUSTOMRESOURCES] - Added resources array contents: ' + addedresources)
          };
        };
      };
    };
    viewtimehack();
    window.resourceselection = addedresources
    $(window.maincalendartarget).fullCalendar('refetchEvents');
  }
  else {
    window.resourceselection = '';
    window.debugger('[LOADCUSTOMRESOURCES] - Resetting resources')
    $(window.maincalendartarget).fullCalendar('refetchResources');
    $(window.maincalendartarget).fullCalendar('refetchResources');
    $(window.maincalendartarget).fullCalendar('refetchEvents');
  }
  window.debugger('[LOADCUSTOMRESOURCES] - End')
}

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

function printDate() {
  var calTitle = $(window.maincalendartarget).fullCalendar('getView').title;
  $('#calendardate').empty();
  $('#calendardate').append('<h2>' + calTitle + '</h2>');
};

function menuSquishRight() {
  $('#togglemenuleft').prop('disabled', true);
  setTimeout(function(){
    $('#togglemenuleft').prop('disabled', false);
  }, 500);
  window.debugger('[LEFTMENU] - Opened')
  window.menuLeftOpen = true;
  var menuSize = $('#menuright').width();
  var calSize = $('#calendarcontainer').outerWidth();
  newSize = calSize - menuSize;
  if (window.menuRightOpen == false) {
    $('#calendarcontainer').css('left', '');
    $('#calendarcontainer').css('right', '0');
    window.debugger('[LEFTMENU] - Aligned calendar to right' )
  }
  else {
    $('#calendarcontainer').css('left', '');
    $('#calendarcontainer').css('right', menuSize);
    $('#calendarcontainer').css('margin', '0 auto');
  }
  $('#calendarcontainer').css('width', newSize);
  window.debugger('[LEFTMENU] - Resized calendar to: ' + newSize + 'px' )
};

function menuSquishLeft() {
  $('#togglemenuright').prop('disabled', true);
  setTimeout(function(){
    $('#togglemenuright').prop('disabled', false);
  }, 500);
  window.menuRightOpen = true;
  var menuSize = $('#menuright').width();
  var calSize = $('#calendarcontainer').outerWidth();
  newSize = calSize - menuSize
  if (window.menuLeftOpen == false) {
    $('#calendarcontainer').css('right', '');
    $('#calendarcontainer').css('left', '0');
    window.debugger('[RIGHTMENU] - Aligned calendar to left' )
  }
  else {
    $('#calendarcontainer').css('right', '');
    $('#calendarcontainer').css('left', menuSize);
    $('#calendarcontainer').css('margin', '0 auto');
  }
  $('#calendarcontainer').css('width', newSize);
  window.debugger('[RIGHTMENU] - Resized calendar to: ' + newSize + 'px' )
};

function menuSquishRightReset() {
  $('#togglemenuleft').prop('disabled', true);
  setTimeout(function(){
    $('#togglemenuleft').prop('disabled', false);
  }, 500);
  window.menuLeftOpen = false;
  var menuSize = $('#menuleft').width();
  var calSize = $('#calendarcontainer').outerWidth();
  newSize = calSize + menuSize
  if (window.menuRightOpen == false) {
    $('#calendarcontainer').css('margin', '0');
    $('#calendarcontainer').css('left', '');
    $('#calendarcontainer').css('right', '0');
    window.debugger('[LEFTMENU] - Aligned calendar to left' )
  }
  else {
    $('#calendarcontainer').css('margin', '0');
    $('#calendarcontainer').css('left', '');
    $('#calendarcontainer').css('right', menuSize);
  }
  $('#calendarcontainer').css('width', newSize);
  window.debugger('[LEFTMENU] - Resized calendar to: ' + newSize + 'px' )

};

function menuSquishLeftReset() {
  $('#togglemenuright').prop('disabled', true);
  setTimeout(function(){
    $('#togglemenuright').prop('disabled', false);
  }, 500);
  window.menuRightOpen = false;
  var menuSize = $('#menuright').width();
  var calSize = $('#calendarcontainer').outerWidth();
  newSize = calSize + menuSize
  if (window.menuLeftOpen == false) {
    $('#calendarcontainer').css('margin', '0');
    $('#calendarcontainer').css('right', '');
    $('#calendarcontainer').css('left', '0');
    window.debugger('[RIGHTMENU] - Aligned calendar to left' )
  }
  else {
    $('#calendarcontainer').css('margin', '0');
    $('#calendarcontainer').css('right', '');
    $('#calendarcontainer').css('left', menuSize);
  }
  $('#calendarcontainer').css('width', newSize);
  window.debugger('[RIGHTMENU] - Resized calendar to: ' + newSize + 'px' )
};

$(document).ready(function () {

  $('#togglemenuleft').kendoButton({
    spriteCssClass: "k-icon k-i-calendar"
  });

  $('#homeview').kendoButton({
    spriteCssClass: "k-icon k-i-hbars"
  });

  $('#togglemenuleft').bigSlide({
    menu: "#menuleft",
    side: 'left',
    afterOpen: function() {
      menuSquishRight();
    },
    afterClose: function() {
      menuSquishRightReset();
    }
  });

  $('#togglemenuright').kendoButton({
    spriteCssClass: "k-icon k-i-funnel"
  });
  $('#togglemenuright').bigSlide({
    menu: "#menuright",
    side: 'right',
    afterOpen: function() {
      menuSquishLeft()
    },
    afterClose: function() {
      menuSquishLeftReset()
    }
  });

  $('button#all').kendoButton({
    spriteCssClass: "k-icon k-i-funnel-clear"
  });

  $('section button').each(function() {
    $(this).kendoButton();
  });

  var calMoment = $(window.maincalendartarget).fullCalendar('getDate');
  var calDate = moment(calMoment).format('DD/MM/YYYY');
  $('#dateselect').kendoDatePicker().data("kendoDatePicker").value(calDate);

  $('#incnext').off('click').on('click', function() {
    $(window.maincalendartarget).fullCalendar('next');
  });

  $('#incprev').off('click').on('click', function() {
    $(window.maincalendartarget).fullCalendar('prev');
  });

  $('button#today').off('click').on('click', function() {
    $(window.maincalendartarget).fullCalendar('today');
  });

  $('#dateselect').off('change').on('change', function() {
    var dateselect = $(this).data("kendoDatePicker").value();
    $(window.maincalendartarget).fullCalendar('gotoDate', dateselect)
  });

  $('.viewchange').each(function() {
    var view = $(this).attr('id')
    $(this).off('click').on('click', function() {
    $(window.maincalendartarget).fullCalendar('changeView', view);
    });
  });

  $('#homeview').off('click').on('click', function() {
    loading(true)
    setTimeout(function(){
      reloadMainCalendar();
      $(window.maincalendartarget).fullCalendar('changeView', 'timelineDay');
      $(window.maincalendartarget).fullCalendar('today');
      if (window.menuLeftOpen == true) {
        setTimeout(function(){
          $('#togglemenuleft').trigger('click');
        }, 500);
      }
      if (window.menuRightOpen == true) {
        setTimeout(function(){
          $('#togglemenuright').trigger('click');
        }, 1000);
      }
    }, 50)
  });

  $('#update').hide();
  $('#error').hide();

  $('#showupdate').off('click').on('click', function() {
    $('#update').fadeOut(300);
    setTimeout(function(){
      $(window.maincalendartarget).fullCalendar('refetchEvents');
    }, 310)
  });

  for (var i = 0; i < window.allresources.length; i++) {
    $('#multiroom').append('<option value="' + window.allresources[i].id + '">' + window.allresources[i].title + '</option>');
  };

  function multiroombutton() {
    var selected = $('#multiroom').data("kendoMultiSelect").value()
    if (selected == '') {
      $('#multiroomload').empty();
      $('#multiroomload').append('Show All Resources')
      $('#multiroomload').kendoButton({
        spriteCssClass: "k-icon k-i-funnel-clear"
      });
    }
    else {
      $('#multiroomload').empty();
      $('#multiroomload').append('Load Selection')
      $('#multiroomload').kendoButton({
        spriteCssClass: "k-icon k-i-funnel"
      });
    }
  };

  $('#multiroom').kendoMultiSelect({ dataBound: multiroombutton, change: multiroombutton }).data("kendoMultiSelect")

  $('#multiroomload').off('click').on('click', function() {
    loading(true)
    setTimeout(function(){
      var selected = $('#multiroom option:selected').map(function(_, el) {
        return $(el).val();
      }).get();
      resourceLoader(selected);
    }, 30);
  });

  $('button#all').off('click').on('click', function() {
    loading(true)
    window.debugger('[MAINCALENDARRESET] - Clicked');
    setTimeout(function(){
      resetMainCalendar();
      $(window.maincalendartarget).fullCalendar('refetchResources');
    }, 30);
  });

  $('button#vidconf').off('click').on('click', function() {
    loading(true)
    window.debugger('[VIDCONFCALENDARS] - Clicked');
    var resourceType = parseResources('Video Conferencing')
    setTimeout(function(){
    	resetMainCalendar();
      resourceSelection(resourceType, 'Video Conferencing Rooms');
    }, 30);
  })

  $('button#vivid').off('click').on('click', function() {
    loading(true)
    window.debugger('[VIVIDCALENDARS] - Clicked');
    var resourceType = (parseResources('Video Conferencing').concat(parseResources('Vivid Trolleys')));
    setTimeout(function(){
    	resetMainCalendar();
      resourceSelection(resourceType, 'Vivid');
    }, 30);
  })

  $('button#largerooms').off('click').on('click', function() {
    loading(true)
    window.debugger('[TEACHINGCALENDARS] - Clicked');
    var resourceType = parseResources('Large Rooms')
    setTimeout(function(){
    	resetMainCalendar();
      resourceSelection(resourceType, 'Large Rooms');
    }, 30);
  });

  $('button#mediumrooms').off('click').on('click', function() {
    loading(true)
    window.debugger('[TEACHINGCALENDARS] - Clicked');
    var resourceType = parseResources('Medium Rooms')
    setTimeout(function(){
    	resetMainCalendar();
      resourceSelection(resourceType, 'Medium Rooms');
    }, 30);
  });

  $('button#smallrooms').off('click').on('click', function() {
    loading(true)
    window.debugger('[TEACHINGCALENDARS] - Clicked');
    var resourceType = parseResources('Small Rooms')
    setTimeout(function(){
    	resetMainCalendar();
      resourceSelection(resourceType, 'Medium Rooms');
    }, 30);
  });

  $('button#lecture').off('click').on('click', function() {
    loading(true)
    window.debugger('[LECTURECALENDARS] - Clicked');
    var resourceType = (parseResources('Lecture Theatres').concat(parseResources('Lobbies')));
    setTimeout(function(){
    	resetMainCalendar();
      resourceSelection(resourceType, 'Lectures');
    }, 30);
  });

  printDate();

});

// Sets Calendar to server communication target //
window.activecalendartarget = window.maincalendartarget

// FullCalendar Configuration //
window.maincalendar = $(function() {
  var activeButton = [];
  window.clickedEvent = '';
		$(window.maincalendartarget).fullCalendar({
			schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
			nowIndicator: true,
			editable: false,
			scrollTime: '06:00',
      firstDay: 1,
			businessHours: {
        start: '8:00',
        end: '18:00',
        dow: [ 1, 2, 3, 4, 5 ]
      },
			header: '',
			defaultView: 'timelineDay',
			allDaySlot: false,
      views: {
        agendaDay: { titleFormat: 'dddd, Do MMMM YYYY' },
        timelineDay: { titleFormat: 'dddd, Do MMMM YYYY' },
        agendaFiveDay: {
            type: 'agenda',
            duration: { days: 5 }
        }
      },
      viewRender: function(view,element) {
        printDate();
        var Month = view.name.indexOf('Month');
        var month = view.name.indexOf('month');
        var week = view.name.indexOf('Week');
        var day = view.name.indexOf('Day');
        $(activeButton[activeButton.length - 1]).removeClass('active');
        $('#menuleft').find('#' + view.name).addClass('active');
        activeButton.push($('#menuleft').find('#' + view.name))
        if (month >= 0 || Month >= 0) {
          $('#today').empty();
          $('#today').append('Current Month')
          $('#dateselect').data("kendoDatePicker").setOptions({ start: 'year', depth: 'year' });
        }
        else if (week >= 0) {
          $('#today').empty();
          $('#today').append('Current Week')
          $('#dateselect').data("kendoDatePicker").setOptions({ start: 'month', depth: 'month' });
        }
        else if (day >= 0) {
          $('#today').empty();
          $('#today').append('Today')
          $('#dateselect').data("kendoDatePicker").setOptions({ start: 'month', depth: 'month' });
        }
        else {
          $('#today').empty();
          $('#today').append('Today')
          $('#dateselect').data("kendoDatePicker").setOptions({ start: 'month', depth: 'month' });
        }
      },
      dayClick: function(date, jsEvent, view, resourceObj) {
        $(clickedEvent).css('border', 'none').css('box-sizing', 'content-box');
        formatteddate = moment(date).format();
        if (view.name == 'agendaDay') {
          if ( formatteddate == window.dateclicked && resourceObj.id == window.tdclicked.attr('data-resource-id') ) {
            window.debugger('[CALENDARENGINE] - Date: ' + formatteddate + ' Resource: ' + resourceObj.title + ' double clicked')
            loading()
            setTimeout(function(){
              resourceLoader(resourceObj.id)
              $(window.maincalendartarget).fullCalendar('gotoDate', date);
              $(window.maincalendartarget).fullCalendar('changeView', 'agendaDay');
              if (window.menuLeftOpen == false) {
                setTimeout(function(){
                  $('#togglemenuleft').trigger('click')
                }, 500);
              }
              if (window.menuRightOpen == false) {
                setTimeout(function(){
                  $('#togglemenuright').trigger('click')
                }, 1000);
              }
              setTimeout(function(){
                loading(false)
              }, 50);
            }, 50);
          }
          else {
            $(window.tdclicked).css('background-color', '');
            $(window.trclicked).css('background-color', '');
            window.debugger('[CALENDARENGINE] - Date: ' + formatteddate + ' Resource: ' + resourceObj.title + ' clicked')
            var timerow = formatteddate.substr(formatteddate.indexOf("T") + 1, 8)
            $('tr[data-time="' + timerow + '"]').css('background-color', 'rgba(255,200,200, 0.2)');
            $('td[data-resource-id="' + resourceObj.id + '"]').css('background-color', 'rgba(255,200,200, 0.2)');
            window.dateclicked = formatteddate;
            window.trclicked = $('tr[data-time="' + timerow + '"]');
            window.tdclicked = $('td[data-resource-id="' + resourceObj.id + '"]');
          };
        }
        if (view.name == 'agendaWeek') {
          if ( formatteddate == window.dateclicked ) {
            window.debugger('[CALENDARENGINE] - Date: ' + formatteddate + ' double clicked')
            loading(true)
            setTimeout(function(){
              $(window.maincalendartarget).fullCalendar('gotoDate', date);
              $(window.maincalendartarget).fullCalendar('changeView', 'agendaDay');
              if (window.menuLeftOpen == false) {
                setTimeout(function(){
                  $('#togglemenuleft').trigger('click')
                }, 500);
              }
              if (window.menuRightOpen == false) {
                setTimeout(function(){
                  $('#togglemenuright').trigger('click')
                }, 1000);
              }
              setTimeout(function(){
                loading(false)
              }, 50);
            }, 50);
          }
          else {
            $(window.tdclicked).css('background-color', '');
            $(window.trclicked).css('background-color', '');
            window.debugger('[CALENDARENGINE] - Date: ' + formatteddate + ' clicked')
            var timerow = formatteddate.substr(formatteddate.indexOf("T") + 1, 8)
            var timecolumn = formatteddate.substr(0, 10)
            $('tr[data-time="' + timerow + '"]').css('background-color', 'rgba(255,200,200, 0.2)');
            $('td[data-date="' + timecolumn + '"]').css('background-color', 'rgba(255,200,200, 0.2)');
            window.dateclicked = formatteddate;
            window.trclicked = $('tr[data-time="' + timerow + '"]');
            window.tdclicked = $('td[data-date="' + timecolumn + '"]');
          };
        }
        else if (view.name.substring(0, 8) == 'timeline') {
          if ( formatteddate == window.dateclicked && resourceObj.id == window.trclicked.attr('data-resource-id') ) {
            window.debugger('[CALENDARENGINE] - Date: ' + formatteddate + ' Resource: ' + resourceObj.title + ' double clicked')
            loading(true)
            setTimeout(function(){
              resourceLoader(resourceObj.id)
              $(window.maincalendartarget).fullCalendar('gotoDate', date);
              $(window.maincalendartarget).fullCalendar('changeView', 'agendaDay');
              if (window.menuLeftOpen == false) {
                setTimeout(function(){
                  $('#togglemenuleft').trigger('click')
                }, 500);
              }
              if (window.menuRightOpen == false) {
                setTimeout(function(){
                  $('#togglemenuright').trigger('click')
                }, 1000);
              }
              setTimeout(function(){
                loading(false)
              }, 50);
            }, 50);
          }
          else {
            $(window.tdclicked).css('background-color', '');
            $(window.trclicked).css('background-color', '');
            window.debugger('[CALENDARENGINE] - Date: ' + formatteddate + ' Resource: ' + resourceObj.title + ' clicked')
            $(this).css('background-color', 'rgba(255,200,200, 0.2)');
            $('tr[data-resource-id="' + resourceObj.id + '"]').css('background-color', 'rgba(255,200,200, 0.2)');
            window.dateclicked = formatteddate;
            window.tdclicked = $(this);
            window.trclicked = $('tr[data-resource-id="' + resourceObj.id + '"]');
          };
        }
      },
      eventMouseover: function(calEvent, jsEvent, view) {
        if (view.name.substring(0, 8) == 'timeline') {
          $(this).addClass('timelinehover').css('z-index', '999').parents('div').css('z-index', '999')
        }
        else {
          $(this).addClass('agendahover').css('z-index', '999').parents('div').css('z-index', '999')
        }
      },
      eventMouseout: function(calEvent, jsEvent, view) {
        if (view.name.substring(0, 8) == 'timeline') {
          $(this).removeClass('timelinehover').css('z-index', '').parents('div').css('z-index', '')
        }
        else {
          $(this).removeClass('agendahover').css('z-index', '').parents('div').css('z-index', '')
        }
      },
      eventClick: function(calEvent, jsEvent, view) {
        if (view.Name == 'agendaWeek') {
          $(window.tdclicked).css('background-color', '');
          $(window.trclicked).css('background-color', '');
          $(window.clickedEvent).removeClass('eventclick')
          clickedEvent = $(this)
          $(window.clickedEvent).css('width', '100%')
          $(window.clickedEvent).addClass('eventclick')
        }
        $(window.tdclicked).css('background-color', '');
        $(window.trclicked).css('background-color', '');
        $(window.clickedEvent).removeClass('eventclick')
        clickedEvent = $(this)
        $(window.clickedEvent).addClass('eventclick')
      },
      loading: function(bool) {
        loading(bool)
      },
			eventLimit: 'auto',
      eventRender: function(event,element){
        element.find('.fc-title').html(event.title);
      },
      eventTextColor: 'black',
			resourceAreaWidth: '250px',
			resourceColumns: [
				{
					labelText: '',
					field: 'title',
					width: '80%'
				},
				{
					labelText: 'Size',
					field: 'capacity',
					width: '20%'
				}
			],
			resourceGroupField: 'type',
			resources: window.allresources,
      lazyFetching: true,
			events: function( start, end, timezone, callback ) {
        eventCall(start, end, timezone, callback)
      }
		});
		window.debugger('[CALENDARENGINE] - Main calendar (' + window.maincalendartarget + ') initialised');
	});
