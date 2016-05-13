#!/usr/bin/env node

// Libraries //

var fs  = require("fs"),
    crypto = require('crypto'),
    dav = require('dav'),
    icaljs = require('ical.js'),
    request = require('request'),
    express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    moment = require('moment'),
    range = require('moment-range'),
    schedule = require('node-schedule'),
    nodemailer = require("nodemailer"),
    smtpTransport = require('nodemailer-smtp-transport'),
    ical = require('ical-generator'),
    d3 = require('d3'),

    app = express(),
    server = http.createServer(app),
    io = require('socket.io')(server);

/************************************
            Global Variables
*************************************/

global.rbsVersion = 'v1.2.0';
global.httpPort = '3000';
global.debug = true;

// DAViCAL //

var davicalServer = 'http://davicalserver.somewhere'
var davicalUser = 'user'
var davicalPass = 'password'

// DAViCAL Download Schedule //

var calPollSchedule = '*/10 * * * *'

// iPad Calendars //

var iPadCalendars = [
  'webcal://somehwere.awebcal.com'
];

// NodeMailer SMTP //

var emailerOptions = {
    service: "Gmail",
    auth: {
        user: "asd@gmail.com",
        pass: "password"
    }
};

// Email Endpoints //

global.receptionemail = "somewhere@email.com"
global.feedbackemail = "feedback@email.com"

// Directory Paths //
var idseq = './app/idseq'
var temploc = './app/tmp/'
var fbfile = './app/feedback.json'

// DEBUGGER //

global.debugger = function (x) {
	if (global.debug == true) {
     console.log('[' + moment().toString() + '] - ' + x);
  };
};

/***********************************
************************************/

/************************************
                Socket
*************************************/

