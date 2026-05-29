// functions/index.js
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendInvitationEmail =
  require("./src/sendInvitationEmail")
    .sendInvitationEmail;

exports.createRazorpayOrder =
  require("./src/createRazorpayOrder")
    .createRazorpayOrder;

exports.verifyRazorpayPayment =
  require(
    "./src/verifyRazorpayPayment"
  ).verifyRazorpayPayment;