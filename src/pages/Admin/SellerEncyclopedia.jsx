import {
  use,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {

  Activity,

  BadgeCheck,

  Building2,

  CalendarDays,

  CreditCard,

  FileCheck,

  Mail,

  Phone,

  ShieldAlert,

  ShieldCheck,

  Store,

  User,

  Globe,

  ExternalLink,

} from "lucide-react";

import {

  doc,

  getDoc,

  collection,

  query,

  where,

  getDocs,

} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  toast,
} from "sonner";

import {
  useOrganizationDetails,
} from "@/utils/firebaseDB/OrganizationDetails";

/* =========================================================
   COMPONENT
========================================================= */

export default function SellerEncyclopedia() {

  const { sellerId } =
    useParams();

  /* =====================================================
     STATE
  ===================================================== */

  const [loading,
    setLoading] =
    useState(true);

  const [seller,
    setSeller] =
    useState(null);

  const organization =
    useOrganizationDetails(
        sellerId
    );

  /* =====================================================
     FETCH
  ===================================================== */

  useEffect(() => {

    const fetchSeller =
      async () => {

        try {

          setLoading(true);

          const sellerRef =
            doc(
              db,
              "users",
              sellerId
            );

          const snapshot =
            await getDoc(
              sellerRef
            );

          if (
            !snapshot.exists()
          ) {

            toast.error(
              "Seller not found"
            );

            return;
          }

          setSeller({

            id:
              snapshot.id,

            ...snapshot.data(),
          });


        } catch (error) {

          console.error(error);

          toast.error(
            "Failed to load seller profile"
          );

        } finally {

          setLoading(false);
        }
      };

    if (sellerId) {

      fetchSeller();
    }

  }, [sellerId]);

  /* =====================================================
     NORMALIZED DATA
  ===================================================== */

  const profile =
    seller?.profile || {};

  // const organization =
  //   seller?.organization || {};

  const governance =
    seller?.governance || {};

  const subscription =
    seller?.subscription || {};

  const onboarding =
    seller?.onboarding || {};

  const complianceDocs =
    seller?.complianceDocuments || {};

  const complianceStatus =
    seller?.complianceStatus || {};

  const authStatus =
    seller?.authStatus || {};

  const access =
    seller?.access || {};

  const sellerStatus =
    governance?.sellerStatus ||
    "pending_review";

  const isApproved =
    sellerStatus ===
    "approved";

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        text-white
      ">

        Loading Seller Encyclopedia...

      </div>
    );
  }

  /* =====================================================
     NOT FOUND
  ===================================================== */

  if (!seller) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex
        items-center
        justify-center
        text-zinc-400
      ">

        Seller not found

      </div>
    );
  }

  /* =====================================================
     COMPLIANCE LIST
  ===================================================== */

  const complianceItems = [

    {
      key: "gst",
      title:
        "GST Verification",
    },

    {
      key: "pan",
      title:
        "PAN Verification",
    },

    {
      key:
        "governmentId",
      title:
        "Government ID",
    },

    {
      key: "bank",
      title:
        "Bank Verification",
    },
  ];

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="
      min-h-screen
      bg-black
      text-white
      p-6
    ">

      {/* =====================================================
         HEADER
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          flex flex-col
          xl:flex-row
          xl:items-center
          justify-between
          gap-6
          mb-10
        "
      >

        <div className="
          flex items-center
          gap-5
        ">

          <div className="
            w-24 h-24
            rounded-3xl
            bg-violet-500/20
            text-violet-300
            flex items-center
            justify-center
          ">

            <User
              size={42}
            />

          </div>

          <div>

            <h1 className="
              text-4xl
              font-black
            ">

              {profile?.fullName ||
                seller?.fullName ||
                "Unknown Seller"}

            </h1>

            <p className="
              text-zinc-400
              mt-2
            ">

              Enterprise Seller Intelligence Profile

            </p>

            <div className="
              flex flex-wrap
              gap-3
              mt-4
            ">

              <StatusBadge
                label={
                  sellerStatus
                }
                color={
                  isApproved
                    ? "green"
                    : sellerStatus ===
                      "rejected"
                      ? "red"
                      : "yellow"
                }
              />

              <StatusBadge
                label={
                  seller?.organization
                    ?.organizationRole ||
                  "viewer"
                }
                color="violet"
              />

              <StatusBadge
                label={
                  access?.role ||
                  "seller"
                }
                color="blue"
              />

              {isApproved && (

                <StatusBadge
                  label="Verified Seller"
                  color="green"
                />
              )}

            </div>

          </div>

        </div>

        <div className="
          flex flex-wrap
          gap-3
        ">

          <Button
            className="
              bg-green-600
              hover:bg-green-700
            "
          >

            <BadgeCheck
              size={18}
            />

            {isApproved
              ? "Approved Seller"
              : "Pending Approval"}

          </Button>

          <Button
            variant="outline"
            className="
              border-zinc-700
            "
          >

            <ShieldAlert
              size={18}
            />

            Risk Review

          </Button>

        </div>

      </motion.div>

      {/* =====================================================
         OVERVIEW
      ===================================================== */}

      <div className="
        grid lg:grid-cols-4
        gap-5
        mb-10
      ">

        <OverviewCard
          icon={Store}
          title="Organization"
          value={
            organization
              ?.organizationName ||
            "N/A"
          }
        />

        <OverviewCard
          icon={FileCheck}
          title="Compliance"
          value={
            onboarding
              ?.complianceSubmitted
              ? "Submitted"
              : "Pending"
          }
        />

        <OverviewCard
          icon={CreditCard}
          title="Subscription"
          value={
            subscription
              ?.planName ||
            "Free"
          }
        />

        <OverviewCard
          icon={Activity}
          title="Account Status"
          value={
            sellerStatus
          }
        />

      </div>

      {/* =====================================================
         PROFILE + BUSINESS
      ===================================================== */}

      <div className="
        grid xl:grid-cols-2
        gap-6
        mb-10
      ">

        {/* PROFILE */}

        <Card className="
          bg-zinc-950
          border-zinc-800
        ">

          <CardContent className="
            p-6
          ">

            <SectionTitle
              icon={User}
              title="Identity Profile"
            />

            <div className="
              grid gap-5
            ">

              <InfoRow
                icon={Mail}
                label="Email"
                value={
                  seller?.email
                }
              />

              <InfoRow
                icon={Phone}
                label="Phone"
                value={
                  profile
                    ?.phoneNumber
                }
              />

              <InfoRow
                icon={CalendarDays}
                label="Joined"
                value={
                  seller?.createdAt
                    ?.toDate?.()
                    ?.toLocaleDateString?.() ||
                  "N/A"
                }
              />

              <InfoRow
                icon={ShieldCheck}
                label="Email Verification"
                value={
                  authStatus
                    ?.emailVerified
                    ? "Verified"
                    : "Pending"
                }
              />

              <InfoRow
                icon={User}
                label="Platform Role"
                value={
                  access?.role
                }
              />

              <InfoRow
                icon={Building2}
                label="Organization Role"
                value={
                  seller?.organization
                    ?.organizationRole
                }
              />

            </div>

          </CardContent>

        </Card>

        {/* BUSINESS */}

        <Card className="
          bg-zinc-950
          border-zinc-800
        ">

          <CardContent className="
            p-6
          ">

            <SectionTitle
              icon={Store}
              title="Business Intelligence"
            />

            <div className="
              grid gap-5
            ">

              <InfoRow
                icon={Building2}
                label="Organization"
                value={
                  organization
                    ?.organizationName
                }
              />

              <InfoRow
                icon={Globe}
                label="Website"
                value={
                  organization
                    ?.website
                }
              />

              <InfoRow
                icon={Mail}
                label="Business Email"
                value={
                  organization
                    ?.businessEmail
                }
              />

              <InfoRow
                icon={Phone}
                label="Business Phone"
                value={
                  organization
                    ?.businessPhone
                }
              />

              <InfoRow
                icon={CreditCard}
                label="Subscription Plan"
                value={
                  subscription
                    ?.planName
                }
              />

              <InfoRow
                icon={ShieldAlert}
                label="Governance Status"
                value={
                  sellerStatus
                }
              />

            </div>

          </CardContent>

        </Card>

      </div>

      {/* =====================================================
         COMPLIANCE
      ===================================================== */}

      <Card className="
        bg-zinc-950
        border-zinc-800
        mb-10
      ">

        <CardContent className="
          p-6
        ">

          <SectionTitle
            icon={ShieldAlert}
            title="Compliance Intelligence"
          />

          <div className="
            grid md:grid-cols-2
            xl:grid-cols-4
            gap-5
          ">

            {complianceItems.map(
              (item) => {

                const document =
                  complianceDocs[
                  item.key
                  ];

                const status =
                  complianceStatus[
                  item.key
                  ];

                return (

                  <div
                    key={item.key}
                    className="
                      rounded-2xl
                      border border-zinc-800
                      bg-zinc-900
                      p-5
                    "
                  >

                    <div className="
                      flex items-center
                      justify-between
                      mb-4
                    ">

                      <h3 className="
                        text-lg
                        font-bold
                      ">

                        {item.title}

                      </h3>

                      <FileCheck
                        className="
                          text-violet-400
                        "
                      />

                    </div>

                    {document ? (

                      <div>

                        <div className="
                          flex items-center
                          justify-between
                          mb-4
                        ">

                          <p className="
                            text-zinc-400
                          ">

                            Status

                          </p>

                          <StatusBadge
                            label={
                              status
                                ?.status ||
                              "pending"
                            }
                            color={
                              status
                                ?.status ===
                                "approved"
                                ? "green"
                                : status
                                  ?.status ===
                                  "rejected"
                                  ? "red"
                                  : "yellow"
                            }
                          />

                        </div>

                        <div className="
                          text-zinc-400
                          text-sm
                          mb-4
                          break-all
                        ">

                          {
                            document
                              ?.number
                          }

                        </div>

                        <Button
                          asChild
                          className="
                            bg-violet-600
                            hover:bg-violet-700
                            w-full
                          "
                        >

                          <a
                            href={
                              document
                                ?.url
                            }
                            target="_blank"
                            rel="noreferrer"
                          >

                            <ExternalLink
                              size={16}
                            />

                            View Document

                          </a>

                        </Button>

                        {document?.url && (

                          <iframe
                            src={
                              document.url
                            }
                            title={
                              item.title
                            }
                            className="
                              w-full
                              h-64
                              rounded-xl
                              mt-4
                              border
                              border-zinc-700
                              bg-white
                            "
                          />

                        )}

                      </div>

                    ) : (

                      <div className="
                        text-yellow-400
                      ">

                        Not Uploaded

                      </div>

                    )}

                  </div>
                );
              }
            )}

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
         TIMELINE
      ===================================================== */}

      <Card className="
        bg-zinc-950
        border-zinc-800
      ">

        <CardContent className="
          p-6
        ">

          <SectionTitle
            icon={Activity}
            title="Seller Lifecycle Timeline"
          />

          <div className="
            space-y-6
          ">

            <TimelineItem
              title="Account Created"
              status="completed"
            />

            <TimelineItem
              title="Email Verification"
              status={
                authStatus
                  ?.emailVerified
                  ? "completed"
                  : "pending"
              }
            />

            <TimelineItem
              title="Profile Completed"
              status={
                onboarding
                  ?.profileCompleted
                  ? "completed"
                  : "pending"
              }
            />

            <TimelineItem
              title="Organization Created"
              status={
                organization
                  ?.organizationId
                  ? "completed"
                  : "pending"
              }
            />

            <TimelineItem
              title="Compliance Uploaded"
              status={
                onboarding
                  ?.complianceSubmitted
                  ? "completed"
                  : "pending"
              }
            />

            <TimelineItem
              title="Marketplace Approval"
              status={
                isApproved
                  ? "completed"
                  : "pending"
              }
            />

          </div>

        </CardContent>

      </Card>

    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon: Icon,
  title,
}) {

  return (

    <div className="
      flex items-center
      gap-3
      mb-6
    ">

      <Icon
        className="
          text-violet-400
        "
      />

      <h2 className="
        text-2xl
        font-bold
      ">

        {title}

      </h2>

    </div>
  );
}

