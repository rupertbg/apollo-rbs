function loadResources(resources, resourcename) {
  if (resourcename === undefined) {
		resourcename = ''
	}
  window.debugger('[LOADRESOURCES] - "' + resourcename + '" selected')
  var loadCount = 0,
      timelineResTypes = ['C02 & C05'], // C02 & C05 is here to ensure it is never collapsed
      timelineResTypeCells = [];
      view = $(window.maincalendartarget).fullCalendar('getView').name;
  if (/timeline/i.test(view)) {
    $('.fc-expander').each(function() {
      timelineResTypeCells.push($(this).siblings('.fc-cell-text').text());
    });
    for (var i = 0; i < resources.length; i++) {
      timelineResTypes.push(resources[i].type)
    };
    $('.fc-expander').each(function() {
      if (timelineResTypes.indexOf($(this).siblings('.fc-cell-text').text()) == -1) {
        $(this).children('.fc-icon-down-triangle').closest('.fc-expander').click();
      }
      else {
        $(this).children('.fc-icon-right-triangle').closest('.fc-expander').click();
      }
    });
  }
  else {
    $(window.maincalendartarget).fullCalendar('refetchEvents');
    $(window.maincalendartarget).fullCalendar('removeEvents', function(eventObject) {
      return $.inArray(eventObject.id, resources);
    });
  }
};

function resourceLoader(multiroomselected) {
  window.debugger('[LOADCUSTOMRESOURCES] - Start')
  var timelineView = /timeline/i.test($(window.maincalendartarget).fullCalendar('getView').name)
  if (multiroomselected.length > 0) {
    window.debugger('[LOADCUSTOMRESOURCES] - Selected resource ID: ' + multiroomselected)
    var addedresources = [];
    var addedsources = [];
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
    if (!timelineView) {
      window.resourceselection = addedresources
    }
    $(window.maincalendartarget).fullCalendar('refetchEvents');
  }
  else if (timelineView) {
    expandTimeline()
  }
  else {
    window.resourceselection = '';
    window.debugger('[LOADCUSTOMRESOURCES] - Resetting resources')
    $(window.maincalendartarget).fullCalendar('refetchEvents');
  }
  window.debugger('[LOADCUSTOMRESOURCES] - End')
}

function resourceSelection(resources, resourcename) {
  var newresources = [],
      parseCount = 0,
      timelineView = /timeline/i.test($(window.maincalendartarget).fullCalendar('getView').name)
  for (var i = 0; i < resources.length; i++) {
    parseCount++
    newresources.push(resources[i].id)
    if (parseCount == resources.length) {
      if (!timelineView) {
        window.resourceselection = newresources
      }
      loadResources(resources, resourcename)
    }
  }
}

// Prints date to the heading on the calendar based on the current view //
function printDate() {
  var calTitle = $(window.maincalendartarget).fullCalendar('getView').title;
  $('#calendardate').empty();
  $('#calendardate').append('<h2>' + calTitle + '</h2>');
};


// Expands timeline view to show all resources //
function expandTimeline() {
  loading(true)
  window.resourceselection = '';
  window.debugger('[LOADCUSTOMRESOURCES] - Expanding resources')
  var loadingOff = 0;
  $('.fc-icon-right-triangle').each(function(i){
    $(this).closest('.fc-expander').delay(200*i).queue(function() { $(this).click().dequeue(); });
    loadingOff = i
  })
  loadingOff = loadingOff * 200
  $('.resourcegroups button').removeClass('active');
  setTimeout(function(){
    loading(false)
  }, loadingOff);
}

