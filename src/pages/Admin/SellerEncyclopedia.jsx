import {
  useEffect,
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

  Store,

  User,

} from "lucide-react";

import {

  doc,

  getDoc,

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

  /* =====================================================
     FETCH SELLER
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
            "Failed to load seller encyclopedia"
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
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        flex items-center
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
        flex items-center
        justify-center
        text-zinc-400
      ">

        Seller not found

      </div>
    );
  }

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

      {/* HEADER */}
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

              {seller.fullName}

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
                  seller.approvalStatus ||
                  "pending"
                }
                color="yellow"
              />

              <StatusBadge
                label={
                  seller.organizationRole ||
                  "viewer"
                }
                color="violet"
              />

              {seller.isApproved && (

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

            Verified Account

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

      {/* OVERVIEW */}
      <div className="
        grid lg:grid-cols-4
        gap-5
        mb-10
      ">

        <OverviewCard
          icon={Store}
          title="Organization"
          value={
            seller.organizationName ||
            "N/A"
          }
        />

        <OverviewCard
          icon={FileCheck}
          title="Compliance"
          value={
            seller.onboarding
              ?.complianceSubmitted
              ? "Submitted"
              : "Pending"
          }
        />

        <OverviewCard
          icon={CreditCard}
          title="Subscription"
          value={
            seller.subscriptionPlan ||
            "Free"
          }
        />

        <OverviewCard
          icon={Activity}
          title="Account Status"
          value={
            seller.status ||
            "pending"
          }
        />

      </div>

      {/* PROFILE + BUSINESS */}
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

            <div className="
              flex items-center
              gap-3
              mb-6
            ">

              <User
                className="
                  text-violet-400
                "
              />

              <h2 className="
                text-2xl
                font-bold
              ">

                Identity Profile

              </h2>

            </div>

            <div className="
              grid gap-5
            ">

              <InfoRow
                icon={Mail}
                label="Email"
                value={seller.email}
              />

              <InfoRow
                icon={Phone}
                label="Phone"
                value={
                  seller.phone ||
                  "N/A"
                }
              />

              <InfoRow
                icon={CalendarDays}
                label="Joined"
                value={
                  seller.createdAt
                    ?.toDate?.()
                    ?.toLocaleDateString?.() ||
                  "N/A"
                }
              />

              <InfoRow
                icon={Building2}
                label="Organization Role"
                value={
                  seller.organizationRole
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

            <div className="
              flex items-center
              gap-3
              mb-6
            ">

              <Store
                className="
                  text-violet-400
                "
              />

              <h2 className="
                text-2xl
                font-bold
              ">

                Business Intelligence

              </h2>

            </div>

            <div className="
              grid gap-5
            ">

              <InfoRow
                icon={Building2}
                label="Organization"
                value={
                  seller.organizationName ||
                  "N/A"
                }
              />

              <InfoRow
                icon={CreditCard}
                label="GST Number"
                value={
                  seller.gstNo ||
                  "N/A"
                }
              />

              <InfoRow
                icon={FileCheck}
                label="PAN Number"
                value={
                  seller.panNo ||
                  "N/A"
                }
              />

              <InfoRow
                icon={ShieldAlert}
                label="Approval Status"
                value={
                  seller.approvalStatus
                }
              />

            </div>

          </CardContent>

        </Card>

      </div>

      {/* COMPLIANCE */}
      <Card className="
        bg-zinc-950
        border-zinc-800
        mb-10
      ">

        <CardContent className="
          p-6
        ">

          <div className="
            flex items-center
            gap-3
            mb-8
          ">

            <ShieldAlert
              className="
                text-violet-400
              "
            />

            <h2 className="
              text-2xl
              font-bold
            ">

              Compliance Intelligence

            </h2>

          </div>

          <div className="
            grid md:grid-cols-2
            xl:grid-cols-4
            gap-5
          ">

            {[
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
            ].map((item) => {

              const document =
                seller
                  ?.complianceDocuments?.[
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

                      <p className="
                        text-zinc-400
                        mb-4
                      ">

                        Status:
                        {" "}
                        {document.status}
                      </p>

                      <Button
                        asChild
                        className="
    bg-violet-600
    hover:bg-violet-700
    w-full
  "
                      >
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Document
                        </a>
                      </Button>
                      {document?.url && (
                        <iframe
                          src={document.url}
                          title={item.title}
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
            })}

          </div>

        </CardContent>

      </Card>

      {/* TIMELINE */}
      <Card className="
        bg-zinc-950
        border-zinc-800
      ">

        <CardContent className="
          p-6
        ">

          <div className="
            flex items-center
            gap-3
            mb-8
          ">

            <Activity
              className="
                text-violet-400
              "
            />

            <h2 className="
              text-2xl
              font-bold
            ">

              Seller Lifecycle Timeline

            </h2>

          </div>

          <div className="
            space-y-6
          ">

            <TimelineItem
              title="Account Created"
              status="completed"
            />

            <TimelineItem
              title="Profile Completed"
              status={
                seller.onboarding
                  ?.profileCompleted
                  ? "completed"
                  : "pending"
              }
            />

            <TimelineItem
              title="Organization Created"
              status={
                seller.organizationId
                  ? "completed"
                  : "pending"
              }
            />

            <TimelineItem
              title="Compliance Uploaded"
              status={
                seller.onboarding
                  ?.complianceSubmitted
                  ? "completed"
                  : "pending"
              }
            />

            <TimelineItem
              title="Marketplace Approval"
              status={
                seller.isApproved
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
   COMPONENTS
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
        ">

          {value}

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

      <div>

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
        ">

          {value || "N/A"}

        </h4>

      </div>

    </div>
  );
}

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
  };

  return (

    <div className={`
      px-4 py-2
      rounded-full
      text-sm
      font-semibold
      ${colors[color]}
    `}>

      {label}

    </div>
  );
}