io.on('connection', function(socket){
  global.debugger('[SOCKET] - Client: Connection with session ID: ' + socket.id.slice(2) + '');
  socket.on('disconnect', function(){
    global.debugger('[SOCKET] - Client: Disconnection from session ID: ' + socket.id.slice(2) + '');
  });
  socket.on('error', function(exception) {
    global.debugger('[SOCKET] - ERROR: ' + exception);
    io.to(socket.id).emit('serverError', exception.toString())
  })
  socket.on('userFeedback', function(feedback) {
    var fbarray = [],
        fbfileread = fs.readFileSync(fbfile).toString();
    fbarray.push(fbfileread)
    fbarray.push(feedback)
    fs.writeFile(fbfile, JSON.stringify(fbarray), function(err) {
      if(err) {
          return global.debugger(err);
      }
      global.debugger('Feedback recieved and written to file');
    });
    var feedbackEmail = {
        from: global.receptionemail,
        to: global.feedbackemail,
        replyTo: global.feedbackemail,
        subject: '✔ Feedback Received on Apollo Dev Environment',
        generateTextFromHTML: true,
        html: '<h2>Rating: ' + feedback.rating + '</h2><p>User Feedback: ' + feedback.feedback + '</p>'
    }
    transporter.sendMail(feedbackEmail, function(error, response){
        if (error) {
          global.debugger(error);
          global.debugger('Illuminati Confirmed');
        }
        else {
          global.debugger('Feedback notification sent');
        }
    })
  })
  socket.on('poll', function() {
    caldavPoll()
    iPadCalendarsCheck()
  });
  socket.on('roomCheck', function(req){
    var now = moment(),
        conflict = 0;
    for (var j = 0; j < resourceData.length; j++) {
      for (var k = 0; k < resourceData[j].events.length; k++) {
        if (req == 'C02C05') {
          if (resourceData[j].events[k].resourceId == 'C02' || resourceData[j].events[k].resourceId == 'C05') {
            var range = moment.range(resourceData[j].events[k].start, resourceData[j].events[k].end)
            if (now.within(range)) {
              conflict++
              break
            }
          }
        }
        else if (resourceData[j].events[k].resourceId == req) {
          var range = moment.range(resourceData[j].events[k].start, resourceData[j].events[k].end)
          if (now.within(range)) {
            conflict++
            break
          }
        }
      }
    }
    if (conflict > 0) {
      io.to(socket.id).emit('roomFree', false)
    }
    else {
      io.to(socket.id).emit('roomFree', true)
    }
  })
  socket.on('getAnalysisData', function(){
    global.debugger('[SOCKET] - Client: Analysis data request from session ID: ' + socket.id.slice(2))
    var eventData = [];
    for (var j = 0; j < resourceData.length; j++) {
      for (var k = 0; k < resourceData[j].events.length; k++) {
        if (moment(resourceData[j].events[k].start).isAfter(moment('2011-12-31'))) {
          eventData.push(resourceData[j].events[k])
        }
      }
    }
    io.to(socket.id).emit('analysisData', eventData )
    global.debugger('[SOCKET] - Client: Analysis data sent to session ID: ' + socket.id.slice(2))
  })
  socket.on('bookingRequest', function(req) {
    var dataCount = 0;
    global.debugger('[SOCKET] - Client: Booking form data request from session ID: ' + socket.id.slice(2) + ', Range: ' + req.start + ' to ' + req.end)
    var start = moment(req.start),
        end = moment(req.end),
        resources = req.resources,
        range = moment.range(start, end),
        eventData = [];
    if (resources.length > 0) {
      global.debugger('[SOCKET] - Client: Booking form data request from session ID: ' + req.resources);
      for (var i = 0; i < resources.length; i++) {
        dataCount++
        for (var j = 0; j < resourceData.length; j++) {
          if (resources[i] == 'C02C05') {
            if (resourceData[j].title == 'C02' || resourceData[j].title == 'C05') {
              for (var k = 0; k < resourceData[j].events.length; k++) {
                if (resourceData[j].events[k].start) {
                  var eventRange = moment.range(moment(resourceData[j].events[k].start), moment(resourceData[j].events[k].end));
                  if (eventRange.overlaps(range)) {
                    eventData.push(resourceData[j].events[k])
                  }
                }
              }
            }
          }
          else if (resources[i] == resourceData[j].title ) {
            for (var k = 0; k < resourceData[j].events.length; k++) {
              if (resourceData[j].events[k].start) {
                var eventRange = moment.range(moment(resourceData[j].events[k].start), moment(resourceData[j].events[k].end));
                if (eventRange.overlaps(range)) {
                  eventData.push(resourceData[j].events[k])
                }
              }
            }
          }
        }
        if (dataCount == resources.length) {
          io.to(socket.id).emit('bookingData', { origin: parseInt(req.origin), events: eventData } )
          global.debugger('[SOCKET] - Client: Booking form data sent to session ID: ' + socket.id.slice(2) + ', Resources: ' + resources + ', Range: ' + req.start + ' to ' + req.end)
        }
      }
    }
    else if (resources.length == 0) {
      if (resourceData.length == 0) {
        io.to(socket.id).emit('bookingData', { origin: parseInt(req.origin), events: [] })
        global.debugger('[SOCKET] - Client: Empty data sent to session ID: ' + socket.id.slice(2) + ', Resources: No data to send, Range: ' + req.start + ' to ' + req.end)
      }
      else {
        for (var j = 0; j < resourceData.length; j++) {
          for (var k = 0; k < resourceData[j].events.length; k++) {
            var eventRange = moment.range(moment(resourceData[j].events[k].start), moment(resourceData[j].events[k].end));
            if (eventRange.overlaps(range)) {
              eventData.push(resourceData[j].events[k])
            }
          }
        }
        io.to(socket.id).emit('bookingData', { origin: parseInt(req.origin), events: eventData } )
        global.debugger('[SOCKET] - Client: Booking form data sent to session ID: ' + socket.id.slice(2) + ', Resources: All, Range: ' + req.start + ' to ' + req.end)
      }
    }
  });
  socket.on('calendarRequest', function(req) {
    var dataCount = 0;
    global.debugger('[SOCKET] - Client: Event data request from session ID: ' + socket.id.slice(2) + ', Range: ' + req.start + ' to ' + req.end)
    var start = moment(req.start, "YYYY-MM-DD"),
        end = moment(req.end, "YYYY-MM-DD"),
        resources = req.resources,
        range = moment.range(start, end),
        eventData = [];
    if (resources.length > 0) {
      global.debugger('[SOCKET] - Client: Event data request from session ID: ' + req.resources);
      for (var i = 0; i < resources.length; i++) {
        dataCount++
        for (var j = 0; j < resourceData.length; j++) {
          if (resources[i] == resourceData[j].title ) {
            for (var k = 0; k < resourceData[j].events.length; k++) {
              if (resourceData[j].events[k].start) {
                var eventRange = moment.range(moment(resourceData[j].events[k].start), moment(resourceData[j].events[k].end));
                if (eventRange.overlaps(range)) {
                  eventData.push(resourceData[j].events[k])
                }
              }
            }
          }
        }
        if (dataCount == resources.length) {
          io.to(socket.id).emit('calendarData', { id: 'CALDAV', events: eventData } )
          global.debugger('[SOCKET] - Client: Event data sent to session ID: ' + socket.id.slice(2) + ', Resources: ' + resources + ', Range: ' + req.start + ' to ' + req.end)
        }
      }
    }
    else if (resources.length == 0) {
      if (resourceData.length == 0) {
        io.to(socket.id).emit('calendarData', [])
        global.debugger('[SOCKET] - Client: Empty data sent to session ID: ' + socket.id.slice(2) + ', Resources: No data to send, Range: ' + req.start + ' to ' + req.end)
      }
      else {
        for (var j = 0; j < resourceData.length; j++) {
          for (var k = 0; k < resourceData[j].events.length; k++) {
            var eventRange = moment.range(moment(resourceData[j].events[k].start), moment(resourceData[j].events[k].end));
            if (eventRange.overlaps(range)) {
              eventData.push(resourceData[j].events[k])
            }
          }
        }
        io.to(socket.id).emit('calendarData', { id: 'CALDAV', events: eventData } )
        global.debugger('[SOCKET] - Client: Event data sent to session ID: ' + socket.id.slice(2) + ', Resources: All, Range: ' + req.start + ' to ' + req.end)
      }
    }
  });
});

