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

      businessName: "",

      website: "",

      address: "",

      state: "",

      city: "",

      country: "India",

      bio: "",
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

      businessName:
        userData.businessName || "",

      website:
        userData.website || "",

      address:
        userData.address || "",

      state:
        userData.state || "",

      city:
        userData.city || "",

      country:
        userData.country || "India",

      bio:
        userData.bio || "",
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

      try {

        if (!user) {

          toast.error(
            "Authentication required"
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

            businessName:
              formData.businessName,

            website:
              formData.website,

            address:
              formData.address,

            state:
              formData.state,

            city:
              formData.city,

            country:
              formData.country,

            bio:
              formData.bio,

            onboarding: {

              ...userData.onboarding,

              profileCompleted:
                true,
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

        if (
          !userData.organizationId
        ) {

          navigate(
            "/organization-setup"
          );

          return;
        }

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

              <StyledInput
                icon={Building2}
                placeholder="Business Name"
                value={
                  formData.businessName
                }
                onChange={(e) =>
                  updateField(
                    "businessName",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={Globe}
                placeholder="Website"
                value={
                  formData.website
                }
                onChange={(e) =>
                  updateField(
                    "website",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={MapPin}
                placeholder="State"
                value={
                  formData.state
                }
                onChange={(e) =>
                  updateField(
                    "state",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={MapPin}
                placeholder="City"
                value={
                  formData.city
                }
                onChange={(e) =>
                  updateField(
                    "city",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={MapPin}
                placeholder="Country"
                value={
                  formData.country
                }
                onChange={(e) =>
                  updateField(
                    "country",
                    e.target.value
                  )
                }
              />

            </div>

            {/* Address */}
            <div className="
              mt-5
            ">

              <Textarea
                placeholder="Business Address"
                value={
                  formData.address
                }
                onChange={(e) =>
                  updateField(
                    "address",
                    e.target.value
                  )
                }
                className="
                  min-h-[120px]
                  border-white/10
                  bg-black/20
                  text-white
                  placeholder:text-zinc-500
                "
              />

            </div>

            {/* Bio */}
            <div className="
              mt-5
            ">

              <Textarea
                placeholder="Business Bio / About"
                value={
                  formData.bio
                }
                onChange={(e) =>
                  updateField(
                    "bio",
                    e.target.value
                  )
                }
                className="
                  min-h-[120px]
                  border-white/10
                  bg-black/20
                  text-white
                  placeholder:text-zinc-500
                "
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