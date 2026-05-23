import {
  motion,
} from "framer-motion";

import {

  AlertTriangle,

  Ban,

  Clock3,

  Mail,

  ShieldAlert,

  XCircle,

} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Link,
} from "react-router-dom";

/* =========================================================
   COMPONENT
========================================================= */

export default function AccountRestricted() {

  const {
    userData,
  } = useAuth();

  /* =====================================================
     STATUS
  ===================================================== */

  const status =
    userData?.status ||
    "restricted";

  /* =====================================================
     CONFIG
  ===================================================== */

  const statusConfig = {

    rejected: {

      icon:
        XCircle,

      title:
        "Compliance Verification Rejected",

      description:
        "Your seller onboarding verification was rejected during compliance review. Please review your submitted information and re-submit your compliance documents.",

      color:
        "text-red-400",

      bg:
        "bg-red-500/10",

      border:
        "border-red-500/20",

      action:
        "/compliance-upload",

      actionLabel:
        "Re-submit Compliance",
    },

    suspended: {

      icon:
        Ban,

      title:
        "Account Suspended",

      description:
        "Your seller account has been temporarily suspended due to marketplace governance policies or compliance violations.",

      color:
        "text-yellow-400",

      bg:
        "bg-yellow-500/10",

      border:
        "border-yellow-500/20",

      action:
        "/contact-us",

      actionLabel:
        "Contact Governance Team",
    },

    blocked: {

      icon:
        ShieldAlert,

      title:
        "Account Blocked",

      description:
        "Your account has been permanently restricted from accessing SellerOS services due to severe policy violations or security concerns.",

      color:
        "text-red-500",

      bg:
        "bg-red-500/10",

      border:
        "border-red-500/20",

      action:
        "/contact-us",

      actionLabel:
        "Contact Security Team",
    },

    flagged: {

      icon:
        AlertTriangle,

      title:
        "Account Under Security Review",

      description:
        "Your seller account is currently under enterprise risk and fraud analysis review. Marketplace access is temporarily restricted until verification completes.",

      color:
        "text-orange-400",

      bg:
        "bg-orange-500/10",

      border:
        "border-orange-500/20",

      action:
        "/contact-us",

      actionLabel:
        "Contact Risk Team",
    },

    pending: {

      icon:
        Clock3,

      title:
        "Approval Pending",

      description:
        "Your seller account is currently under compliance and marketplace governance review. Please wait for admin approval.",

      color:
        "text-violet-400",

      bg:
        "bg-violet-500/10",

      border:
        "border-violet-500/20",

      action:
        "/pending-approval",

      actionLabel:
        "View Approval Status",
    },
  };

  const current =
    statusConfig[
      status
    ] ||
    statusConfig.pending;

  const Icon =
    current.icon;

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="
      min-h-screen
      bg-black
      text-white
      flex items-center
      justify-center
      p-6
    ">

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          w-full
          max-w-4xl
        "
      >

        <Card className={`
          bg-zinc-950
          border
          ${current.border}
        `}>

          <CardContent className="
            p-10
          ">

            {/* ICON */}
            <div className={`
              w-28 h-28
              rounded-3xl
              ${current.bg}
              flex items-center
              justify-center
              mx-auto
              mb-8
            `}>

              <Icon
                size={54}
                className={
                  current.color
                }
              />

            </div>

            {/* TITLE */}
            <div className="
              text-center
              mb-10
            ">

              <h1 className={`
                text-4xl
                md:text-5xl
                font-black
                mb-5
                ${current.color}
              `}>

                {current.title}

              </h1>

              <p className="
                text-zinc-400
                text-lg
                leading-relaxed
                max-w-3xl
                mx-auto
              ">

                {current.description}

              </p>

            </div>

            {/* STATUS INFO */}
            <div className="
              grid md:grid-cols-3
              gap-5
              mb-10
            ">

              <InfoCard
                title="Account Status"
                value={
                  userData?.status ||
                  "restricted"
                }
              />

              <InfoCard
                title="Approval Status"
                value={
                  userData?.approvalStatus ||
                  "pending"
                }
              />

              <InfoCard
                title="Organization Role"
                value={
                  userData?.organizationRole ||
                  "viewer"
                }
              />

            </div>

            {/* ACTIONS */}
            <div className="
              flex flex-col
              md:flex-row
              items-center
              justify-center
              gap-5
            ">

              <Link
                to={current.action}
              >

                <Button
                  size="lg"
                  className="
                    h-14
                    px-8
                    rounded-2xl
                    text-base
                    font-bold
                  "
                >

                  {current.actionLabel}

                </Button>

              </Link>

              <Link
                to="/"
              >

                <Button
                  variant="outline"
                  size="lg"
                  className="
                    h-14
                    px-8
                    rounded-2xl
                    border-zinc-700
                  "
                >

                  Back to Homepage

                </Button>

              </Link>

            </div>

            {/* SUPPORT */}
            <div className="
              mt-12
              pt-10
              border-t border-zinc-800
              text-center
            ">

              <div className="
                flex items-center
                justify-center
                gap-3
                mb-4
              ">

                <Mail
                  className="
                    text-violet-400
                  "
                />

                <h3 className="
                  text-xl
                  font-bold
                ">

                  Governance & Compliance Support

                </h3>

              </div>

              <p className="
                text-zinc-400
                max-w-2xl
                mx-auto
                leading-relaxed
              ">

                If you believe this restriction was applied incorrectly,
                please contact the SellerOS governance team with your
                organization information and compliance reference details.

              </p>

            </div>

          </CardContent>

        </Card>

      </motion.div>

    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  title,
  value,
}) {

  return (

    <div className="
      rounded-2xl
      border border-zinc-800
      bg-zinc-900
      p-5
      text-center
    ">

      <p className="
        text-zinc-400
        text-sm
        mb-2
      ">

        {title}

      </p>

      <h4 className="
        text-lg
        font-bold
        text-white
      ">

        {value}

      </h4>

    </div>
  );
}