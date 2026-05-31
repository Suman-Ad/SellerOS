import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {

  AlertTriangle,

  Building2,

  CheckCircle2,

  Loader2,

  ShieldCheck,

  Users,

  XCircle,

} from "lucide-react";

import {
  toast,
} from "sonner";

import {

  acceptInvitation,

  getInvitationByToken,

} from "@/services/organization/inviteService";

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


import { incrementStaff } from "@/utils/subscription/SubscriptionUsageTracker";

/* =========================================================
   COMPONENT
========================================================= */

export default function AcceptInvitation() {

  const navigate =
    useNavigate();

  const { token } =
    useParams();

  const {

    user,

    userData,

    refreshUserData,
  } = useAuth();

  /* =====================================================
     STATE
  ===================================================== */

  const [loading,
    setLoading] =
    useState(true);

  const [accepting,
    setAccepting] =
    useState(false);

  const [invitation,
    setInvitation] =
    useState(null);

  const [error,
    setError] =
    useState(null);

  /* =====================================================
     LOAD INVITATION
  ===================================================== */

  useEffect(() => {

    const loadInvitation =
      async () => {

        try {

          setLoading(true);

          if (!token) {

            setError(
              "Missing invitation token"
            );

            return;
          }

          const result =
            await getInvitationByToken(
              token
            );

          if (!result) {

            setError(
              "Invitation not found"
            );

            return;
          }

          /* =========================================
             STATUS VALIDATION
          ========================================= */

          if (
            result.status !==
            "pending"
          ) {

            setError(
              "Invitation already used"
            );

            return;
          }

          /* =========================================
             EXPIRATION VALIDATION
          ========================================= */

          const now =
            new Date();

          const expiresAt =
            result.expiresAt
              ?.toDate?.() ||
            result.expiresAt;

          if (
            expiresAt &&
            now > expiresAt
          ) {

            setError(
              "Invitation expired"
            );

            return;
          }

          setInvitation(
            result
          );

        } catch (error) {

          console.error(error);

          setError(
            "Failed to validate invitation"
          );

        } finally {

          setLoading(false);
        }
      };

    loadInvitation();

  }, [token]);

  /* =====================================================
     ACCEPT INVITATION
  ===================================================== */

  const handleAccept =
    async () => {

      try {

        setAccepting(true);

        if (!user) {

          toast.error(
            "Please login first"
          );

          navigate(
            `/login?invite=${token}`
          );

          return;
        }

        if (!userData) {

          toast.error(
            "Profile not ready"
          );

          return;
        }

        await acceptInvitation({

          invitationId:
            invitation.id,

          uid:
            user.uid,

          fullName:
            userData.fullName,

          email:
            user.email,
        });

        await incrementStaff(
          user.uid,
          1
        )

        await refreshUserData?.();

        toast.success(
          "Organization invitation accepted"
        );

        navigate(
          "/seller"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          error.message ||
          "Failed to accept invitation"
        );

      } finally {

        setAccepting(false);
      }
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-black
        text-white
        flex items-center
        justify-center
      ">

        <div className="
          flex flex-col
          items-center
          gap-5
        ">

          <Loader2
            className="
              animate-spin
              text-violet-400
            "
            size={48}
          />

          <p className="
            text-zinc-400
          ">

            Validating invitation...

          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {

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
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            w-full
            max-w-2xl
          "
        >

          <Card className="
            bg-zinc-950
            border-red-500/20
          ">

            <CardContent className="
              p-10
              text-center
            ">

              <div className="
                w-28 h-28
                rounded-3xl
                bg-red-500/10
                text-red-400
                flex items-center
                justify-center
                mx-auto
                mb-8
              ">

                <XCircle
                  size={54}
                />

              </div>

              <h1 className="
                text-4xl
                font-black
                text-red-400
                mb-5
              ">

                Invalid Invitation

              </h1>

              <p className="
                text-zinc-400
                text-lg
                leading-relaxed
                mb-10
              ">

                {error}

              </p>

              <Link to="/">

                <Button
                  size="lg"
                  className="
                    h-14
                    px-8
                    rounded-2xl
                  "
                >

                  Back to Homepage

                </Button>

              </Link>

            </CardContent>

          </Card>

        </motion.div>

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

        <Card className="
          bg-zinc-950
          border-zinc-800
        ">

          <CardContent className="
            p-10
          ">

            {/* ICON */}
            <div className="
              w-28 h-28
              rounded-3xl
              bg-violet-500/10
              text-violet-400
              flex items-center
              justify-center
              mx-auto
              mb-8
            ">

              <Users
                size={54}
              />

            </div>

            {/* TITLE */}
            <div className="
              text-center
              mb-10
            ">

              <h1 className="
                text-5xl
                font-black
                mb-5
              ">

                Organization Invitation

              </h1>

              <p className="
                text-zinc-400
                text-lg
                leading-relaxed
                max-w-2xl
                mx-auto
              ">

                You have been invited to join an
                enterprise workspace in SellerOS.

              </p>

            </div>

            {/* ORGANIZATION */}
            <div className="
              rounded-3xl
              border border-zinc-800
              bg-zinc-900
              p-8
              mb-10
            ">

              <div className="
                flex items-center
                gap-5
              ">

                <div className="
                  w-20 h-20
                  rounded-3xl
                  bg-violet-500/20
                  text-violet-300
                  flex items-center
                  justify-center
                ">

                  <Building2
                    size={38}
                  />

                </div>

                <div>

                  <h2 className="
                    text-3xl
                    font-black
                  ">

                    {
                      invitation.organizationName
                    }

                  </h2>

                  <p className="
                    text-zinc-400
                    mt-2
                  ">

                    Invited by:
                    {" "}
                    {
                      invitation.invitedByName
                    }

                  </p>

                </div>

              </div>

            </div>

            {/* ROLE */}
            <div className="
              grid md:grid-cols-2
              gap-6
              mb-10
            ">

              <InfoCard
                icon={ShieldCheck}
                title="Organization Role"
                value={
                  invitation.organizationRole
                }
              />

              <InfoCard
                icon={AlertTriangle}
                title="Invitation Status"
                value={
                  invitation.status
                }
              />

            </div>

            {/* USER STATE */}
            {!user ? (

              <div className="
                rounded-3xl
                border border-yellow-500/20
                bg-yellow-500/10
                p-8
                mb-10
              ">

                <h3 className="
                  text-2xl
                  font-bold
                  text-yellow-300
                  mb-4
                ">

                  Authentication Required

                </h3>

                <p className="
                  text-zinc-300
                  leading-relaxed
                  mb-6
                ">

                  You must login or create
                  an account before accepting
                  this organization invitation.

                </p>

                <div className="
                  flex flex-wrap
                  gap-4
                ">

                  <Link
                    to={`/login?invite=${token}`}
                  >

                    <Button>

                      Login

                    </Button>

                  </Link>

                  <Link
                    to={`/register?invite=${token}`}
                  >

                    <Button
                      variant="outline"
                      className="
                        border-zinc-700
                      "
                    >

                      Create Account

                    </Button>

                  </Link>

                </div>

              </div>

            ) : (

              <div className="
                rounded-3xl
                border border-green-500/20
                bg-green-500/10
                p-8
                mb-10
              ">

                <div className="
                  flex items-center
                  gap-4
                  mb-5
                ">

                  <CheckCircle2
                    className="
                      text-green-400
                    "
                    size={32}
                  />

                  <h3 className="
                    text-2xl
                    font-bold
                    text-green-300
                  ">

                    Ready to Join Workspace

                  </h3>

                </div>

                <p className="
                  text-zinc-300
                  leading-relaxed
                ">

                  Signed in as:
                  {" "}
                  <span className="
                    font-bold
                  ">

                    {user.email}

                  </span>

                </p>

              </div>
            )}

            {/* ACTIONS */}
            <div className="
              flex flex-col
              md:flex-row
              items-center
              justify-center
              gap-5
            ">

              {user && (

                <Button
                  size="lg"
                  onClick={
                    handleAccept
                  }
                  disabled={
                    accepting
                  }
                  className="
                    h-14
                    px-8
                    rounded-2xl
                    bg-violet-600
                    hover:bg-violet-700
                  "
                >

                  {accepting
                    ? "Joining Workspace..."
                    : "Accept Invitation"}

                </Button>
              )}

              <Link to="/">

                <Button
                  size="lg"
                  variant="outline"
                  className="
                    h-14
                    px-8
                    rounded-2xl
                    border-zinc-700
                  "
                >

                  Cancel

                </Button>

              </Link>

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

  icon: Icon,

  title,

  value,
}) {

  return (

    <div className="
      rounded-2xl
      border border-zinc-800
      bg-zinc-900
      p-6
    ">

      <div className="
        flex items-center
        gap-4
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

        <div>

          <p className="
            text-zinc-400
            text-sm
          ">

            {title}

          </p>

          <h3 className="
            text-xl
            font-bold
            text-white
            mt-1
          ">

            {value}

          </h3>

        </div>

      </div>

    </div>
  );
}