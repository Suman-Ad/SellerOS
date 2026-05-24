import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  Building2,
  Camera,
  Globe,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

import {
  doc,
  updateDoc,
  serverTimestamp,
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
  Textarea,
} from "@/components/ui/textarea";

import {
  toast,
} from "sonner";

import logo
  from "@/assets/image.png";

import {
  ONBOARDING_STEPS,
} from "@/constants/userLifecycle";

/* =========================================================
   COMPONENT
========================================================= */

export default function CompleteProfile() {

  const navigate =
    useNavigate();

  const {
    user,
    userData,
    refreshUser,
  } = useAuth();

  /* =====================================================
     STATE
  ===================================================== */

  const [loading,
    setLoading] =
    useState(false);

  const [formData,
    setFormData] =
    useState({

      fullName: "",

      username: "",

      mobile: "",

    });

  /* =====================================================
     PREFILL
  ===================================================== */

  useEffect(() => {

    if (!userData)
      return;

    setFormData({

      fullName:
        userData.fullName || "",

      username:
        userData.username || "",

      mobile:
        userData.phoneNumber || "",
    });

  }, [userData]);

  /* =====================================================
     HELPERS
  ===================================================== */

  const updateField =
    (field, value) => {

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSave =
    async () => {

      if (loading) return;

      try {

        if (!user) {

          toast.error(
            "Authentication required"
          );

          return;
        }

        const normalizedUsername =
          formData.username
            .trim()
            .toLowerCase();

        if (
          normalizedUsername.length < 3
        ) {

          toast.error(
            "Username must be at least 3 characters"
          );

          return;
        }

        if (
          !formData.fullName.trim()
        ) {

          toast.error(
            "Full name required"
          );

          return;
        }

        if (
          !formData.mobile.trim()
        ) {

          toast.error(
            "Mobile number required"
          );

          return;
        }

        setLoading(true);

        const userRef = doc(
          db,
          "users",
          user.uid
        );

        await updateDoc(
          userRef,
          {

            fullName:
              formData.fullName,

            username:
              formData.username,

            phoneNumber:
              formData.mobile,

            onboarding: {

              ...(userData.onboarding || {}),

              profileCompleted:
                true,

              currentStep:
                ONBOARDING_STEPS.ORGANIZATION,

              onboardingUpdatedAt:
                serverTimestamp(),
            },

            updatedAt:
              serverTimestamp(),
          }
        );

        await refreshUser();

        toast.success(
          "Profile completed successfully"
        );

        /* =====================
           ROUTING
        ===================== */

        // if (
        //   !userData?.organization
        //     ?.organizationId
        // ) {

        //   navigate(
        //     "/organization-setup"
        //   );

        //   return;
        // }

        navigate("/organization-setup");

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to save profile"
        );

      } finally {

        setLoading(false);
      }
    };

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
              mb-10
            ">

              <div className="
                w-20 h-20
                rounded-3xl
                bg-violet-500/20
                border border-violet-500/20
                flex items-center
                justify-center
                text-violet-300
                mb-6
              ">

                <User
                  size={38}
                />

              </div>

              <h1 className="
                text-4xl
                font-black
                text-white
              ">

                Complete Your Profile

              </h1>

              <p className="
                text-zinc-300
                mt-3
              ">

                Finalize your enterprise onboarding profile

              </p>

            </div>

            {/* Avatar Upload */}
            <div className="
              mb-8
              flex items-center
              gap-5
            ">

              <div className="
                w-28 h-28
                rounded-3xl
                border border-white/10
                bg-black/30
                flex items-center
                justify-center
              ">

                <Camera
                  className="
                    text-zinc-400
                  "
                  size={32}
                />

              </div>

              <div>

                <h3 className="
                  text-white
                  font-bold
                  text-lg
                ">

                  Profile Image

                </h3>

                <p className="
                  text-zinc-400
                  text-sm
                  mt-1
                ">

                  Upload branding assets later from profile settings

                </p>

              </div>

            </div>

            {/* Form */}
            <div className="
              grid md:grid-cols-2
              gap-5
            ">

              <StyledInput
                icon={User}
                placeholder="Full Name"
                value={
                  formData.fullName
                }
                onChange={(e) =>
                  updateField(
                    "fullName",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={User}
                placeholder="Username"
                value={
                  formData.username
                }
                onChange={(e) =>
                  updateField(
                    "username",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={Phone}
                placeholder="Mobile Number"
                value={
                  formData.mobile
                }
                onChange={(e) =>
                  updateField(
                    "mobile",
                    e.target.value
                  )
                }
              />

            </div>

            {/* Footer */}
            <div className="
              mt-8
              flex justify-end
            ">

              <Button
                onClick={
                  handleSave
                }
                disabled={loading}
                className="
                  h-14
                  px-8
                  rounded-2xl
                  bg-violet-600
                  hover:bg-violet-700
                  text-lg
                  font-semibold
                "
              >

                <Save
                  size={18}
                />

                {loading
                  ? "Saving..."
                  : "Complete Profile"}

              </Button>

            </div>

          </CardContent>

        </Card>

      </motion.div>

    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function StyledInput({
  icon: Icon,
  ...props
}) {

  return (

    <div className="
      flex items-center
      gap-3
      rounded-2xl
      border border-white/10
      bg-black/20
      px-4 py-3
    ">

      <Icon
        size={18}
        className="
          text-zinc-400
        "
      />

      <Input
        {...props}
        className="
          border-0
          bg-transparent
          text-white
          placeholder:text-zinc-500
          focus-visible:ring-0
        "
      />

    </div>
  );
}