/************************************
          Global Functions
*************************************/

// Search an array of objects for a specific property. Returns an array of values from each object where the property matched
function arrayPropSearch(array, property) {
  return array.map(function(e){return e[property];})
}

///////// Event Colours ////////
// Array of all possible CSS colours that are light enough to use with black text //
var cssColours = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","BlanchedAlmond","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Cyan","DarkCyan","DarkGoldenRod","DarkGrey","DarkKhaki","Darkorange","DarkSalmon","DarkSeaGreen","DarkTurquoise","DeepSkyBlue","DodgerBlue","FloralWhite","ForestGreen","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","MediumAquaMarine","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MintCream","MistyRose","Moccasin","NavajoWhite","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Red","RosyBrown","RoyalBlue","Salmon","SandyBrown","SeaGreen","SeaShell","Silver","SkyBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
// Array to track usage of colours //
var usedColours = [];
// Function to select a colour from cssColours and add the index to usedColours. If colours run out usedColours will reset to empty and start over. //
function colourSelector() {
  if (usedColours.length === cssColours.length) {
    usedColours = [];
  }
  var colour = cssColours[Math.floor(Math.random() * cssColours.length)];
  usedColours.push(colour)
  return colour
}
/////////////////////////////////

/************************************
            Calendar Client
*************************************/

var calID = 0,
    resourceData = [],
    calendarHashes = [],
    calendarNames = [],
    iPadCalsLoaded = [],
    xhr = new dav.transport.Basic(
      new dav.Credentials({
          username: davicalUser,
          password: davicalPass
        }
      )
    );

function caldavLoad() {
  var totalParse = 0;
  dav.createAccount({ server: davicalServer, xhr: xhr })
  .then(function(account) {
    global.debugger('[CALENDARINITIALISE] - CALDAV server connection successful')
    account.calendars.forEach(function(calendar, calendarIndex, allcals) {
      if (calendar.displayName.substr(calendar.displayName.length - 5) != 'Inbox') {
        request(calendar.url, calParse)
        .auth('roombookings', 'roombookings', false)
        .on('response', function(response) {
          global.debugger('[CALENDARDOWNLOAD] - Calendar: ' + calendar.displayName + ', HTTP GET - Status: ' + response.statusCode + ', Content: ' + response.headers['content-type'])
        })
        .on('error', function(err) {
          global.debugger('[CALENDARDOWNLOAD] - Get error: ' + calendar.displayName + ' ' + err)
        })
        function calParse(err, resp, body) {
          if (resp && resp.statusCode == 200) {
            var parseCount = 0,
                eventarray = [],
                vcalendar = new ICAL.Component(icaljs.parse(body)),
                vevents = vcalendar.getAllSubcomponents(),
                colour = colourSelector();

            vevents.forEach(function(vevent){
              var event = new ICAL.Event(vevent);
              if (event.summary) {
                eventarray.push(parseEvent(calendar, event, vevent, colour));
                parseCount++
                totalParse++
              }
            })
            global.debugger('[CALENDARPARSER] - Calendar: ' + calendar.displayName + ', JSON PARSE - Events: ' + parseCount)
            calID++
            resourceData.push({id: calID, title: calendar.displayName, color: colour, events: eventarray, method: 'caldav'});
            calendarNames.push(calendar.displayName)
            calendarHashes.push(calendar.ctag)
            if (resourceData.length == account.calendars.filter(function(element, index, array){if (element.displayName.substr(element.displayName.length - 5) != 'Inbox') { return true } else { return false }}).length + iPadCalendars.length) {
              global.debugger('[CALENDARDOWNLOAD] - Calendars downloaded: ' + calID )
              global.debugger('[CALENDARPARSER] - Events parsed: ' + totalParse )
              global.debugger('[CALENDARINITIALISE] - Update broadcast to clients')
              io.emit('resourceUpdate', resourceData)
              // Kick off polling schedule
              setTimeout(function(){
                schedule.scheduleJob(calPollSchedule, function(){
                  caldavPoll();
                });
              }, 120000);
            }
          }
          else {
            global.debugger('[CALENDARINITIALISE] - CALDAV server HTTP error')
          }
        }
      }
    });
  })
};

