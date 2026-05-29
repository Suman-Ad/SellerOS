const admin = require("firebase-admin");

admin.initializeApp();

exports.sendInvitationEmail =
  require("./src/sendInvitationEmail")
    .sendInvitationEmail;
