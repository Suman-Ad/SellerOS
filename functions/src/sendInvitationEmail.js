const {
  onDocumentCreated,
} = require(
  "firebase-functions/v2/firestore"
);

const {
  defineSecret,
} = require(
  "firebase-functions/params"
);

const RESEND_API_KEY =
  defineSecret(
    "re_eG5TtJWC_4MAfrAgFgqHY3sc2ceU6afrs"
  );

const admin =
  require("firebase-admin");

const {
  Resend,
} = require("resend");

admin.initializeApp();

const resend =
  new Resend(
    RESEND_API_KEY.value()
  );

/* =========================================================
   SEND INVITATION EMAIL
========================================================= */

exports.sendInvitationEmail =
  onDocumentCreated(
    {
      document:
        "organization_invitations/{inviteId}",

      region:
        "us-central1",

      secrets: [
        RESEND_API_KEY,
      ],
    },

    async (event) => {

      try {

        const invitation =
          event.data.data();

        const inviteUrl =
          `https://selleros-e7bb4.web.app/invite/${invitation.token}`;

        await resend.emails.send({

          from:
            "SellerOS <onboarding@resend.dev>",

          to:
            invitation.invitedEmail,

          subject:
            `Invitation to join ${invitation.organizationName}`,

          html: `
            <div style="font-family:sans-serif;padding:40px">

              <h1>
                You're invited to join SellerOS
              </h1>

              <p>
                ${invitation.invitedByName}
                invited you to join:
              </p>

              <h2>
                ${invitation.organizationName}
              </h2>

              <a
                href="${inviteUrl}"
                style="
                  display:inline-block;
                  margin-top:20px;
                  background:#7c3aed;
                  color:white;
                  padding:14px 24px;
                  border-radius:10px;
                  text-decoration:none;
                "
              >
                Accept Invitation
              </a>

            </div>
          `,
        });

        console.log(
          "Invitation email sent"
        );

      } catch (error) {

        console.error(error);
      }
    }
  );