function iPadCalendarsLoad() {
  var parseCount = 0;
  for (var i = 0; i < iPadCalendars.length; i++) {
    var calendarUrl = iPadCalendars[i]
    var options = {
      url: calendarUrl.replace('webcal://', 'http://'),
      gzip: true
    };
    request(options, iPadCalResponse)
    .on('error', function(err) {
      global.debugger('[IPADCALENDARS] - Get error: ' + err)
    })
    function iPadCalResponse(err, resp, body) {
      parseCount++
      iPadCalParser(body)
      if (iPadCalendars.length === parseCount) {
        global.debugger('[IPADCALENDARS] - Finished parsing')
      }
    }
  };
  setTimeout(function(){
    schedule.scheduleJob(calPollSchedule, function(){
      iPadCalendarsCheck();
    });
  }, 120000);
};

function iPadCalendarsCheck() {
  var parseCount = 0,
      updateCount = 0,
      newCount = 0;
  for (var i = 0; i < iPadCalendars.length; i++) {
    var calendarUrl = iPadCalendars[i]
    var options = {
      url: calendarUrl.replace('webcal://', 'http://'),
      gzip: true
    };
    request(options, iPadCalResponse)
    .on('error', function(err) {
      global.debugger('[IPADCALENDARS] - GET error: ' + err)
    })
    function iPadCalResponse(err, resp, body) {
      var vcalendar = new ICAL.Component(icaljs.parse(body)),
          vevents = vcalendar.getAllSubcomponents(),
          calName = new ICAL.Event(vevents[0]).location.substring(new ICAL.Event(vevents[0]).location.indexOf('UOW')).replace(/ /g,''),
          calHash = crypto.createHash('md5').update(vcalendar.toString()).digest('hex'),
          nameIndex = arrayPropSearch(resourceData, 'title').indexOf(calName),
          hashIndex = arrayPropSearch(resourceData, 'hash').indexOf(calHash);
      parseCount++
      if ( nameIndex == -1 ) {
        newCount++
        global.debugger('[IPADCALENDARS] - New calendar detected: ' + calName)
        iPadCalParser(body);
      }
      else if ( nameIndex > -1 && hashIndex == -1 ) {
        updateCount++
        global.debugger('[IPADCALENDARS] - Replacing changed calendar: ' + calName)
        resourceData.splice(nameIndex, 1);
        iPadCalParser(body);
      }
      if (iPadCalendars.length === parseCount) {
        if (newCount) {
          global.debugger('[IPADCALENDARS] - Added ' + newCount + ' new calendars')
        }
        if (updateCount) {
          global.debugger('[IPADCALENDARS] - Replaced ' + updateCount + ' calendars')
        }
        global.debugger('[IPADCALENDARS] - Finished checking')
      }
    }
  };
}

function parseEvent(calendar, event, vevent, colour) {
    var evname = calendar.displayName + ' - ' + event.summary,
        evid = event.uid,
        evHash = crypto.createHash('md5').update(event.toString()).digest('hex'),
        evstart = moment.utc(event.startDate.toJSDate()).local().format(),
        evend = moment.utc(event.endDate.toJSDate()).local().format(),
        evdesc = event.description,
        evres = calendar.displayName,
        evday = d3.time.day(new Date(evstart)),
        evweek = d3.time.week(new Date(evstart)),
        evmonth = d3.time.month(new Date(evstart)),
        evduration = Math.round(moment.duration((moment.range(new Date(evstart), new Date(evend))).valueOf()).asHours() * 100) / 100;
  return { id: evid, title: evname, resourceId: evres, className: evres, color: colour, description: evdesc, start: evstart, end: evend, day: evday, week: evweek, month: evmonth, duration: evduration }
}

