// Libraries //

var fs  = require("fs"),
    dav = require('dav'),
    icaljs = require('ical.js'),
    request = require('request'),
    express = require('express'),
    bodyParser = require('body-parser'),
    moment = require('moment'),
    range = require('moment-range'),
    schedule = require('node-schedule'),
    nodemailer = require("nodemailer"),
    smtpTransport = require('nodemailer-smtp-transport'),
    ical = require('ical-generator'),
    d3 = require('d3'),

    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

/************************************
            Global Variables
*************************************/

global.rbsVersion = 'v0.5.0';
global.httpPort = '8080';
global.debug = true;

// DAViCAL //

var davicalServer = 'http://yourCALDAVserver.com'
var davicalUser = 'username'
var davicalPass = 'password'

// DAViCAL Download Schedule //

var calPollSchedule = '*/10 * * * *'

// NodeMailer SMTP //

var emailerOptions = {
    service: "Gmail",
    auth: {
        user: "yourgmailaddress",
        pass: "password"
    }
};

// Email Endpoints //

global.receptionemail = "email-address-where-new-bookings-go"

// Directory Paths //
var idseq = './app/idseq'
var temploc = './app/tmp/'

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

global.resourceData = [];
var calendarHashes = [];
var calendarNames = [];

io.on('connection', function(socket){
  global.debugger('[SOCKET] - Client: Connection with session ID: ' + socket.id.slice(2) + '');
  socket.on('disconnect', function(){
    global.debugger('[SOCKET] - Client: Disconnection from session ID: ' + socket.id.slice(2) + '');
  });
  socket.on('error', function(exception) {
    global.debugger('[SOCKET] - ERROR: ' + exception);
    io.to(socket.id).emit('serverError', exception.toString())
  })
  socket.on('poll', function() {
    davicalPoll()
  });
  socket.on('roomCheck', function(req){
    var now = moment(),
        conflict = 0;
    for (var j = 0; j < resourceData.length; j++) {
      for (var k = 0; k < resourceData[j].events.length; k++) {
        if (resourceData[j].events[k].resourceId == req) {
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
    var eventData = []
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
  socket.on('getData', function(req) {
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
                var eventStart = moment(resourceData[j].events[k].start)
                if (eventStart.within(range)) {
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
            var eventStart = moment(resourceData[j].events[k].start)
            if (eventStart.within(range)) {
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

var cssColours = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","BlanchedAlmond","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Cyan","DarkCyan","DarkGoldenRod","DarkGrey","DarkKhaki","Darkorange","DarkSalmon","DarkSeaGreen","DarkTurquoise","DeepSkyBlue","DimGray","DodgerBlue","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","MediumAquaMarine","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MintCream","MistyRose","Moccasin","NavajoWhite","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Red","RosyBrown","RoyalBlue","Salmon","SandyBrown","SeaGreen","SeaShell","Silver","SkyBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
var resourceColours = cssColours

/************************************
            Calendar Client
*************************************/

// Kick-off //

setTimeout(function(){
  davicalLoad()
}, 2000);

setTimeout(function(){
  var calendarPoll = schedule.scheduleJob(calPollSchedule, function(){
    davicalPoll();
  });
}, 120000);

var xhr = new dav.transport.Basic(
  new dav.Credentials({
    username: davicalUser,
    password: davicalPass
  })
);

function davicalLoad() {
  var calID = 0;
  var totalParse = 0;
  global.debugger('[CALENDARINITIALISE] - START')
  dav.createAccount({ server: davicalServer, xhr: xhr })
  .then(function(account) {
    global.debugger('[CALENDARINITIALISE] - CALDAV server connection successful')
    account.calendars.forEach(function(calendar, calendarIndex, allcals) {
      if (calendar.displayName.substr(calendar.displayName.length - 5) != 'Inbox') {
        request(calendar.url, calParse)
        .auth('roombookings', 'roombookings', false)
        .on('response', function(response) {
          global.debugger('[CALENDARINITIALISE] - Calendar: ' + calendar.displayName + ', HTTP GET - Status: ' + response.statusCode + ', Content: ' + response.headers['content-type'])
        })
        .on('error', function(err) {
          global.debugger('[CALENDARINITIALISE] - Get error: ' + calendar.displayName + ' ' + err)
        })
        function calParse(err, resp, body) {
          if (resp.statusCode == 200) {
            var parseCount = 0,
                eventarray = [],
                vcalendar = new ICAL.Component(icaljs.parse(body)),
                vevents = vcalendar.getAllSubcomponents(),
                colourIndex = Math.floor(Math.random() * resourceColours.length),
                colour = resourceColours[colourIndex];

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
            resourceData.push({ id: calID, title: calendar.displayName, color: colour, events: eventarray });
            resourceColours.splice(colourIndex, 1);
            calendarNames.push(calendar.displayName)
            calendarHashes.push(calendar.ctag)
            if (resourceData.length == account.calendars.filter(function(element, index, array){if (element.displayName.substr(element.displayName.length - 5) != 'Inbox') { return true } else { return false }}).length) {
              global.debugger('[CALENDARINITIALISE] - Calendars downloaded: ' + calID )
              global.debugger('[CALENDARINITIALISE] - Events parsed: ' + totalParse )
              global.debugger('[CALENDARINITIALISE] - Update broadcast to clients')
              io.emit('resourceUpdate', resourceData)
              global.debugger('[CALENDARINITIALISE] - END')
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

function parseEvent(calendar, event, vevent, colour) {
    var evname = calendar.displayName + ' - ' + event.summary,
        evid = event.uid,
        evstart = moment.utc(event.startDate.toJSDate()).local().format(),
        evend = moment.utc(event.endDate.toJSDate()).local().format(),
        evdesc = event.description,
        evres = calendar.displayName,
        evday = d3.time.day(new Date(evstart)),
        evweek = d3.time.week(new Date(evstart)),
        evmonth = d3.time.month(new Date(evstart)),
        evduration = Math.round(moment.duration((moment.range(new Date(evstart), new Date(evend))).valueOf()).asHours() * 100) / 100;
  return { id: evid, title: evname, resourceId: evres, color: colour, description: evdesc, start: evstart, end: evend, day: evday, week: evweek, month: evmonth, duration: evduration }
}

function davicalPoll() {
  global.debugger('[CALENDARPOLL] - START')
  if (resourceColours.length == 0) {
    // Refill if we've run out of colours for resources //
    resourceColours = cssColours
  }
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
          global.debugger('[CALENDARPOLL] - END')
          setTimeout(function(){
            checkCalendars(polledCalendars)
          }, 2500);
        }
      });
    }, 2500);
  })
}

function checkCalendars(calendars) {
  global.debugger('[CALENDARCHECK] - START')
  var compareCount = 0,
      changeCount = 0,
      removeCount = 0,
      currentCals = [],
      calendarsToAdd = [],
      calendarsToReplace = [],
      calendarsToRemove = [];
  for (var c = 0; c < calendars.length; c++) {
    compareCount++
    var calendar = calendars[c]
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
  global.debugger('[CALENDARCHECK] - END')
}

function addCalendars(calendarsToAdd, calendarsToReplace) {
  global.debugger('[CALENDARADD] - START')
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
            colourIndex = Math.floor(Math.random() * resourceColours.length),
            colour = resourceColours[colourIndex];
        vevents.forEach(function(vevent){
          var event = new ICAL.Event(vevent);
          if (event.summary) {
            eventarray.push(parseEvent(calendar, event, vevent, colour))
            parseCount++
          }
        })
        global.debugger('[CALENDARPARSER] - Calendar: ' + calendar.displayName + ', JSON PARSE - Events: ' + parseCount)
        var calID = resourceData.length
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
  global.debugger('[CALENDARADD] - END')
}

function replaceCalendars(calendarsToReplace) {
  global.debugger('[CALENDARREPLACE] - START')
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
          colourIndex = Math.floor(Math.random() * resourceColours.length),
          colour = resourceColours[colourIndex];
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
      var calID = resourceData[i].id
      resourceData[i] = { id: calID, title: calendar.displayName, events: eventarray };
      calendarNames.push(calendar.displayName)
      calendarHashes.push(calendar.ctag)
      global.debugger('[CALENDARREPLACE] - Calendar updated: ' + calendar.displayName )
      io.emit('resourceUpdate', resourceData)
      global.debugger('[CALENDARREPLACE] - Update broadcast to clients')
    }
  }
  global.debugger('[CALENDARREPLACE] - END')
}

// Mailer //

var transporter = nodemailer.createTransport(smtpTransport(emailerOptions))

// Form parsing //

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/booking', function(req, res) {
  res.redirect('/booked.html');
  var formcontent = req.body;
  global.debugger('Request Receieved with following content: ');
  global.debugger(formcontent);
  var formevents = [];
  var roomCals = [];
  var resourceCals = [];
  var roomevents = [];
  var resourceevents= [];

  var seqfile = fs.readFileSync(idseq).toString();
  var seq = parseInt(seqfile, 10);
  var stepped = seq
  var requestids = [];

  for(var attributename in formcontent){
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
  for (var i = 0; i < formevents.length; i++) {
    var presenter = 'presenter' + formevents[i].Index;
    var timestart = 'timestart' + formevents[i].Index;
    var timeend = 'timeend' + formevents[i].Index;
    var room = 'room' + formevents[i].Index;
    var resource = 'resource' + formevents[i].Index;
    var description = 'description' + formevents[i].Index;
    for(var attributename in formcontent){
      if (attributename == presenter) {
        formevents[i].Presenter = formcontent[attributename]
      }
      if (attributename == timestart) {
        var startDate = moment(formcontent[attributename], 'DD/MM/YYYY hh:mma').toDate();
        formevents[i].StartDate = startDate;
      }
      if (attributename == timeend) {
        var endDate = moment(formcontent[attributename], 'DD/MM/YYYY hh:mma').toDate();
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
  for (var i = 0; i < formevents.length; i++) {
    stepped++
    formevents[i].RequestID = stepped
    requestids.push(formevents[i].RequestID)
    if (formevents[i].Room) {
      roomCals[i] = ical({
        prodId: {company: 'University of Otago, Wellington', product: 'Resource Booking System v0.98'},
        name: formevents[i].RequestID + ' - ' + formevents[i].Room,
        timezone: 'Pacific/Auckland'
      });
      roomCals[i].createEvent({
          start: formevents[i].StartDate,
          end: formevents[i].EndDate,
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
        prodId: {company: 'University of Otago, Wellington', product: 'Resource Booking System v0.98'},
        name: formevents[i].RequestID + ' - ' + formevents[i].Resource,
        timezone: 'Pacific/Auckland'
      });
      resourceCals[i].createEvent({
          start: formevents[i].StartDate,
          end: formevents[i].EndDate,
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

app.use(express.static('static'));

server.listen(global.httpPort, function() {
  console.log('')
  console.log('      //////////////////           \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\');
  console.log('')
  console.log('                          APOLLO')
  console.log('               Resource Booking System ' + global.rbsVersion);
  console.log('                HTTP Server up on port ' + global.httpPort);
  if (global.debug) {
    console.log('                       Debug Mode On')
  }
  else {
    console.log('                      Debug Mode Off')
  }
  console.log('')
  console.log('      \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\           //////////////////')
  console.log('')
});
