import {
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
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  Users,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  createOrganization,
} from "@/services/auth/organizationService";

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

export default function OrganizationSetup() {

  const navigate =
    useNavigate();

  const {
    user,
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

      organizationName: "",

      organizationType:
        "seller_company",

      businessEmail: "",

      businessPhone: "",

      website: "",

      addressLine: "",

      state: "",

      city: "",

      postalCode: "",

      country: "India",

      description: "",
    });

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
     CREATE ORGANIZATION
  ===================================================== */

  const handleCreateOrganization =
    async () => {

      try {

        if (!user) {

          toast.error(
            "Authentication required"
          );

          return;
        }

        if (
          !formData.organizationName
        ) {

          toast.error(
            "Organization name required"
          );

          return;
        }

        setLoading(true);

        const response =
          await createOrganization({

            ownerId:
              user.uid,

            organizationName:
              formData.organizationName,

            organizationType:
              formData.organizationType,

            additionalData: {

              businessEmail:
                formData.businessEmail,

              businessPhone:
                formData.businessPhone,

              website:
                formData.website,

              country:
                formData.country,

              state:
                formData.state,

              city:
                formData.city,

              postalCode:
                formData.postalCode,

              addressLine:
                formData.addressLine,

              description:
                formData.description,
            },
          });

        if (!response.success) {

          toast.error(
            response.error
          );

          return;
        }

        await refreshUser();

        toast.success(
          "Organization created successfully"
        );

        navigate(
          "/compliance-upload"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Organization setup failed"
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
          max-w-5xl
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

                <Building2
                  size={38}
                />

              </div>

              <h1 className="
                text-4xl
                font-black
                text-white
              ">

                Setup Organization

              </h1>

              <p className="
                text-zinc-300
                mt-3
              ">

                Create your enterprise workspace & team infrastructure

              </p>

            </div>

            {/* Organization Form */}
            <div className="
              grid md:grid-cols-2
              gap-5
            ">

              <StyledInput
                icon={Building2}
                placeholder="Organization Name"
                value={
                  formData.organizationName
                }
                onChange={(e) =>
                  updateField(
                    "organizationName",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={Users}
                placeholder="Organization Type"
                value={
                  formData.organizationType
                }
                onChange={(e) =>
                  updateField(
                    "organizationType",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={Mail}
                placeholder="Business Email"
                value={
                  formData.businessEmail
                }
                onChange={(e) =>
                  updateField(
                    "businessEmail",
                    e.target.value
                  )
                }
              />

              <StyledInput
                icon={Phone}
                placeholder="Business Phone"
                value={
                  formData.businessPhone
                }
                onChange={(e) =>
                  updateField(
                    "businessPhone",
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
                placeholder="Postal Code"
                value={
                  formData.postalCode
                }
                onChange={(e) =>
                  updateField(
                    "postalCode",
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
                placeholder="Organization Address"
                value={
                  formData.addressLine
                }
                onChange={(e) =>
                  updateField(
                    "addressLine",
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

            {/* Description */}
            <div className="
              mt-5
            ">

              <Textarea
                placeholder="Organization Description"
                value={
                  formData.description
                }
                onChange={(e) =>
                  updateField(
                    "description",
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

            {/* Features */}
            <div className="
              mt-8
              grid md:grid-cols-3
              gap-4
            ">

              {[
                "Multi-Tenant Workspace",
                "Enterprise Analytics",
                "Team Management",
              ].map((item) => (

                <div
                  key={item}
                  className="
                    rounded-2xl
                    border border-white/10
                    bg-black/20
                    p-5
                    text-white
                    font-medium
                  "
                >

                  {item}

                </div>
              ))}

            </div>

            {/* Footer */}
            <div className="
              mt-10
              flex justify-end
            ">

              <Button
                onClick={
                  handleCreateOrganization
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
                  ? "Provisioning..."
                  : "Create Organization"}

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