function iPadCalParser(body) {
  var vcalendar = new ICAL.Component(icaljs.parse(body)),
      vevents = vcalendar.getAllSubcomponents(),
      calName = new ICAL.Event(vevents[0]).location.substring(new ICAL.Event(vevents[0]).location.indexOf('UOW')).replace(/ /g,''),
      calHash = crypto.createHash('md5').update(vcalendar.toString()).digest('hex'),
      colour = colourSelector(),
      eventArray = [];
  global.debugger('[IPADCALENDARS] - Parsing calendar ' + calName)
  vevents.forEach(function(vevent){
    var event = new ICAL.Event(vevent);
    if (event.summary) {
      var evres = calName,
          evname = calName + ' - ' + event.summary,
          evid = event.uid,
          evHash = crypto.createHash('md5').update(event.toString()).digest('hex');
          evstart = moment.utc(event.startDate.toJSDate()).local().format(),
          evend = moment.utc(event.endDate.toJSDate()).local().format(),
          evdesc = event.description,
          evday = d3.time.day(new Date(evstart)),
          evweek = d3.time.week(new Date(evstart)),
          evmonth = d3.time.month(new Date(evstart)),
          evduration = Math.round(moment.duration((moment.range(new Date(evstart), new Date(evend))).valueOf()).asHours() * 100) / 100;
      eventArray.push({ id: evid, title: evname, resourceId: evres, className: evres, color: colour, description: evdesc, start: evstart, end: evend, day: evday, week: evweek, month: evmonth, duration: evduration })
      if (eventArray.length === vevents.length) {
        global.debugger('[IPADCALENDARS] - ' + evres + ': Parsed ' + eventArray.length + ' events')
        for (var i = 0; i < resourceData.length; i++) {
          if (resourceData[i].id > calID) {
            calID = resourceData[i].id
          }
        }
        calID++
        resourceData.push({id: calID, hash: calHash, title: evres, color: colour, events: eventArray, method: 'webcal'});
      }
    }
  })
}

function caldavPoll() {
  var polledCalendars = [];
  dav.createAccount({ server: davicalServer, xhr: xhr })
  .then(function(account) {
    global.debugger('[CALENDARPOLL] - CALDAV server connection successful')
    setTimeout(function(){
      account.calendars.forEach(function(calendar, calendarIndex, allcals) {
        if (calendar.displayName.substr(calendar.displayName.length - 5) != 'Inbox') {
          polledCalendars.push(calendar)
        }
        if (polledCalendars.length > 0 && polledCalendars.length == account.calendars.filter(function(element, index, array){if (element.displayName.substr(element.displayName.length - 5) != 'Inbox') { return true } else { return false }}).length) {
          global.debugger('[CALENDARPOLL] - Polling finished')
          setTimeout(function(){
            checkCalendars(polledCalendars)
          }, 2500);
        }
      });
    }, 2500);
  })
}

function checkCalendars(calendars) {
  var compareCount = 0,
      changeCount = 0,
      removeCount = 0,
      currentCals = [],
      calendarsToAdd = [],
      calendarsToReplace = [],
      calendarsToRemove = [];
  for (var c = 0; c < calendars.length; c++) {
    compareCount++
    var calendar = calendars[c];
    currentCals.push(calendar.displayName)
    if (calendarHashes.indexOf(calendar.ctag) > -1 && calendarNames.indexOf(calendar.displayName) == -1) {
      global.debugger('[CALENDARCHECK] - Calendar: ' + calendar.displayName + ' - Rename detected')
      j = calendarHashes.length;
      while( j-- ) {
        if(calendarHashes[j] === calendar.ctag) break;
      }
      calendarHashes.splice(j, 1);
      calendarNames.splice(j, 1);
      changeCount++
    }
    else if (calendarHashes.indexOf(calendar.ctag) == -1 && calendarNames.indexOf(calendar.displayName) > -1) {
      global.debugger('[CALENDARCHECK] - Calendar: ' + calendar.displayName + ' - New hash detected')
      j = calendarNames.length;
      while( j-- ) {
        if(calendarNames[j] === calendar.displayName) break;
      }
      calendarHashes.splice(j, 1);
      calendarNames.splice(j, 1);
      calendarsToReplace.push(calendar)
      changeCount++
    }
    else if (calendarHashes.indexOf(calendar.ctag) == -1 && calendarNames.indexOf(calendar.displayName) == -1) {
      global.debugger('[CALENDARCHECK] - Calendar: ' + calendar.displayName + ' - New calendar detected')
      calendarsToAdd.push(calendar)
      changeCount++
    }
    if (compareCount == calendars.length) {
      if (calendarsToAdd.length > 0 || calendarsToReplace.length > 0) {
        setTimeout(addCalendars(calendarsToAdd, calendarsToReplace), 2500);
      }
    }
  }
  if (compareCount == calendars.length) {
    for (var k = 0; k < resourceData.length; k++) {
      if (resourceData[k].method == 'caldav') {
        if (currentCals.indexOf(resourceData[k].title) == -1) {
          global.debugger('[CALENDARCHECK] - Calendar: ' + resourceData[k].title + ' - Removed from CALDAV server')
          j = calendarNames.length;
          while( j-- ) {
            if( calendarNames[j] === resourceData[k].title ) break;
          }
          calendarHashes.splice(j, 1);
          calendarNames.splice(j, 1);
          resourceData.splice(k, 1);
          removeCount++
        }
      }
    }
    if (removeCount > 0) {
      global.debugger('[CALENDARCHECK] - Removed ' + removeCount + ' calendar(s)')
      global.debugger('[CALENDARCHECK] - Update broadcast to clients')
      io.emit('resourceUpdate', resourceData)
    }
    else if (changeCount > 0) {
      global.debugger('[CALENDARCHECK] - ' + changeCount + ' change(s)')
    }
    else if (changeCount == 0) {
      global.debugger('[CALENDARCHECK] - No changes')
    }
  }
}

