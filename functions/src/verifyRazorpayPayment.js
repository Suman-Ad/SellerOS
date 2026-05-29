const { onCall } =
  require(
    "firebase-functions/v2/https"
  );

const crypto =
  require("crypto");

const {
  defineSecret,
} = require(
  "firebase-functions/params"
);

const SECRET =
  defineSecret(
    "RAZORPAY_KEY_SECRET"
  );

exports.verifyRazorpayPayment =
  onCall(
    {
      secrets: [SECRET],
    },

    async (
      request
    ) => {

      const {

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature,

      } = request.data;

      const expected =
        crypto
          .createHmac(
            "sha256",
            SECRET.value()
          )

          .update(
            razorpay_order_id +
            "|" +
            razorpay_payment_id
          )

          .digest("hex");

      return {

        verified:
          expected ===
          razorpay_signature,
      };
    }
  );