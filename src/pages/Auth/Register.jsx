import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Building2,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  registerWithEmail,
  loginWithGoogle,
} from "@/services/auth/authService";

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

import logo
  from "@/assets/image.png";

import {
  toast,
} from "sonner";

import {
  USER_TYPES,
} from "@/constants/userLifecycle";

/* =========================================================
   USER TYPES
========================================================= */

const USER_TYPE_OPTIONS = [

  {
    value:
      USER_TYPES.SELLER,

    label:
      "Seller",
  },

  // {
  //   value:
  //     USER_TYPES.STAFF,

  //   label:
  //     "Staff",
  // },

  {
    value:
      USER_TYPES.SUPPLIER,

    label:
      "Supplier",
  },

  // {
  //   value:
  //     USER_TYPES.PARTNER,

  //   label:
  //     "Partner",
  // },
];
/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {

  userType: "seller",

  fullName: "",

  username: "",

  email: "",

  mobile: "",

  password: "",

  confirmPassword: "",

  selectedPlanId: "",

  selectedPlanName: "",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Register() {

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const inviteToken =
    searchParams.get(
      "invite"
    );

  /* =====================================================
     STATE
  ===================================================== */

  const [step, setStep] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [plans, setPlans] =
    useState([]);

  const [plansLoading,
    setPlansLoading] =
    useState(true);

  const [formData,
    setFormData] =
    useState(INITIAL_FORM);

  /* =====================================================
     LOAD PLANS
  ===================================================== */

  useEffect(() => {

    const fetchPlans =
      async () => {

        try {

          const q = query(
            collection(
              db,
              "subscriptionPlans"
            ),
            where(
              "isActive",
              "==",
              true
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

          setPlans(data);

          if (data.length > 0) {

            setFormData(
              (prev) => ({
                ...prev,

                selectedPlanId:
                  data[0].id,

                selectedPlanName:
                  data[0].name,
              })
            );
          }

        } catch (error) {

          console.error(error);

          toast.error(
            "Failed to load plans"
          );

        } finally {

          setPlansLoading(false);
        }
      };

    fetchPlans();

  }, []);

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

  const nextStep = () => {

    setStep((prev) =>
      Math.min(prev + 1, 4)
    );
  };

  const prevStep = () => {

    setStep((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const isStepValid =
    useMemo(() => {

      switch (step) {

        case 1:

          return !!formData.userType;

        case 2:

          return (
            formData.fullName &&
            formData.username &&
            formData.mobile
          );

        case 3:

          return (
            formData.email &&
            formData.password &&
            formData.confirmPassword &&
            formData.password ===
            formData.confirmPassword
          );

        case 4:

          return (
            formData.selectedPlanId
          );

        default:

          return false;
      }

    }, [step, formData]);

  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegister =
    async () => {

      try {

        if (
          formData.password !==
          formData.confirmPassword
        ) {

          toast.error(
            "Passwords do not match"
          );

          return;
        }

        setLoading(true);

        const response =
          await registerWithEmail({

            email:
              formData.email,

            password:
              formData.password,

            fullName:
              formData.fullName,

            username:
              formData.username,

            phoneNumber:
              formData.mobile,

            userType:
              formData.userType,

            subscriptionData: {

              planId:
                formData.selectedPlanId,

              planName:
                formData.selectedPlanName,
            },
          });

        if (!response.success) {

          toast.error(
            response.error
          );

          return;
        }

        toast.success(
          "Registration successful. Verify your email."
        );

        if (inviteToken) {

          navigate(
            `/login?invite=${inviteToken}`
          );

        } else {

          navigate(
            "/verify-email"
          );
        }

      } catch (error) {

        console.error(error);

        toast.error(
          "Registration failed"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     GOOGLE REGISTER
  ===================================================== */

  const handleGoogleRegister =
    async () => {

      try {

        setLoading(true);

        const response =
          await loginWithGoogle({
            userType:
              formData.userType,
          });

        if (!response.success) {

          toast.error(
            response.error
          );

          return;
        }

        toast.success(
          "Google onboarding successful"
        );

        if (inviteToken) {

          navigate(
            `/invite/${inviteToken}`
          );

        } else {

          navigate(
            response.redirectPath ||
            "/complete-profile"
          );
        }

      } catch (error) {

        console.error(error);

        toast.error(
          "Google registration failed"
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
      }}
    >

      {/* Overlay */}
      <div className="
        absolute inset-0
        bg-black/70
        backdrop-blur-sm
      " />

      <Card
        className="
          relative z-10
          w-full max-w-4xl
          border border-white/10
          bg-white/10
          backdrop-blur-2xl
          rounded-3xl
          overflow-hidden
          shadow-2xl
        "
      >

        <CardContent
          className="
            p-8 md:p-10
          "
        >

          {/* Header */}
          <div className="
            mb-8
          ">

            <h1 className="
              text-4xl
              font-black
              text-white
            ">

              SellerOS Enterprise

            </h1>

            <p className="
              text-zinc-300
              mt-3
            ">

              Enterprise onboarding &
              organization provisioning

            </p>

          </div>

          {/* Steps */}
          <div className="
            flex items-center
            gap-3
            mb-10
          ">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  key={item}
                  className="
                    flex-1
                  "
                >

                  <div
                    className={`
                      h-2
                      rounded-full
                      transition-all
                      ${step >= item
                        ? "bg-violet-500"
                        : "bg-zinc-700"
                      }
                    `}
                  />

                </div>
              )
            )}

          </div>

          {/* Form Area */}
          <AnimatePresence
            mode="wait"
          >

            {/* STEP 1 */}
            {step === 1 && (

              <StepWrapper
                keyName="step1"
              >

                <h2 className="
                  text-2xl
                  font-bold
                  text-white
                  mb-6
                ">

                  Select Account Type

                </h2>

                <div className="
                  grid md:grid-cols-2
                  gap-4
                ">

                  {USER_TYPE_OPTIONS.map(
                    (type) => (

                      <button
                        key={type.value}
                        onClick={() =>
                          updateField(
                            "userType",
                            type.value
                          )
                        }
                        className={`
                          p-5
                          rounded-2xl
                          border
                          text-left
                          transition-all
                          ${formData.userType ===
                            type.value
                            ? `
                                border-violet-500
                                bg-violet-500/10
                              `
                            : `
                                border-zinc-700
                                bg-zinc-900/40
                              `
                          }
                        `}
                      >

                        <div className="
                          text-white
                          font-semibold
                          text-lg
                        ">

                          {type.label}

                        </div>

                      </button>
                    )
                  )}

                </div>

              </StepWrapper>
            )}

            {/* STEP 2 */}
            {step === 2 && (

              <StepWrapper
                keyName="step2"
              >

                <h2 className="
                  text-2xl
                  font-bold
                  text-white
                  mb-6
                ">

                  Identity Profile

                </h2>

                <div className="
                  grid md:grid-cols-2
                  gap-4
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

              </StepWrapper>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              

              <StepWrapper
                keyName="step3"
              >

                <h2 className="
                  text-2xl
                  font-bold
                  text-white
                  mb-6
                ">

                  Authentication

                </h2>

                <button
                  onClick={
                    handleGoogleRegister
                  }
                  className="
                    mt-6
                    w-full
                    py-4
                    rounded-2xl
                    bg-white
                    text-black
                    font-semibold
                  "
                >

                  Continue with Google

                </button>

                <div className="
                  grid md:grid-cols-2
                  gap-4
                ">

                  <StyledInput
                    icon={Mail}
                    placeholder="Email"
                    type="email"
                    value={
                      formData.email
                    }
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                  />

                  <StyledInput
                    icon={Lock}
                    placeholder="Password"
                    type="password"
                    value={
                      formData.password
                    }
                    onChange={(e) =>
                      updateField(
                        "password",
                        e.target.value
                      )
                    }
                  />

                  <StyledInput
                    icon={Lock}
                    placeholder="Confirm Password"
                    type="password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={(e) =>
                      updateField(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                  />

                </div>

                

              </StepWrapper>
            )}

            {/* STEP 4 */}
            {step === 4 && (

              <StepWrapper
                keyName="step4"
              >

                <h2 className="
                  text-2xl
                  font-bold
                  text-white
                  mb-6
                ">

                  Business & Subscription

                </h2>


                {/* Subscription Plans */}
                <div className="
                  mt-8
                ">

                  <h3 className="
                    text-xl
                    font-bold
                    text-white
                    mb-5
                  ">

                    Select Plan

                  </h3>

                  {plansLoading ? (

                    <div className="
                      text-zinc-300
                    ">
                      Loading plans...
                    </div>

                  ) : (

                    <div className="
                      grid md:grid-cols-2
                      gap-4
                    ">

                      {plans.map(
                        (plan) => {

                          const selected =
                            formData.selectedPlanId ===
                            plan.id;

                          return (

                            <button
                              key={plan.id}
                              type="button"
                              onClick={() =>
                                setFormData(
                                  (prev) => ({
                                    ...prev,

                                    selectedPlanId:
                                      plan.id,

                                    selectedPlanName:
                                      plan.name,
                                  })
                                )
                              }
                              className={`
                                text-left
                                p-5
                                rounded-2xl
                                border
                                transition-all
                                ${selected
                                  ? `
                                      border-violet-500
                                      bg-violet-500/10
                                    `
                                  : `
                                      border-zinc-700
                                      bg-zinc-900/30
                                    `
                                }
                              `}
                            >

                              <div className="
                                flex items-center
                                justify-between
                              ">

                                <h3 className="
                                  text-white
                                  text-xl
                                  font-bold
                                ">

                                  {plan.name}

                                </h3>

                                <CreditCard
                                  className="
                                    text-violet-400
                                  "
                                />

                              </div>

                              <p className="
                                text-zinc-400
                                mt-2
                              ">

                                {plan.description}

                              </p>

                              <div className="
                                mt-4
                                text-3xl
                                font-black
                                text-white
                              ">

                                ₹
                                {plan.priceMonthly}

                                <span className="
                                  text-sm
                                  text-zinc-400
                                  ml-1
                                ">

                                  /month

                                </span>

                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>

              </StepWrapper>
            )}

          </AnimatePresence>

          {/* Footer */}
          <div className="
            flex justify-between
            mt-10
          ">

            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >

              <ArrowLeft
                size={18}
              />

              Back

            </Button>

            {step < 4 ? (

              <Button
                onClick={nextStep}
                disabled={
                  !isStepValid
                }
              >

                Next

                <ArrowRight
                  size={18}
                />

              </Button>

            ) : (

              <Button
                onClick={
                  handleRegister
                }
                disabled={
                  loading
                }
              >

                {loading
                  ? "Creating..."
                  : "Create Enterprise Account"}

              </Button>
            )}

          </div>

          {/* Footer */}
          <div className="
            mt-8
            text-center
            text-zinc-300
          ">

            Already have an account?

            <Link
              to={
                inviteToken
                  ? `/login?invite=${inviteToken}`
                  : "/login"
              }
              className="
                ml-2
                text-violet-300
                font-semibold
              "
            >

              Login

            </Link>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}

/* =========================================================
   STEP WRAPPER
========================================================= */

function StepWrapper({
  children,
  keyName,
}) {

  return (
    <motion.div
      key={keyName}
      initial={{
        opacity: 0,
        x: 40,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: -40,
      }}
    >

      {children}

    </motion.div>
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
      bg-black/30
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