const { onCall, HttpsError } =
  require("firebase-functions/v2/https");

const { defineSecret } =
  require("firebase-functions/params");

const admin =
  require("firebase-admin");

const Razorpay =
  require("razorpay");

const RAZORPAY_KEY_ID =
  defineSecret("RAZORPAY_KEY_ID");

const RAZORPAY_KEY_SECRET =
  defineSecret("RAZORPAY_KEY_SECRET");

exports.createRazorpayOrder =
  onCall(
    {
      secrets: [
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET,
      ],
    },

    async (request) => {

      if (!request.auth) {

        throw new HttpsError(
          "unauthenticated",
          "Login required"
        );
      }

      const {
        planId,
        billingCycle,
      } = request.data || {};

      if (!planId) {

        throw new HttpsError(
          "invalid-argument",
          "Plan ID required"
        );
      }

      const planDoc =
        await admin
          .firestore()
          .collection(
            "subscriptionPlans"
          )
          .doc(planId)
          .get();

      if (!planDoc.exists) {

        throw new HttpsError(
          "not-found",
          "Plan not found"
        );
      }

      const plan =
        planDoc.data();

      const basePrice =
        billingCycle === "yearly"
          ? Number(
              plan.priceYearly || 0
            )
          : Number(
              plan.priceMonthly || 0
            );

      const gst =
        Math.round(
          basePrice * 0.18
        );

      const total =
        basePrice + gst;

      const razorpay =
        new Razorpay({

          key_id:
            RAZORPAY_KEY_ID.value(),

          key_secret:
            RAZORPAY_KEY_SECRET.value(),
        });

      const order =
        await razorpay.orders.create({

          amount:
            total * 100,

          currency:
            "INR",

          receipt:
            `selleros_${Date.now()}`,
        });

      return {

        success: true,

        order,

        total,
      };
    }
  );