/* =========================================================
   OVERVIEW CARD
========================================================= */

function OverviewCard({
  icon: Icon,
  title,
  value,
}) {

  return (

    <Card className="
      bg-zinc-950
      border-zinc-800
    ">

      <CardContent className="
        p-6
      ">

        <div className="
          flex items-center
          justify-between
          mb-5
        ">

          <div className="
            w-14 h-14
            rounded-2xl
            bg-violet-500/20
            text-violet-300
            flex items-center
            justify-center
          ">

            <Icon
              size={24}
            />

          </div>

        </div>

        <div className="
          text-xl
          font-bold
          text-white
          break-words
        ">

          {value || "N/A"}

        </div>

        <p className="
          text-zinc-400
          mt-2
        ">

          {title}

        </p>

      </CardContent>

    </Card>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="
      flex items-start
      gap-4
    ">

      <div className="
        w-12 h-12
        rounded-xl
        bg-violet-500/20
        text-violet-300
        flex items-center
        justify-center
      ">

        <Icon
          size={20}
        />

      </div>

      <div className="
        flex-1
      ">

        <p className="
          text-zinc-400
          text-sm
        ">

          {label}

        </p>

        <h4 className="
          text-white
          text-lg
          font-semibold
          mt-1
          break-words
        ">

          {value || "N/A"}

        </h4>

      </div>

    </div>
  );
}

/* =========================================================
   TIMELINE
========================================================= */

function TimelineItem({
  title,
  status,
}) {

  return (

    <div className="
      flex items-center
      gap-4
    ">

      <div className={`
        w-5 h-5
        rounded-full
        ${status === "completed"
          ? "bg-green-500"
          : "bg-yellow-500"
        }
      `} />

      <div>

        <h4 className="
          text-white
          font-semibold
        ">

          {title}

        </h4>

        <p className="
          text-zinc-400
          text-sm
        ">

          {status}

        </p>

      </div>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  label,
  color = "violet",
}) {

  const colors = {

    yellow:
      "bg-yellow-500/20 text-yellow-300",

    green:
      "bg-green-500/20 text-green-300",

    red:
      "bg-red-500/20 text-red-300",

    violet:
      "bg-violet-500/20 text-violet-300",

    blue:
      "bg-blue-500/20 text-blue-300",
  };

  return (

    <div className={`
      px-4 py-2
      rounded-full
      text-sm
      font-semibold
      capitalize
      ${colors[color]}
    `}>

      {label}

    </div>
  );
}