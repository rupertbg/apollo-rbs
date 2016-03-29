# Apollo Resource Booking System
A resource booking system for the enterprise, written in JavaScript. Currently under active development. Mostly working, though some aspects are still in proof-of-concept phase. Documentation is on it's way. Expect filename changes and code clean-up before v1.

## Features

- CALDAV client provided by [dav](https://www.npmjs.com/package/dav)
- Custom calendar viewer written on [FullCalendar](http://fullcalendar.io/)
- [Socket](http://socket.io/) for realtime notification of calendar changes and other bi-directional data
- Data analysis of CALDAV events charted in [dc.js](https://dc-js.github.io/dc.js/)
- Responsive design with separate mobile, tablet and desktop views
- Thorough debug logging can be toggled for browser and node console
- Demo content included (written for University of Otago, Wellington)

## Requirements 
- A CALDAV server ([DAViCAL](http://www.davical.org/) works great)
- node.js & npm
- Your own content

## Usage

Edit server.js to suit your needs.

    Set your CALDAV credentials
    var davicalServer = 'http://yourCALDAVserver.com'
    var davicalUser = 'username'
    var davicalPass = 'password'

    Set your SMTP settings for nodemailer (gmail already set up, just enter credentials)

    var emailerOptions = {
        service: "Gmail",
        auth: {
            user: "yourgmailaddress",
            pass: "password"

    Set an endpoint for the booking emails to go
    global.receptionemail = "email-address-where-new-bookings-go"
    
To toggle debug mode:
- server.js - `global.debugger = boolean`
- static/scripts/rbs/rbs.js - `window.debug = boolean`

Run `npm install` to make sure all the modules are installed and up-to-date

To kick off the server run `node server.js`

Default port is 8080

Check [Wiki](https://github.com/rupertbg/apollo-rbs/wiki) for thorough information.

## Credits

Work unique to this project is made available under GPL license. All other licenses as stated or included in filesystem.

- [FullCalendar Scheduler](http://fullcalendar.io/scheduler/) used under GPL license.
- [Socket](http://socket.io) used under MIT license.
- [Crossfilter](http://square.github.io/crossfilter/) used under Apache 2.0 license.
- [bigSlide.js](http://ascott1.github.io/bigSlide.js/) used under MIT license.
- [d3.js](https://d3js.org/) used under license (Copyright (c) 2010-2016, Michael Bostock)
- [jQuery](https://jquery.org/) used under MIT license.
- [Kendo UI Core](http://www.telerik.com/kendo-ui/open-source-core) used under Apache 2.0 license.
- [moment.js](http://momentjs.com/) used under MIT license.
- [PapaParse.js](http://papaparse.com/) used under MIT license.
