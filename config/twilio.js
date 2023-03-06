// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const myNumber = process.env.TWILIO_MY_NUMBER;
const myOTP = process.env.TWILIO_MY_OTP;
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: myOTP,
     from: myNumber,
     to: a
   })
  .then(message => console.log(message.sid));