function addCalendars(calendarsToAdd, calendarsToReplace) {
  if (calendarsToAdd.length > 0) {
    var addCount = 0;
    for (var c = 0; c < calendarsToAdd.length; c++) {
      var calendar = calendarsToAdd[c]
      global.debugger('[CALENDARADD] - Calendar: ' + calendar.displayName + ' - Downloading new calendar')
      addCount++
      request(calendar.url, calParse)
      .auth('roombookings', 'roombookings', false)
      .on('response', function(response) {
        global.debugger('[CALENDARADD] - Calendar: ' + calendar.displayName + ', HTTP GET - Status: ' + response.statusCode + ', Content: ' + response.headers['content-type'])
      })
      .on('error', function(err) {
        global.debugger('[CALENDARADD] - Get error: ' + calendar.displayName + ' ' + err)
      })
      function calParse(err, resp, body) {
        var parseCount = 0,
            eventarray = [],
            vcalendar = new ICAL.Component(icaljs.parse(body)),
            vevents = vcalendar.getAllSubcomponents(),
            colour = colourSelector();
        vevents.forEach(function(vevent){
          var event = new ICAL.Event(vevent);
          if (event.summary) {
            eventarray.push(parseEvent(calendar, event, vevent, colour))
            parseCount++
          }
        })
        global.debugger('[CALENDARPARSER] - Calendar: ' + calendar.displayName + ', JSON PARSE - Events: ' + parseCount)
        calID = resourceData.length
        resourceData.push({ id: calID, title: calendar.displayName, events: eventarray });
        calendarNames.push(calendar.displayName)
        calendarHashes.push(calendar.ctag)
        global.debugger('[CALENDARADD] - Calendar added: ' + calendar.displayName )
      }
      if (addCount == calendarsToAdd.length && calendarsToReplace.length == 0) {
        io.emit('resourceUpdate', resourceData)
        global.debugger('[CALENDARADD] - Update broadcast to clients')
      }
    }
  }
  if (calendarsToReplace.length > 0) {
    global.debugger('[CALENDARADD] - Queuing calendar replacer')
    setTimeout(replaceCalendars(calendarsToReplace), 2500);
  }
}

function replaceCalendars(calendarsToReplace) {
  for (var c = 0; c < calendarsToReplace.length; c++) {
    var calendar = calendarsToReplace[c]
    global.debugger('[CALENDARREPLACE] - Calendar: ' + calendar.displayName + ' - Updating calendar')
    request(calendar.url, calParse)
    .auth('roombookings', 'roombookings', false)
    .on('response', function(response) {
      global.debugger('[CALENDARREPLACE] - Calendar: ' + calendar.displayName + ', HTTP GET - Status: ' + response.statusCode + ', Content: ' + response.headers['content-type'])
    })
    .on('error', function(err) {
      global.debugger('[CALENDARREPLACE] - Get error: ' + calendar.displayName + ' ' + err)
    })
    function calParse(err, resp, body) {
      var parseCount = 0,
          eventarray = [],
          vcalendar = new ICAL.Component(icaljs.parse(body)),
          vevents = vcalendar.getAllSubcomponents(),
          colour = colourSelector();
      vevents.forEach(function(vevent){
        var event = new ICAL.Event(vevent);
        if (event.summary) {
          eventarray.push(parseEvent(calendar, event, vevent, colour))
          parseCount++
        }
      })
      global.debugger('[CALENDARPARSER] - Calendar: ' + calendar.displayName + ', JSON PARSE - Events: ' + parseCount)
      var i = resourceData.length;
      while( i-- ) {
          if( resourceData[i].title === calendar.displayName ) break;
      }
      calID = resourceData[i].id
      resourceData[i] = { id: calID, title: calendar.displayName, events: eventarray };
      calendarNames.push(calendar.displayName)
      calendarHashes.push(calendar.ctag)
      global.debugger('[CALENDARREPLACE] - Calendar updated: ' + calendar.displayName )
      io.emit('resourceUpdate', resourceData)
      global.debugger('[CALENDARREPLACE] - Update broadcast to clients')
    }
  }
}

