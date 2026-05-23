import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  ShieldCheck,
} from "lucide-react";

import {
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
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

/* =========================================================
   COMPONENT
========================================================= */

export default function Login() {

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

  const [loading,
    setLoading] =
    useState(false);

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [formData,
    setFormData] =
    useState({
      email: "",
      password: "",
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
     ROLE REDIRECT
  ===================================================== */

  const redirectAfterAuth =
    (role) => {

      /* =====================================
         INVITATION FLOW
      ===================================== */

      if (inviteToken) {

        navigate(
          `/invite/${inviteToken}`
        );

        return;
      }

      /* =====================================
         NORMAL FLOW
      ===================================== */

      switch (role) {

        case "super_admin":

        case "admin":

          navigate("/admin");

          break;

        case "seller":

        case "seller_admin":

          navigate("/seller");

          break;

        case "staff":

          navigate("/staff");

          break;

        default:

          navigate("/");
      }
    };

  /* =====================================================
     EMAIL LOGIN
  ===================================================== */

  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const response =
          await loginWithEmail({

            email:
              formData.email,

            password:
              formData.password,
          });

        if (!response.success) {

          toast.error(
            response.error
          );

          return;
        }

        toast.success(
          "Login successful"
        );

        redirectAfterAuth(
          response.userData.role
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Login failed"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     GOOGLE LOGIN
  ===================================================== */

  const handleGoogleLogin =
    async () => {

      try {

        setLoading(true);

        const response =
          await loginWithGoogle();

        if (!response.success) {

          toast.error(
            response.error
          );

          return;
        }

        toast.success(
          "Google login successful"
        );

        redirectAfterAuth(
          response.userData.role
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Google login failed"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const handleResetPassword =
    async () => {

      try {

        if (!formData.email) {

          toast.error(
            "Enter your email first"
          );

          return;
        }

        setLoading(true);

        const response =
          await resetPassword(
            formData.email
          );

        if (!response.success) {

          toast.error(
            response.error
          );

          return;
        }

        toast.success(
          response.message
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Password reset failed"
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
        flex items-center
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

      {/* Login Card */}
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
          w-full max-w-md
        "
      >

        <Card className="
          border border-white/10
          bg-white/10
          backdrop-blur-2xl
          shadow-2xl
          rounded-3xl
          overflow-hidden
        ">

          <CardContent className="
            p-10
          ">

            {/* Header */}
            <div className="
              text-center
              mb-8
            ">

              <div className="
                w-20 h-20
                mx-auto
                rounded-3xl
                bg-violet-600/20
                border border-violet-500/20
                flex items-center
                justify-center
                text-violet-300
                mb-6
              ">

                <ShieldCheck
                  size={38}
                />

              </div>

              <h1 className="
                text-4xl
                font-black
                text-white
              ">

                SellerOS

              </h1>

              <p className="
                text-zinc-300
                mt-3
              ">

                Enterprise authentication portal

              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={
                handleLogin
              }
              className="
                space-y-5
              "
            >

              {/* Email */}
              <StyledInput
                icon={Mail}
                type="email"
                placeholder="Email Address"
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

              {/* Password */}
              <div className="
                relative
              ">

                <StyledInput
                  icon={Lock}
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Password"
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

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-zinc-400
                    hover:text-white
                  "
                >

                  {showPassword ? (

                    <EyeOff
                      size={18}
                    />

                  ) : (

                    <Eye
                      size={18}
                    />

                  )}

                </button>

              </div>

              {/* Forgot Password */}
              <div className="
                flex justify-end
              ">

                <button
                  type="button"
                  onClick={
                    handleResetPassword
                  }
                  className="
                    text-sm
                    text-violet-300
                    hover:text-violet-200
                  "
                >

                  Forgot Password?

                </button>

              </div>

              {/* Submit */}
              <Button
                disabled={loading}
                className="
                  w-full
                  h-14
                  rounded-2xl
                  bg-violet-600
                  hover:bg-violet-700
                  text-lg
                  font-semibold
                "
              >

                {loading ? (

                  "Authenticating..."

                ) : (

                  <div className="
                    flex items-center
                    gap-3
                  ">

                    <LogIn
                      size={18}
                    />

                    Login

                  </div>

                )}

              </Button>

            </form>

            {/* Divider */}
            <div className="
              flex items-center
              gap-4
              my-6
            ">

              <div className="
                flex-1
                h-px
                bg-white/10
              " />

              <span className="
                text-zinc-400
                text-sm
              ">

                OR

              </span>

              <div className="
                flex-1
                h-px
                bg-white/10
              " />

            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              onClick={
                handleGoogleLogin
              }
              disabled={loading}
              className="
                w-full
                h-14
                rounded-2xl
                border-white/10
                bg-black/20
                hover:bg-black/40
                text-white
              "
            >

              Continue with Google

            </Button>

            {/* Footer */}
            <div className="
              mt-8
              text-center
              text-zinc-300
            ">

              Don’t have an account?

              <Link
                to={
                  inviteToken
                    ? `/register?invite=${inviteToken}`
                    : "/register"
                }
                className="
                  ml-2
                  text-violet-300
                  hover:text-violet-200
                  font-semibold
                "
              >

                Register

              </Link>

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