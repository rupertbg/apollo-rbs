# Apollo Resource Booking System
A resource booking system for the enterprise, written in JavaScript.

## Requirements 
- a CALDAV server (DAViCAL (http://www.davical.org/) works great)
- node.js & npm

## Usage

#### edit: server.js

Set your CALDAV credentials
`var davicalServer = 'http://yourCALDAVserver.com'
var davicalUser = 'username'
var davicalPass = 'password'`

Set your SMTP settings for nodemailer (gmail already set up, just enter credentials)

`var emailerOptions = {
    service: "Gmail",
    auth: {
        user: "yourgmailaddress",
        pass: "password"`

Set an endpoint for the booking emails to go
`global.receptionemail = "email-address-where-new-bookings-go"`

#### to run: `node server.js`

#### site available at port 8080 by default