// Mailer //

var transporter = nodemailer.createTransport(smtpTransport(emailerOptions))

// Form parsing //

app.use(bodyParser.urlencoded({ extended: true }));

/************************
       Booking API
************************/
app.post('/booking', function(req, res) {
  // Send client to confirmation page //
  res.redirect('/booked.html');
  var formcontent = req.body;
  global.debugger('Request Receieved with following content: ');
  // Form data sent to console output for development //
  global.debugger(JSON.stringify(formcontent));
  // Define variables for building events //
  var formevents = [],
      roomCals = [],
      resourceCals = [],
      roomevents = [],
      resourceevents = [],
      seqfile = fs.readFileSync(idseq).toString(),
      seq = parseInt(seqfile, 10),
      stepped = seq,
      requestids = [];
  // Gather contact info and push event titles into formevents array //
  for (var attributename in formcontent) {
    if (attributename == "contactname") {
      global.formname = formcontent[attributename];
    }
    else if (attributename == "contactdept") {
      global.formdept = formcontent[attributename];
    }
    else if (attributename == "contactnumber") {
      global.formphone = formcontent[attributename];
    }
    else if (attributename == "contactemail") {
      global.formemail = formcontent[attributename];
    }
    else if (attributename.substring(0, 5) == 'title') {
      var evin = attributename.replace(/\D/g,'');
      var ev = {};
      ev.Index = evin
      ev.Title = formcontent[attributename]
      formevents.push(ev);
    }
  }
  // Push values from form data for each event title in formevents array //
  for (var i = 0; i < formevents.length; i++) {
    var presenter = 'presenter' + formevents[i].Index;
    var timestart = 'timestart' + formevents[i].Index;
    var timeend = 'timeend' + formevents[i].Index;
    var room = 'room' + formevents[i].Index;
    var resource = 'resource' + formevents[i].Index;
    var description = 'description' + formevents[i].Index;
    for(var attributename in formcontent) {
      if (attributename == presenter) {
        formevents[i].Presenter = formcontent[attributename]
      }
      if (attributename == timestart) {
        var startDate = formcontent[attributename];
        formevents[i].StartDate = startDate;
      }
      if (attributename == timeend) {
        var endDate = formcontent[attributename];
        formevents[i].EndDate = endDate;
      }
      if (attributename == room) {
        formevents[i].Room = formcontent[attributename]
      }
      if (attributename == resource) {
        formevents[i].Resource = formcontent[attributename]
      }
      if (attributename == description) {
        formevents[i].Description = formcontent[attributename]
      }
    }
  }
  // Build iCal structure into roomCals array from formevents array data //
  for (var i = 0; i < formevents.length; i++) {
    stepped++
    formevents[i].RequestID = stepped
    requestids.push(formevents[i].RequestID)
    if (formevents[i].Room) {
      roomCals[i] = ical({
        prodId: {company: 'University of Otago, Wellington', product: 'Resource Booking System ' + global.rbsVersion},
        name: formevents[i].RequestID + ' - ' + formevents[i].Room,
        timezone: 'Pacific/Auckland'
      });
      roomCals[i].createEvent({
        start: moment(formevents[i].StartDate, 'DD/MM/YYYY hh:mma').toDate(),
        end: moment(formevents[i].EndDate, 'DD/MM/YYYY hh:mma').toDate(),
        timestamp: new Date(),
        summary: formevents[i].RequestID + ' - ' + formevents[i].Title,
        location: formevents[i].Room,
        description: formevents[i].Description,
        organizer: {
          name: global.formname,
          email: global.formemail
        }
      });
    }
    if (formevents[i].Resource) {
      resourceCals[i] = ical({
        prodId: {company: 'University of Otago, Wellington', product: 'Resource Booking System ' + global.rbsVersion},
        name: formevents[i].RequestID + ' - ' + formevents[i].Resource,
        timezone: 'Pacific/Auckland'
      });
      resourceCals[i].createEvent({
        start: moment(formevents[i].StartDate, 'DD/MM/YYYY hh:mma').toDate(),
        end: moment(formevents[i].EndDate, 'DD/MM/YYYY hh:mma').toDate(),
        timestamp: new Date(),
        summary: formevents[i].RequestID + ' - ' + formevents[i].Title,
        location: formevents[i].Resource,
        description: formevents[i].Description,
        organizer: {
          name: global.formname,
          email: global.formemail
        }
      });
    }
  }


  global.debugger('Current Request IDs: ' + requestids)

  fs.writeFile(idseq, stepped, function(err) {
    if(err) {
        return global.debugger(err);
    }
    global.debugger('Event ID file updated: ' + stepped);
  });
  // Build iCal files from roomCals array and save to disk //
  for (var i = 0; i < formevents.length; i++) {
    var icsattachments = [];
    for (var j = 0; j < roomCals.length; j++) {
      var roomname = roomCals[j].name()
      if (formevents[i].RequestID + ' - ' + formevents[i].Room == roomname) {
        roomCals[j].saveSync(temploc + roomname + '.ics', function(err) {
          if(err) {
              return global.debugger(err);
          }
        });
        global.debugger('Writing ' + roomname + '.ics to disk');
        var file = new Object();
            file["path"] = temploc + roomname + '.ics'
            file["contentType"] = 'text/calendar'
        icsattachments.push(file);
      };
    };
    for (var j = 0; j < resourceCals.length; j++) {
      var resourcename = resourceCals[j].name()
      if (formevents[i].RequestID + ' - ' + formevents[i].Resource == resourcename) {
        resourceCals[j].saveSync(temploc + resourcename + '.ics', function(err) {
          if(err) {
              return global.debugger(err);
          }
        });
        global.debugger('Writing ' + resourcename + '.ics to disk')
        var file = new Object();
            file["path"] = temploc + resourcename + '.ics'
            file["contentType"] = 'text/calendar'
        icsattachments.push(file);
      };
    };

    global.debugger(icsattachments)

    var receptionEmail = {
        from: '"' + global.formname + '"' + ' <' + global.formemail + '>',
        to: global.receptionemail,
        replyTo: global.receptionemail + ', ' + global.formemail,
        subject: '✔ Booking Request: ' + formevents[i].RequestID + ' - ' + formevents[i].Title,
        attachments: icsattachments,
        generateTextFromHTML: true,
        html: '<h2>UOW Resource Bookings System</h2><p>' + global.formname + ' has requested a booking for ' + formevents[i].StartDate + ' in ' + formevents[i].Room + '</p>' + '<ul><li><p>Booking title: <b>' + formevents[i].Title + '</b></p></li><li><p> Presenter: ' + formevents[i].Presenter  + '</p></b></li></ul>'
    }
    var requesterEmail = {
        from: global.receptionemail,
        to: '"' + global.formname + '"' + ' <' + global.formemail + '>',
        replyTo: global.receptionemail + ', ' + global.formemail,
        subject: '✔ Booking Request: ' + formevents[i].RequestID + ' - ' + formevents[i].Title,
        attachments: icsattachments,
        generateTextFromHTML: true,
        html: '<h2>UOW Resource Bookings System</h2><p>' + global.formname + ', thank you for your request. The contact details we have for you are: <ul><li><p>Name: ' + global.formname + '</p></li><li><p>Dept/Organisation: ' + global.formdept + '</p></li><li><p>Phone: ' + global.formphone + '</p></li><li><p>Email: ' + global.formemail + '</p></li></ul><p>We received the following booking request: </p><ul><li><p>Booking title: <b>' + formevents[i].Title + '</b></p></li><li><p> Presenter: ' + formevents[i].Presenter  + '</p></li><li><p>Room: ' + formevents[i].Room + '</p></li><li><p>Date: ' + formevents[i].StartDate + '</p></li><li><p>Until: ' + formevents[i].EndDate + '</p></li></ul>'
    }
    transporter.sendMail(requesterEmail, function(error, response){
        if (error) {
          global.debugger(error);
          global.debugger('Illuminati Confirmed');
        }
        else {
          global.debugger('Confirmation sent to requester(s)');
        }
    })
    transporter.sendMail(receptionEmail, function(error, response){
        if (error) {
          global.debugger(error);
          global.debugger('Illuminati Confirmed');
        }
        else {
          global.debugger('Request sent to reception');
        }
    });
  };
});

/************************************
                Runtime
************************************/

// Load Calendars //
iPadCalendarsLoad()
caldavLoad()

// Serve web client from static folder //
app.use(express.static('static'));

// Listen on httpPort //
server.listen(global.httpPort, function() {
  if (global.debug) {
    global.debugger('[RESOURCEBOOKINGSYSTEM] - Version: ' + global.rbsVersion + ' - HTTP port: ' + global.httpPort + ' - Debug mode: On');
  }
  else {
    console.log('[' + moment().toString() + '] - [RESOURCEBOOKINGSYSTEM] - Version: ' + global.rbsVersion + ' - HTTP port: ' + global.httpPort + ' - Debug mode: Off');
  }
});
