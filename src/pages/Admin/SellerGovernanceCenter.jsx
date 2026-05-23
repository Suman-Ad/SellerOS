import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {

  AlertTriangle,

  BadgeCheck,

  Ban,

  Building2,

  CheckCircle2,

  Clock3,

  Eye,

  FileCheck,

  Filter,

  ShieldAlert,

  User,

  XCircle,

  ShieldCheck,

} from "lucide-react";

import {

  collection,

  doc,

  getDocs,

  orderBy,

  query,

  serverTimestamp,

  updateDoc,

} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

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

import {
  Input,
} from "@/components/ui/input";

import {
  toast,
} from "sonner";

import logActivity
  from "@/utils/activity/logActivity";

import { useNavigate } from "react-router-dom";

/* =========================================================
   COMPONENT
========================================================= */

export default function SellerGovernanceCenter() {

  const {
    user,
  } = useAuth();

  /* =====================================================
     STATE
  ===================================================== */

  const [loading,
    setLoading] =
    useState(true);

  const [sellers,
    setSellers] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [selectedSeller,
    setSelectedSeller] =
    useState(null);

  const [activeFilter,
    setActiveFilter] =
    useState("pending");

  const navigate = useNavigate();
  /* =====================================================
     LOAD SELLERS
  ===================================================== */

  const fetchSellers =
    async () => {

      try {

        setLoading(true);

        const q = query(
          collection(
            db,
            "users"
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        );

        const snapshot =
          await getDocs(q);

        const data =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setSellers(data);

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load governance queue"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     INIT
  ===================================================== */

  useEffect(() => {

    fetchSellers();

  }, []);

  /* =====================================================
     FILTERED SELLERS
  ===================================================== */

  const filteredSellers =
    useMemo(() => {

      return sellers.filter(
        (item) => {

          const searchValue = `
            ${item.fullName}
            ${item.email}
            ${item.businessName}
          `
            .toLowerCase();

          const matchesSearch =
            searchValue.includes(
              search.toLowerCase()
            );

          let matchesFilter =
            true;

          switch (
          activeFilter
          ) {

            case "pending":

              matchesFilter =
                item.approvalStatus ===
                "pending";

              break;

            case "approved":

              matchesFilter =
                item.isApproved ===
                true;

              break;

            case "rejected":

              matchesFilter =
                item.approvalStatus ===
                "rejected";

              break;

            case "suspended":

              matchesFilter =
                item.status ===
                "suspended";

              break;

            case "flagged":

              matchesFilter =
                item.status ===
                "flagged";

              break;

            default:

              matchesFilter =
                true;
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    }, [
      sellers,
      search,
      activeFilter,
    ]);

  /* =====================================================
     GOVERNANCE ACTION
  ===================================================== */

  const updateSellerStatus =
    async ({
      seller,
      updates,
      activityType,
      activityTitle,
      activityDescription,
    }) => {

      try {

        const userRef = doc(
          db,
          "users",
          seller.uid
        );

        await updateDoc(
          userRef,
          {

            ...updates,

            updatedAt:
              serverTimestamp(),
          }
        );

        await logActivity({

          uid:
            user.uid,

          type:
            activityType,

          title:
            activityTitle,

          description:
            activityDescription,

          meta: {

            targetUserId:
              seller.uid,

            targetEmail:
              seller.email,
          },
        });

        toast.success(
          activityTitle
        );

        fetchSellers();

      } catch (error) {

        console.error(error);

        toast.error(
          "Governance action failed"
        );
      }
    };

  /* =====================================================
     STATS
  ===================================================== */

  const stats = {

    pending:
      sellers.filter(
        (u) =>
          u.approvalStatus ===
          "pending"
      ).length,

    approved:
      sellers.filter(
        (u) =>
          u.isApproved ===
          true
      ).length,

    rejected:
      sellers.filter(
        (u) =>
          u.approvalStatus ===
          "rejected"
      ).length,

    suspended:
      sellers.filter(
        (u) =>
          u.status ===
          "suspended"
      ).length,

    flagged:
      sellers.filter(
        (u) =>
          u.status ===
          "flagged"
      ).length,
  };

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
      <div className="
        flex flex-col
        lg:flex-row
        lg:items-center
        justify-between
        gap-6
        mb-10
      ">

        <div>

          <h1 className="
            text-4xl
            font-black
          ">

            Seller Governance Center

          </h1>

          <p className="
            text-zinc-400
            mt-3
          ">

            Enterprise seller onboarding, compliance & risk governance

          </p>

        </div>

        <div className="
          flex items-center
          gap-3
        ">

          <Button
            variant="outline"
            className="
              border-zinc-700
            "
          >

            <Filter
              size={18}
            />

            Governance Filters

          </Button>

        </div>

      </div>

      {/* STATS */}
      <div className="
        grid md:grid-cols-5
        gap-5
        mb-10
      ">

        <StatCard
          icon={Clock3}
          title="Pending"
          value={stats.pending}
        />

        <StatCard
          icon={BadgeCheck}
          title="Approved"
          value={stats.approved}
        />

        <StatCard
          icon={XCircle}
          title="Rejected"
          value={stats.rejected}
        />

        <StatCard
          icon={Ban}
          title="Suspended"
          value={stats.suspended}
        />

        <StatCard
          icon={ShieldAlert}
          title="Risk Flags"
          value={stats.flagged}
        />

      </div>

      {/* FILTERS */}
      <div className="
        flex flex-wrap
        gap-3
        mb-6
      ">

        {[
          "pending",
          "approved",
          "rejected",
          "suspended",
          "flagged",
          "all",
        ].map((filter) => (

          <Button
            key={filter}
            variant={
              activeFilter ===
                filter
                ? "default"
                : "outline"
            }
            onClick={() =>
              setActiveFilter(
                filter
              )
            }
          >

            {filter}

          </Button>
        ))}

      </div>

      {/* SEARCH */}
      <div className="
        mb-8
      ">

        <Input
          placeholder="Search sellers..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
            h-14
            bg-zinc-900
            border-zinc-800
            text-white
          "
        />

      </div>

      {/* QUEUE */}
      {loading ? (

        <div className="
          text-zinc-400
        ">

          Loading governance queue...

        </div>

      ) : (

        <div className="
          grid gap-5
        ">

          {filteredSellers.map(
            (seller) => (

              <motion.div
                key={seller.uid}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >

                <Card className="
                  bg-zinc-950
                  border-zinc-800
                ">

                  <CardContent className="
                    p-6
                  ">

                    <div className="
                      flex flex-col
                      xl:flex-row
                      xl:items-center
                      justify-between
                      gap-6
                    ">

                      {/* LEFT */}
                      <div className="
                        flex items-start
                        gap-5
                      ">

                        <div className="
                          w-16 h-16
                          rounded-2xl
                          bg-violet-500/20
                          text-violet-300
                          flex items-center
                          justify-center
                        ">

                          <User
                            size={28}
                          />

                        </div>

                        <div>

                          <h2 className="
                            text-2xl
                            font-bold
                          ">

                            {seller.fullName}

                          </h2>

                          <p className="
                            text-zinc-400
                            mt-1 whitespace-nowrap
                            flex items-center
                            gap-2
                          ">
                            <ShieldCheck
                              size={18}
                            />
                            {seller.email}

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

                            {seller.onboarding
                              ?.complianceSubmitted && (

                                <StatusBadge
                                  label="Compliance Submitted"
                                  color="green"
                                />
                              )}

                          </div>

                        </div>

                      </div>

                      {/* ACTIONS */}
                      <div className="
                        flex flex-wrap
                        gap-3
                      ">

                        <Button
                          variant="outline"

                          className="
                            border-zinc-700
                          "
                          onClick={() => {
                            // setSelectedSeller(
                            //   seller
                            // );
                            navigate(
                              `/admin/seller/${seller.uid}`
                            )
                          }
                          }
                        >

                          <Eye
                            size={18}
                          />

                          Review

                        </Button>

                        <Button
                          className="
                            bg-green-600
                            hover:bg-green-700
                          "
                          onClick={() =>
                            updateSellerStatus({

                              seller,

                              updates: {

                                isApproved:
                                  true,

                                approvalStatus:
                                  "approved",

                                status:
                                  "active",

                                approvedAt:
                                  serverTimestamp(),

                                approvedBy:
                                  user.uid,
                              },

                              activityType:
                                "seller_approved",

                              activityTitle:
                                "Seller Approved",

                              activityDescription:
                                `${seller.fullName} approved`,
                            })
                          }
                        >

                          <CheckCircle2
                            size={18}
                          />

                          Approve

                        </Button>

                        <Button
                          className="
                            bg-red-600
                            hover:bg-red-700
                          "
                          onClick={() =>
                            updateSellerStatus({

                              seller,

                              updates: {

                                approvalStatus:
                                  "rejected",

                                status:
                                  "rejected",

                                rejectedAt:
                                  serverTimestamp(),

                                rejectedBy:
                                  user.uid,
                              },

                              activityType:
                                "seller_rejected",

                              activityTitle:
                                "Seller Rejected",

                              activityDescription:
                                `${seller.fullName} rejected`,
                            })
                          }
                        >

                          <XCircle
                            size={18}
                          />

                          Reject

                        </Button>

                        <Button
                          className="
                            bg-yellow-600
                            hover:bg-yellow-700
                          "
                          onClick={() =>
                            updateSellerStatus({

                              seller,

                              updates: {

                                status:
                                  "suspended",

                                suspendedAt:
                                  serverTimestamp(),

                                suspendedBy:
                                  user.uid,
                              },

                              activityType:
                                "seller_suspended",

                              activityTitle:
                                "Seller Suspended",

                              activityDescription:
                                `${seller.fullName} suspended`,
                            })
                          }
                        >

                          <Ban
                            size={18}
                          />

                          Suspend

                        </Button>

                        <Button
                          className="
    bg-blue-600
    hover:bg-blue-700
  "
                          onClick={() =>
                            updateSellerStatus({

                              seller,

                              updates: {

                                isApproved: false,

                                approvalStatus:
                                  "pending",

                                status:
                                  "rekyc_required",

                                onboarding: {

                                  ...seller.onboarding,

                                  complianceSubmitted:
                                    false,
                                },

                                reKycRequestedAt:
                                  serverTimestamp(),

                                reKycRequestedBy:
                                  user.uid,
                              },

                              activityType:
                                "seller_rekyc_requested",

                              activityTitle:
                                "Re-KYC Requested",

                              activityDescription:
                                `${seller.fullName} marked for re-KYC verification`,
                            })
                          }
                        >

                          Re-KYC

                        </Button>

                      </div>

                    </div>

                  </CardContent>

                </Card>

              </motion.div>
            )
          )}

        </div>
      )}

      {/* REVIEW MODAL */}
      {selectedSeller && (

        <SellerReviewModal
          seller={selectedSeller}
          onClose={() =>
            setSelectedSeller(
              null
            )
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   REVIEW MODAL
========================================================= */

function SellerReviewModal({
  seller,
  onClose,
}) {

  return (

    <div className="
      fixed inset-0
      z-50
      bg-black/80
      backdrop-blur-sm
      flex items-center
      justify-center
      p-6
    ">

      <div className="
        w-full
        max-w-5xl
        rounded-3xl
        border border-zinc-800
        bg-zinc-950
        p-8
        overflow-y-auto
        max-h-[90vh]
      ">

        <div className="
          flex items-center
          justify-between
          mb-8
        ">

          <div>

            <h2 className="
              text-3xl
              font-black
              text-white
            ">

              Seller Review

            </h2>

            <p className="
              text-zinc-400
              mt-2
            ">

              Enterprise compliance & onboarding verification

            </p>

          </div>

          <Button
            variant="outline"
            onClick={onClose}
          >

            Close

          </Button>

        </div>

        {/* PROFILE */}
        <div className="
          grid md:grid-cols-2
          gap-6
          mb-8
        ">

          <ReviewField
            label="Full Name"
            value={seller.fullName}
          />

          <ReviewField
            label="Email"
            value={seller.email}
          />

          <ReviewField
            label="Organization Role"
            value={
              seller.organizationRole
            }
          />

          <ReviewField
            label="Approval Status"
            value={
              seller.approvalStatus
            }
          />

        </div>

        {/* COMPLIANCE */}
        <div>

          <h3 className="
            text-2xl
            font-bold
            text-white
            mb-6
          ">

            Compliance Documents

          </h3>

          <div className="
            grid md:grid-cols-2
            gap-6
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

                    <h4 className="
                      text-lg
                      font-bold
                      text-white
                    ">

                      {item.title}

                    </h4>

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
                        mb-3
                      ">

                        Status:
                        {" "}
                        {document.status}

                      </p>

                      <a
                        href={
                          document.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="
                          text-violet-400
                          underline
                        "
                      >

                        View Document

                      </a>

                    </div>

                  ) : (

                    <div className="
                      flex items-center
                      gap-3
                      text-yellow-400
                    ">

                      <AlertTriangle
                        size={18}
                      />

                      Not Uploaded

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   REVIEW FIELD
========================================================= */

function ReviewField({
  label,
  value,
}) {

  return (

    <div className="
      rounded-2xl
      border border-zinc-800
      bg-zinc-900
      p-5
    ">

      <p className="
        text-zinc-400
        text-sm
        mb-2
      ">

        {label}

      </p>

      <h4 className="
        text-white
        text-lg
        font-semibold
      ">

        {value || "N/A"}

      </h4>

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

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
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
          text-4xl
          font-black
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