function menuSquishRight() {
  loading(true, false)
  setTimeout(function(){
    loading(false)
    $(window).trigger('resize');
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
  loading(true, false)
  setTimeout(function(){
    loading(false)
    $(window).trigger('resize');
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
  loading(true, false)
  setTimeout(function(){
    loading(false)
    $(window).trigger('resize');
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
  loading(true, false)
  setTimeout(function(){
    loading(false)
    $(window).trigger('resize');
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

// PAGE LOAD //

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
    var view = $(this).attr('id');
    $(this).off('click').on('click', function() {
      $(window.maincalendartarget).fullCalendar('changeView', view);
      if (/timeline/i.test($(window.maincalendartarget).fullCalendar('getView').name) && /timeline/i.test(window.previousView) === false && $('.resourcegroups button').hasClass('active') === true ) {
        window.resourceselection = '';
        $(window.maincalendartarget).fullCalendar('refetchEvents');
        $('.resourcegroups button').each(function(){
          if ($(this).hasClass('active')) {
            $(this).click();
          }
        })
      }
      else if (/timeline/i.test($(window.maincalendartarget).fullCalendar('getView').name) === false && /timeline/i.test(window.previousView) === true && $('.resourcegroups button').hasClass('active') === true ) {
        window.resourceselection = '';
        $('.resourcegroups button').each(function(){
          if ($(this).hasClass('active')) {
            $(this).click();
          }
        })
      }
      window.previousView = $(window.maincalendartarget).fullCalendar('getView').name
    });
  });

  function closeMenus() {
    if (window.menuLeftOpen == true && window.menuRightOpen == false) {
      $('#togglemenuleft').trigger('click');
      $(window).trigger('resize');
    }
    else if (window.menuLeftOpen == false && window.menuRightOpen == true) {
      $('#togglemenuright').trigger('click');
      $(window).trigger('resize');
    }
    else if (window.menuLeftOpen == true && window.menuRightOpen == true) {
      $('#togglemenuleft').trigger('click');
      $('#togglemenuright').trigger('click');
      $(window).trigger('resize');
    }
  }

  $('#homeview').off('click').on('click', function() {
    closeMenus()
    window.previousView = $(window.maincalendartarget).fullCalendar('getView').name
    setTimeout(function(){
      loading(true)
      window.resourceselection = '';
      $(window.maincalendartarget).fullCalendar('gotoDate', moment());
      $(window.maincalendartarget).fullCalendar('changeView', 'timelineDay');
      if (/timeline/i.test(window.previousView) === false) {
        $(window.maincalendartarget).fullCalendar('refetchEvents');
      }
      expandTimeline();
    }, 1000)
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
    setTimeout(function(){
      var selected = $('#multiroom option:selected').map(function(_, el) {
        return $(el).val();
      }).get();
      resourceLoader(selected);
    }, 30);
  });

  $('button#all').off('click').on('click', function() {
    window.debugger('[MAINCALENDARRESET] - Clicked');
    $(this).addClass('active').siblings().removeClass('active');
    setTimeout(function(){
      window.resourceselection = '';
      $(window.maincalendartarget).fullCalendar('refetchEvents');
    }, 30);
  });

  $('button#vidconf').off('click').on('click', function() {
    window.debugger('[VIDCONFCALENDARS] - Clicked');
    $(this).addClass('active').siblings().removeClass('active');
    var resourceType = parseResources('Video Conferencing')
    setTimeout(function(){
      resourceSelection(resourceType, 'Video Conferencing Rooms');
    }, 30);
  })

  $('button#vivid').off('click').on('click', function() {
    window.debugger('[VIVIDCALENDARS] - Clicked');
    $(this).addClass('active').siblings().removeClass('active');
    var resourceType = (parseResources('Video Conferencing').concat(parseResources('Vivid Trolleys')));
    setTimeout(function(){
      resourceSelection(resourceType, 'Vivid');
    }, 30);
  })

  $('button#largerooms').off('click').on('click', function() {
    window.debugger('[TEACHINGCALENDARS] - Clicked');
    $(this).addClass('active').siblings().removeClass('active');
    var resourceType = parseResources('Large Rooms')
    setTimeout(function(){
      resourceSelection(resourceType, 'Large Rooms');
    }, 30);
  });

  $('button#mediumrooms').off('click').on('click', function() {
    window.debugger('[TEACHINGCALENDARS] - Clicked');
    $(this).addClass('active').siblings().removeClass('active');
    var resourceType = parseResources('Medium Rooms')
    setTimeout(function(){
      resourceSelection(resourceType, 'Medium Rooms');
    }, 30);
  });

  $('button#smallrooms').off('click').on('click', function() {
    window.debugger('[TEACHINGCALENDARS] - Clicked');
    $(this).addClass('active').siblings().removeClass('active');
    var resourceType = parseResources('Small Rooms')
    setTimeout(function(){
      resourceSelection(resourceType, 'Medium Rooms');
    }, 30);
  });

  $('button#lecture').off('click').on('click', function() {
    window.debugger('[LECTURECALENDARS] - Clicked');
    $(this).addClass('active').siblings().removeClass('active');
    var resourceType = (parseResources('Lecture Theatres').concat(parseResources('Lobbies')));
    setTimeout(function(){
      resourceSelection(resourceType, 'Lectures');
    }, 30);
  });

  printDate();

});

// Sets Calendar to server communication target (deprecated method) //
window.activecalendartarget = window.maincalendartarget

// FullCalendar Configuration //
window.maincalendar = $(function() {
  var activeButton = [];
  window.clickedEvent = '';
		$(window.maincalendartarget).fullCalendar({
			schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
			nowIndicator: true,
			editable: false,
			scrollTime: '07:00',
      minTime: '06:00',
      maxTime: '22:00',
      firstDay: 1,
			businessHours: {
        start: '8:00',
        end: '18:00',
        dow: [ 1, 2, 3, 4, 5 ]
      },
			header: '',
			defaultView: 'timelineDay',
			allDaySlot: false,
      groupByDateAndResource: false,
      views: {
        agendaDay: { titleFormat: 'dddd, Do MMMM YYYY' },
        timelineDay: { titleFormat: 'dddd, Do MMMM YYYY' },
        agendaFiveDay: {
            type: 'agenda',
            duration: { days: 5 }
        }
      },
      viewRender: function(view,element) {
        // All views load the current months events regardless of view length //
        view.start = moment(view.start).startOf('month');
        view.end = moment(view.end).endOf('month');
        printDate();
        $(activeButton[activeButton.length - 1]).removeClass('active');
        $('#menuleft').find('#' + view.name).addClass('active');
        activeButton.push($('#menuleft').find('#' + view.name))
        if (/month/i.test(view.name)) {
          $('#today').empty();
          $('#today').append('Current Month')
          $('#dateselect').data("kendoDatePicker").setOptions({ start: 'year', depth: 'year' });
        }
        else if (/week/i.test(view.name)) {
          $('#today').empty();
          $('#today').append('Current Week')
          $('#dateselect').data("kendoDatePicker").setOptions({ start: 'month', depth: 'month' });
        }
        else if (/day/i.test(view.name)) {
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
        if (/agendaday/i.test(view.name)) {
          if ( formatteddate == window.dateclicked && resourceObj.id == window.tdclicked.attr('data-resource-id') ) {
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
            var timerow = formatteddate.substr(formatteddate.indexOf("T") + 1, 8)
            $('tr[data-time="' + timerow + '"]').css('background-color', 'rgba(255,200,200, 0.2)');
            $('td[data-resource-id="' + resourceObj.id + '"]').css('background-color', 'rgba(255,200,200, 0.2)');
            window.dateclicked = formatteddate;
            window.trclicked = $('tr[data-time="' + timerow + '"]');
            window.tdclicked = $('td[data-resource-id="' + resourceObj.id + '"]');
          };
        }
        if (/agendaweek/i.test(view.name)) {
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
        else if (/timeline/i.test(view.name)) {
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
        if (/timeline/i.test(view.name)) {
          $(this).addClass('timelinehover')
        }
        else if (/agenda/i.test(view.name)) {
          $(this).addClass('agendahover').parents('div').css('z-index', '999')
        }
        else if (/month/i.test(view.name)) {
          var width = $(this).css('width')
          $(this).addClass('monthHover').css('width', width)
        }
      },
      eventMouseout: function(calEvent, jsEvent, view) {
        if (view.name.substring(0, 8) == 'timeline') {
          $(this).removeClass('timelinehover')
        }
        else if (view.name.substring(0, 6) == 'agenda') {
          $(this).removeClass('agendahover').parents('div').css('z-index', '')
        }
        else if (view.name == 'month') {
          $(this).removeClass('monthHover').css('width', 'initial')
        }
      },
      eventClick: function(calEvent, jsEvent, view) {
        $(window.tdclicked).css('background-color', '');
        $(window.trclicked).css('background-color', '');
        $(window.clickedEvent).removeClass('eventclick')
        clickedEvent = $(this)
        $(window.clickedEvent).addClass('eventclick');
        var calTitle = calEvent.title,
            calStart = calEvent.start,
            calEnd = calEvent.end,
            calColor = calEvent.color;
        console.log(calEvent.color)
        if (calEvent.description) {
          var calDes = calEvent.description;
        }
        else {
          var calDes = 'No description'
        }
        $('#dialogtemplate').clone().dialog().css('background', calColor).children('.dialogcontent').html('<p><span>' + calTitle + '</span></p><p>Date: ' + moment(calStart).format('dddd, [the] Do [of] MMMM YYYY') + '</p><p>Time: ' + moment(calStart).format('hh:mma') + ' - ' + moment(calEnd).format('hh:mma') + '</p><p>' + calDes + '</p>').parents('.ui-dialog').css('background', calColor)
      },
      loading: function(bool) {
        loading(bool, true)
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
			events: function(start, end, timezone, callback) {
        eventCall(start, end, timezone, callback)
      }
		});
		window.debugger('[CALENDARENGINE] - Main calendar (' + window.maincalendartarget + ') initialised');
	});
