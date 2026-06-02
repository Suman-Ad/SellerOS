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

  CheckCircle2,

  Clock3,

  Eye,

  FileCheck,

  Filter,

  ShieldAlert,

  ShieldCheck,

  User,

  XCircle,

} from "lucide-react";

import {

  collection,

  doc,

  getDocs,

  orderBy,

  query,

  serverTimestamp,

  updateDoc,

  where,

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

import {
  useNavigate,
} from "react-router-dom";

import {

  GOVERNANCE_STATUS,

  REKYC_STATUS,

  ONBOARDING_STEPS,

  USER_TYPES,

  COMPLIANCE_STATUS,

} from "@/constants/userLifecycle";

import { incrementStaff } from "@/utils/subscription/SubscriptionUsageTracker";

/* =========================================================
   COMPONENT
========================================================= */

export default function SellerGovernanceCenter() {

  const navigate =
    useNavigate();

  const {

    user,

    userData,

    isSuperAdmin,

    isAdmin,

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

  const hasGovernanceAccess =

    isSuperAdmin ||

    (
      isAdmin &&

      userData?.authStatus
        ?.emailVerified === true
    );

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

          where(
            "userType",
            "==",
            USER_TYPES.SELLER
          )
        );

        const snapshot =
          await getDocs(q);

        const data =
          snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a, b) => {

              const aTime =
                a?.createdAt?.seconds || 0;

              const bTime =
                b?.createdAt?.seconds || 0;

              return bTime - aTime;
            });

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
            ${item.fullName || ""}
            ${item.email || ""}
            ${item?.organization?.organizationName || ""}
          `
            .toLowerCase();

          const matchesSearch =
            searchValue.includes(
              search.toLowerCase()
            );

          let matchesFilter =
            true;

          switch (activeFilter) {

            case "pending":

              matchesFilter =
                item?.governance?.sellerStatus ===
                GOVERNANCE_STATUS.PENDING_REVIEW;

              break;

            case "approved":

              matchesFilter =
                item?.governance?.sellerStatus ===
                GOVERNANCE_STATUS.APPROVED;

              break;

            case "rejected":

              matchesFilter =
                item?.governance?.sellerStatus ===
                GOVERNANCE_STATUS.REJECTED;

              break;

            case "suspended":

              matchesFilter =
                item?.governance?.sellerStatus ===
                GOVERNANCE_STATUS.SUSPENDED;

              break;

            case "flagged":

              matchesFilter =
                item?.governance?.flagged === true;

              break;

            case "rekyc":

              matchesFilter =
                item?.reKyc?.required === true;

              break;

            default:

              matchesFilter = true;
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

      governance = null,

      reKyc = null,

      onboarding = null,

      compliance = null,

      activityType,

      activityTitle,

      activityDescription,
    }) => {

      try {

        const userRef = doc(
          db,
          "users",
          seller.id
        );

        const payload = {

          updatedAt:
            serverTimestamp(),
        };

        if (governance) {

          payload.governance =
            governance;
        }

        if (reKyc) {

          payload.reKyc =
            reKyc;
        }

        if (onboarding) {

          payload.onboarding =
            onboarding;
        }

        if (compliance) {

          payload.complianceStatus =
            compliance;
        }

        await updateDoc(
          userRef,
          payload
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
              seller.id,

            targetEmail:
              seller.email,
          },
        });

        toast.success(
          activityTitle
        );

        await fetchSellers();

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
          u?.governance?.sellerStatus ===
          GOVERNANCE_STATUS.PENDING_REVIEW
      ).length,

    approved:
      sellers.filter(
        (u) =>
          u?.governance?.sellerStatus ===
          GOVERNANCE_STATUS.APPROVED
      ).length,

    rejected:
      sellers.filter(
        (u) =>
          u?.governance?.sellerStatus ===
          GOVERNANCE_STATUS.REJECTED
      ).length,

    suspended:
      sellers.filter(
        (u) =>
          u?.governance?.sellerStatus ===
          GOVERNANCE_STATUS.SUSPENDED
      ).length,

    flagged:
      sellers.filter(
        (u) =>
          u?.governance?.flagged === true
      ).length,

    rekyc:
      sellers.filter(
        (u) =>
          u?.reKyc?.required === true
      ).length,
  };

  /* =====================================================
     APPROVAL GUARD
  ===================================================== */

  const canApproveSeller =
    (seller) => {

      const compliance =
        seller?.complianceStatus || {};

      return (

        compliance?.gst?.status ===
        COMPLIANCE_STATUS.APPROVED &&

        compliance?.pan?.status ===
        COMPLIANCE_STATUS.APPROVED
      );
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

      {/* STATS */}
      <div className="
        grid md:grid-cols-6
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
          title="Flags"
          value={stats.flagged}
        />

        <StatCard
          icon={ShieldCheck}
          title="Re-KYC"
          value={stats.rekyc}
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
          "rekyc",
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
                key={seller.id}
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
                            mt-1
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
                                seller?.governance?.sellerStatus ||
                                GOVERNANCE_STATUS.PENDING_REVIEW
                              }
                              color="yellow"
                            />

                            <StatusBadge
                              label={
                                seller?.organization?.organizationRole ||
                                "viewer"
                              }
                              color="violet"
                            />

                            {seller?.onboarding
                              ?.complianceSubmitted && (

                                <StatusBadge
                                  label="Compliance Submitted"
                                  color="green"
                                />
                              )}

                            {seller?.reKyc?.required && (

                              <StatusBadge
                                label="Re-KYC Required"
                                color="blue"
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
                          onClick={() =>
                            navigate(
                              `/admin/seller/${seller.id}`
                            )
                          }
                        >

                          <Eye
                            size={18}
                          />

                          Review

                        </Button>

                        {/* APPROVE */}
                        {/* <Button
                          className="
                            bg-green-600
                            hover:bg-green-700
                          "
                          onClick={async () => {

                            if (
                              !canApproveSeller(
                                seller
                              )
                            ) {

                              toast.error(
                                "Compliance verification incomplete"
                              );

                              return;
                            }

                            await updateSellerStatus({

                              seller,

                              governance: {

                                ...seller.governance,

                                sellerStatus:
                                  GOVERNANCE_STATUS.APPROVED,

                                approvedAt:
                                  serverTimestamp(),

                                approvedBy:
                                  user.uid,
                              },

                              reKyc: {

                                ...seller.reKyc,

                                required:
                                  false,

                                status:
                                  REKYC_STATUS.APPROVED,

                                completed:
                                  true,

                                completedAt:
                                  serverTimestamp(),
                              },

                              onboarding: {

                                ...(seller.onboarding || {}),

                                onboardingCompleted:
                                  true,

                                currentStep:
                                  ONBOARDING_STEPS.COMPLETED,
                              },

                              activityType:
                                "seller_approved",

                              activityTitle:
                                "Seller Approved",

                              activityDescription:
                                `${seller.fullName} approved`,
                            });
                          }}
                        >

                          <CheckCircle2
                            size={18}
                          />

                          Approve

                        </Button> */}

                        <Button
                          className="
    bg-green-600
    hover:bg-green-700
  "
                          onClick={() =>
                            setSelectedSeller(
                              seller
                            )
                          }
                        >

                          <CheckCircle2
                            size={18}
                          />

                          Review & Approve

                        </Button>

                        {/* REJECT */}
                        <Button
                          className="
                            bg-red-600
                            hover:bg-red-700
                          "
                          onClick={() =>
                            updateSellerStatus({

                              seller,

                              governance: {

                                ...seller.governance,

                                sellerStatus:
                                  GOVERNANCE_STATUS.REJECTED,

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

                        {/* SUSPEND */}
                        <Button
                          className="
                            bg-yellow-600
                            hover:bg-yellow-700
                          "
                          onClick={() =>
                            updateSellerStatus({

                              seller,

                              governance: {

                                ...seller.governance,

                                sellerStatus:
                                  GOVERNANCE_STATUS.SUSPENDED,

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

                        {/* RE-KYC */}
                        <Button
                          className="
                            bg-blue-600
                            hover:bg-blue-700
                          "
                          onClick={() =>
                            updateSellerStatus({

                              seller,

                              reKyc: {

                                ...seller.reKyc,

                                required:
                                  true,

                                status:
                                  REKYC_STATUS.REQUESTED,

                                requestedAt:
                                  serverTimestamp(),

                                requestedBy:
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
          user={user}
          updateSellerStatus={
            updateSellerStatus
          }
          onUpdateSeller={
            setSelectedSeller
          }
          canApproveSeller={
            canApproveSeller
          }
          onRefresh={
            fetchSellers
          }
          onClose={() =>
            setSelectedSeller(null)
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

  user,

  updateSellerStatus,

  onUpdateSeller,

  canApproveSeller,

  onRefresh,

  onClose,
}) {

  /* =========================================
     APPROVE COMPLIANCE
  ========================================= */

  const approveComplianceDocument =
    async (
      seller,
      key
    ) => {

      try {

        const compliance = {
          ...seller.complianceStatus,
        };

        compliance[key] = {

          ...compliance[key],

          status:
            COMPLIANCE_STATUS.APPROVED,

          verifiedAt:
            serverTimestamp(),

          verifiedBy:
            user.uid,
        };

        await updateSellerStatus({

          seller,


          compliance,

          activityType:
            "compliance_approved",

          activityTitle:
            "Compliance Approved",

          activityDescription:
            `${key} approved for ${seller.fullName}`,
        });

        const updatedSeller = {

          ...seller,

          complianceStatus:
            compliance,
        };

        onUpdateSeller(
          updatedSeller
        );

        await onRefresh();

        toast.success(
          `${key.toUpperCase()} approved`
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Compliance approval failed"
        );
      }
    };

  /* =========================================
     REJECT COMPLIANCE
  ========================================= */

  const rejectComplianceDocument =
    async (
      seller,
      key
    ) => {

      try {

        const compliance = {
          ...seller.complianceStatus,
        };

        compliance[key] = {

          ...compliance[key],

          status:
            COMPLIANCE_STATUS.REJECTED,

          rejectedAt:
            serverTimestamp(),

          rejectedBy:
            user.uid,
        };

        await updateSellerStatus({

          seller,


          compliance,

          governance: {

            ...seller.governance,

            sellerStatus:
              GOVERNANCE_STATUS.REJECTED,
          },

          activityType:
            "compliance_rejected",

          activityTitle:
            "Compliance Rejected",

          activityDescription:
            `${key} rejected for ${seller.fullName}`,
        });

        const updatedSeller = {

          ...seller,

          complianceStatus:
            compliance,
        };

        onUpdateSeller(
          updatedSeller
        );

        await onRefresh();

        toast.success(
          `${key.toUpperCase()} rejected`
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Compliance rejection failed"
        );
      }
    };

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
        max-w-6xl
        rounded-3xl
        border border-zinc-800
        bg-zinc-950
        p-8
        overflow-y-auto
        max-h-[90vh]
      ">

        {/* HEADER */}

        <div className="
          flex items-center
          justify-between
          mb-10
        ">

          <div>

            <h2 className="
              text-3xl
              font-black
              text-white
            ">

              Seller Compliance Review

            </h2>

            <p className="
              text-zinc-400
              mt-2
            ">

              Enterprise governance verification workflow

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
          mb-10
        ">

          <ReviewField
            label="Seller"
            value={seller.fullName}
          />

          <ReviewField
            label="Email"
            value={seller.email}
          />

          <ReviewField
            label="Status"
            value={
              seller?.governance
                ?.sellerStatus
            }
          />

          <ReviewField
            label="Organization Role"
            value={
              seller?.organization
                ?.organizationRole
            }
          />

        </div>

        {/* DOCUMENTS */}

        <div>

          <h3 className="
            text-2xl
            font-bold
            text-white
            mb-8
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
                title: "GST",
              },

              {
                key: "pan",
                title: "PAN",
              },

              {
                key: "governmentId",
                title: "Government ID",
              },

              {
                key: "bank",
                title: "Bank",
              },
            ].map((item) => {

              const document =
                seller?.complianceDocuments?.[
                item.key
                ];

              const documentStatus =
                seller?.complianceStatus?.[
                item.key
                ];

              const isPending =

                documentStatus?.status ===
                COMPLIANCE_STATUS.UPLOADED ||

                documentStatus?.status ===
                COMPLIANCE_STATUS.PENDING;

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
                    mb-5
                  ">

                    <h4 className="
                      text-xl
                      font-bold
                      text-white
                    ">

                      {item.title}

                    </h4>

                    <StatusBadge
                      label={
                        documentStatus?.status ||
                        "missing"
                      }
                      color={
                        documentStatus?.status ===
                          COMPLIANCE_STATUS.APPROVED
                          ? "green"
                          : documentStatus?.status ===
                            COMPLIANCE_STATUS.REJECTED
                            ? "red"
                            : "yellow"
                      }
                    />

                  </div>

                  {!document && (

                    <div className="
                      text-red-400
                    ">

                      Document missing

                    </div>
                  )}

                  {document?.url && (

                    <iframe
                      src={document.url}
                      title={item.title}
                      className="
                        w-full
                        h-72
                        rounded-xl
                        border border-zinc-800
                        bg-black
                      "
                    />
                  )}

                  {isPending && (

                    <div className="
                      mt-4
                      rounded-xl
                      border border-yellow-500/20
                      bg-yellow-500/10
                      p-3
                      text-yellow-300
                      text-sm
                      font-medium
                    ">

                      Pending compliance verification

                    </div>
                  )}

                  <div className="
                    flex gap-3
                    mt-5
                  ">

                    <Button
                      size="sm"
                      className="
                        bg-green-600
                        hover:bg-green-700
                      "
                      disabled={
                        !document
                      }
                      onClick={() =>
                        approveComplianceDocument(
                          seller,
                          item.key
                        )
                      }
                    >

                      Approve

                    </Button>

                    <Button
                      size="sm"
                      className="
                        bg-red-600
                        hover:bg-red-700
                      "
                      disabled={
                        !document
                      }
                      onClick={() =>
                        rejectComplianceDocument(
                          seller,
                          item.key
                        )
                      }
                    >

                      Reject

                    </Button>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* FINAL APPROVAL */}

        <div className="
          mt-10
          border-t border-zinc-800
          pt-8
        ">

          <Button
            className="
              w-full
              h-14
              text-lg
              font-bold
              bg-green-600
              hover:bg-green-700
            "
            disabled={
              !canApproveSeller(
                seller
              )
            }
            onClick={async () => {

              await updateSellerStatus({

                seller,

                governance: {

                  ...seller.governance,

                  sellerStatus:
                    GOVERNANCE_STATUS.APPROVED,

                  approvedAt:
                    serverTimestamp(),

                  approvedBy:
                    user.uid,
                },

                reKyc: {

                  ...seller.reKyc,

                  required: false,

                  status:
                    REKYC_STATUS.APPROVED,

                  completed: true,

                  completedAt:
                    serverTimestamp(),
                },

                onboarding: {

                  ...seller.onboarding,

                  onboardingCompleted:
                    true,

                  currentStep:
                    ONBOARDING_STEPS.COMPLETED,
                },

                activityType:
                  "seller_approved",

                activityTitle:
                  "Seller Approved",

                activityDescription:
                  `${seller.fullName} approved`,
              });

              await incrementStaff(
                seller.id,
                1
              );

              await onRefresh();

              toast.success(
                "Seller approved successfully"
              );

              onClose();
            }}
          >

            Final Seller Approval

          </Button>

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

  const formattedLabel =
    label
      ?.replace(/_/g, " ")
      ?.replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      );

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
      ${colors[color]}
    `}>

      {formattedLabel}

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