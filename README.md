# Apollo Resource Booking System
A resource booking system for the enterprise, written in JavaScript. Currently under active development. Mostly working, though some aspects are still in proof-of-concept phase.

## Features

- CALDAV client provided by [dav](https://www.npmjs.com/package/dav)
- Custom calendar viewer written on [FullCalendar](http://fullcalendar.io/)
- [Socket](http://socket.io/) for realtime notification of calendar changes and other bi-directional data
- Data analysis of CALDAV events charted in [dc.js](https://dc-js.github.io/dc.js/)
- Responsive design with separate mobile, tablet and desktop views
- Thorough debug console logging
- Demo content included (written for University of Otago, Wellington)

## Requirements 
- a CALDAV server ([DAViCAL](http://www.davical.org/) works great)
- node.js & npm

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
