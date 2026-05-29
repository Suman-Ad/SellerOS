import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  updateProfile,
} from "firebase/auth";

import {
  db,
  auth,
} from "@/firebase/config";

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
  User,
  Mail,
  Phone,
  ShieldCheck,
  Activity,
  CalendarClock,
  Save,
} from "lucide-react";

import {
  toast,
} from "sonner";

export default function OverviewTab({
  user,
  userData,
}) {

  // ========================================
  // STATE
  // ========================================

  const [loading,
    setLoading] =
    useState(false);

  const [formData,
    setFormData] =
    useState({

      fullName: "",

      username: "",

      phoneNumber: "",
    });

  // ========================================
  // LOAD USER
  // ========================================

  useEffect(() => {

    if (!userData) return;

    setFormData({

      fullName:
        userData?.fullName || "",

      username:
        userData?.username || "",

      phoneNumber:
        userData?.phoneNumber || "",
    });

  }, [userData]);

  // ========================================
  // CHANGE
  // ========================================

  const handleChange =
    (e) => {

      setFormData((prev) => ({

        ...prev,

        [e.target.name]:
          e.target.value,
      }));
    };

  // ========================================
  // SAVE
  // ========================================

  const handleSave =
    async () => {

      try {

        setLoading(true);

        // ========================================
        // AUTH PROFILE
        // ========================================

        await updateProfile(
          auth.currentUser,
          {
            displayName:
              formData.fullName,
          }
        );

        // ========================================
        // FIRESTORE
        // ========================================

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),

          {

            fullName:
              formData.fullName,

            username:
              formData.username,

            phoneNumber:
              formData.phoneNumber,

            "onboarding.profileCompleted":
              true,

            updatedAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Profile updated successfully"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };

  // ========================================
  // DATA
  // ========================================

  const authStatus =
    userData?.authStatus || {};

  const governance =
    userData?.governance || {};

  const analytics =
    userData?.analytics || {};

  const access =
    userData?.access || {};

  const organization =
    userData?.organization || {};

  const createdAt =
    userData?.createdAt
      ?.toDate?.();

  const lastLogin =
    userData?.security
      ?.lastLoginAt
      ?.toDate?.();

  const lastActive =
    analytics?.lastActiveAt
      ?.toDate?.();

  return (

    <div className="
      space-y-6
    ">

      {/* ========================================
         PROFILE
      ======================================== */}

      <Card className="
        bg-zinc-900
        border-zinc-800
      ">

        <CardContent className="
          p-8
        ">

          <div className="
            flex items-center
            justify-between
            mb-8
          ">

            <div>

              <h2 className="
                text-2xl
                font-bold
              ">

                Identity Profile

              </h2>

              <p className="
                text-zinc-400
                mt-2
              ">

                Manage your enterprise identity profile.

              </p>

            </div>

          </div>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          ">

            <InputField
              icon={<User size={18} />}
              name="fullName"
              placeholder="Full Name"
              value={
                formData.fullName
              }
              onChange={
                handleChange
              }
            />

            <InputField
              icon={<User size={18} />}
              name="username"
              placeholder="Username"
              value={
                formData.username
              }
              onChange={
                handleChange
              }
            />

            <InputField
              icon={<Mail size={18} />}
              value={
                userData?.email
              }
              disabled
            />

            <InputField
              icon={<Phone size={18} />}
              name="phoneNumber"
              placeholder="Phone Number"
              value={
                formData.phoneNumber
              }
              onChange={
                handleChange
              }
            />

          </div>

          <Button

            onClick={
              handleSave
            }

            disabled={
              loading
            }

            className="
              mt-8
              h-12
              px-8
              rounded-2xl
              bg-violet-600
              hover:bg-violet-700
            "
          >

            <Save
              size={16}
            />

            {
              loading
                ? "Saving..."
                : "Save Changes"
            }

          </Button>

        </CardContent>

      </Card>

      {/* ========================================
         ACCOUNT INTELLIGENCE
      ======================================== */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

        {/* AUTH */}

        <Card className="
          bg-zinc-900
          border-zinc-800
        ">

          <CardContent className="
            p-8
          ">

            <div className="
              flex items-center
              gap-3
              mb-8
            ">

              <ShieldCheck className="
                text-violet-400
              " />

              <h2 className="
                text-2xl
                font-bold
              ">

                Authentication

              </h2>

            </div>

            <div className="
              space-y-5
            ">

              <InfoRow
                label="Email Verified"
                value={
                  authStatus?.emailVerified
                    ? "Verified"
                    : "Pending"
                }
              />

              <InfoRow
                label="Phone Verified"
                value={
                  authStatus?.phoneVerified
                    ? "Verified"
                    : "Pending"
                }
              />

              <InfoRow
                label="MFA Enabled"
                value={
                  authStatus?.mfaEnabled
                    ? "Enabled"
                    : "Disabled"
                }
              />

              <InfoRow
                label="Account Locked"
                value={
                  authStatus?.accountLocked
                    ? "Yes"
                    : "No"
                }
              />

            </div>

          </CardContent>

        </Card>

        {/* GOVERNANCE */}

        <Card className="
          bg-zinc-900
          border-zinc-800
        ">

          <CardContent className="
            p-8
          ">

            <div className="
              flex items-center
              gap-3
              mb-8
            ">

              <Activity className="
                text-violet-400
              " />

              <h2 className="
                text-2xl
                font-bold
              ">

                Governance

              </h2>

            </div>

            <div className="
              space-y-5
            ">

              <InfoRow
                label="Seller Status"
                value={
                  governance?.sellerStatus
                }
              />

              <InfoRow
                label="Flagged"
                value={
                  governance?.flagged
                    ? "Yes"
                    : "No"
                }
              />

              <InfoRow
                label="Platform Role"
                value={
                  access?.role
                }
              />

              <InfoRow
                label="Organization Role"
                value={
                  organization
                    ?.organizationRole
                }
              />

            </div>

          </CardContent>

        </Card>

      </div>

      {/* ========================================
         ACCOUNT ANALYTICS
      ======================================== */}

      <Card className="
        bg-zinc-900
        border-zinc-800
      ">

        <CardContent className="
          p-8
        ">

          <div className="
            flex items-center
            gap-3
            mb-8
          ">

            <CalendarClock
              className="
                text-violet-400
              "
            />

            <h2 className="
              text-2xl
              font-bold
            ">

              Account Metadata

            </h2>

          </div>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          ">

            <InfoRow
              label="Account Created"
              value={
                createdAt
                  ? createdAt.toLocaleString()
                  : "N/A"
              }
            />

            <InfoRow
              label="Last Login"
              value={
                lastLogin
                  ? lastLogin.toLocaleString()
                  : "N/A"
              }
            />

            <InfoRow
              label="Last Active"
              value={
                lastActive
                  ? lastActive.toLocaleString()
                  : "N/A"
              }
            />

            <InfoRow
              label="Total Logins"
              value={
                analytics?.totalLogins || 0
              }
            />

          </div>

        </CardContent>

      </Card>

    </div>
  );
}

/* ========================================
   INPUT FIELD
======================================== */

function InputField({
  icon,
  ...props
}) {

  return (

    <div className="
      relative
    ">

      <div className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-zinc-500
      ">

        {icon}

      </div>

      <Input
        {...props}
        className="
          h-14
          pl-12
          rounded-2xl
          bg-zinc-950
          border-zinc-800
          text-white
        "
      />

    </div>
  );
}

/* ========================================
   INFO ROW
======================================== */

function InfoRow({
  label,
  value,
}) {

  return (

    <div className="
      flex
      items-center
      justify-between
      gap-4
      rounded-2xl
      border
      border-zinc-800
      bg-zinc-950
      px-5
      py-4
    ">

      <p className="
        text-zinc-400
      ">

        {label}

      </p>

      <p className="
        font-semibold
        capitalize
        text-right
      ">

        {value || "N/A"}

      </p>

    </div>
  );
}