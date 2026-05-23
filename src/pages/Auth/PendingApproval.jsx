import {
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  BadgeCheck,
  Building2,
  Clock3,
  FileCheck,
  MailCheck,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import logo
  from "@/assets/image.png";

/* =========================================================
   COMPONENT
========================================================= */

export default function PendingApproval() {

  const navigate =
    useNavigate();

  const {
    userData,
    refreshUser,
  } = useAuth();

  /* =====================================================
     AUTO REFRESH
  ===================================================== */

  useEffect(() => {

    const interval =
      setInterval(() => {

        refreshUser();

      }, 10000);

    return () =>
      clearInterval(interval);

  }, []);

  /* =====================================================
     AUTO REDIRECT
  ===================================================== */

  useEffect(() => {

    if (
      userData?.isApproved
    ) {

      navigate("/seller");
    }

  }, [
    userData,
    navigate,
  ]);

  /* =====================================================
     STATUS
  ===================================================== */

  const approvalStatus =
    userData?.approvalStatus ||
    "pending";

  const complianceStatus =
    userData?.complianceStatus ||
    {};

  const steps = [

    {
      title:
        "Email Verification",

      icon:
        MailCheck,

      completed:
        userData?.emailVerified,
    },

    {
      title:
        "Profile Completed",

      icon:
        UserCheck,

      completed:
        userData?.onboarding
          ?.profileCompleted,
    },

    {
      title:
        "Organization Setup",

      icon:
        Building2,

      completed:
        !!userData?.organizationId,
    },

    {
      title:
        "Compliance Verification",

      icon:
        FileCheck,

      completed:
        complianceStatus?.gst ===
          "approved" &&
        complianceStatus?.pan ===
          "approved",
    },

    {
      title:
        "Admin Approval",

      icon:
        ShieldCheck,

      completed:
        userData?.isApproved,
    },
  ];

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div
      className="
        min-h-screen
        relative
        overflow-hidden
        flex
        items-center
        justify-center
        p-6
      "
      style={{

        backgroundImage:
          `url(${logo})`,

        backgroundSize:
          "cover",

        backgroundPosition:
          "center",

        backgroundRepeat:
          "no-repeat",
      }}
    >

      {/* Overlay */}
      <div className="
        absolute inset-0
        bg-black/70
        backdrop-blur-sm
      " />

      {/* Content */}
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          relative z-10
          w-full
          max-w-4xl
        "
      >

        <Card className="
          border border-white/10
          bg-white/10
          backdrop-blur-2xl
          rounded-3xl
          overflow-hidden
          shadow-2xl
        ">

          <CardContent className="
            p-8 md:p-10
          ">

            {/* Header */}
            <div className="
              text-center
              mb-10
            ">

              <div className="
                w-24 h-24
                rounded-3xl
                bg-yellow-500/20
                border border-yellow-500/20
                flex items-center
                justify-center
                text-yellow-300
                mx-auto
                mb-6
              ">

                <Clock3
                  size={42}
                />

              </div>

              <h1 className="
                text-4xl
                font-black
                text-white
              ">

                Approval Pending

              </h1>

              <p className="
                text-zinc-300
                mt-4
                text-lg
              ">

                Your enterprise workspace is under compliance review.

              </p>

            </div>

            {/* Status Banner */}
            <div className="
              rounded-3xl
              border border-yellow-500/20
              bg-yellow-500/10
              p-6
              mb-10
            ">

              <div className="
                flex items-center
                gap-4
              ">

                <BadgeCheck
                  className="
                    text-yellow-300
                  "
                  size={32}
                />

                <div>

                  <h3 className="
                    text-white
                    text-xl
                    font-bold
                  ">

                    Status:
                    {" "}
                    {approvalStatus
                      .charAt(0)
                      .toUpperCase() +
                      approvalStatus.slice(1)}

                  </h3>

                  <p className="
                    text-zinc-300
                    mt-1
                  ">

                    Our compliance team is reviewing your account & organization.

                  </p>

                </div>

              </div>

            </div>

            {/* Progress */}
            <div className="
              mb-10
            ">

              <h2 className="
                text-2xl
                font-bold
                text-white
                mb-6
              ">

                Onboarding Progress

              </h2>

              <div className="
                space-y-5
              ">

                {steps.map(
                  (
                    step,
                    index
                  ) => {

                    const Icon =
                      step.icon;

                    return (

                      <div
                        key={index}
                        className="
                          flex items-center
                          justify-between
                          rounded-2xl
                          border border-white/10
                          bg-black/20
                          p-5
                        "
                      >

                        <div className="
                          flex items-center
                          gap-4
                        ">

                          <div className={`
                            w-14 h-14
                            rounded-2xl
                            flex items-center
                            justify-center
                            ${
                              step.completed
                                ? `
                                  bg-green-500/20
                                  text-green-300
                                `
                                : `
                                  bg-yellow-500/20
                                  text-yellow-300
                                `
                            }
                          `}>

                            <Icon
                              size={24}
                            />

                          </div>

                          <div>

                            <h3 className="
                              text-white
                              font-semibold
                              text-lg
                            ">

                              {step.title}

                            </h3>

                            <p className="
                              text-zinc-400
                              text-sm
                            ">

                              {step.completed
                                ? "Completed"
                                : "Pending"}

                            </p>

                          </div>

                        </div>

                        <div className={`
                          px-4 py-2
                          rounded-full
                          text-sm
                          font-semibold
                          ${
                            step.completed
                              ? `
                                bg-green-500/20
                                text-green-300
                              `
                              : `
                                bg-yellow-500/20
                                text-yellow-300
                              `
                          }
                        `}>

                          {step.completed
                            ? "Done"
                            : "Waiting"}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* Enterprise Notes */}
            <div className="
              grid md:grid-cols-3
              gap-4
              mb-10
            ">

              {[
                {
                  title:
                    "Compliance Review",

                  desc:
                    "GST, PAN & KYC verification process",
                },

                {
                  title:
                    "Marketplace Activation",

                  desc:
                    "Enterprise marketplace provisioning",
                },

                {
                  title:
                    "Workspace Security",

                  desc:
                    "Role-based workspace initialization",
                },
              ].map(
                (item) => (

                  <div
                    key={item.title}
                    className="
                      rounded-2xl
                      border border-white/10
                      bg-black/20
                      p-5
                    "
                  >

                    <h3 className="
                      text-white
                      font-semibold
                      text-lg
                    ">

                      {item.title}

                    </h3>

                    <p className="
                      text-zinc-400
                      mt-2
                      text-sm
                    ">

                      {item.desc}

                    </p>

                  </div>
                )
              )}

            </div>

            {/* Footer */}
            <div className="
              flex flex-col
              md:flex-row
              items-center
              justify-between
              gap-4
            ">

              <div className="
                text-zinc-400
                text-sm
              ">

                Status automatically refreshes every 10 seconds.

              </div>

              <div className="
                flex items-center
                gap-4
              ">

                <Button
                  variant="outline"
                  onClick={
                    refreshUser
                  }
                  className="
                    border-white/10
                    bg-black/20
                    text-white
                  "
                >

                  Refresh Status

                </Button>

                <Button
                  onClick={() =>
                    navigate(
                      "/compliance-upload"
                    )
                  }
                  className="
                    bg-violet-600
                    hover:bg-violet-700
                  "
                >

                  Upload Compliance

                </Button>

              </div>

            </div>

          </CardContent>

        </Card>

      </motion.div>

    </div>
  );
}