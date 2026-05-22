import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
} from "lucide-react";

import logo from "@/assets/image.png";

import logActivity
  from "@/utils/activity/logActivity";

import { toast } from "sonner";

export default function Login() {

  const navigate =
    useNavigate();

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

  // ========================================
  // Handle Change
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
  // Firebase Error Handler
  // ========================================

  const getErrorMessage =
    (code) => {

      switch (code) {

        case "auth/invalid-email":
          return "Invalid email address";

        case "auth/user-not-found":
          return "User not found";

        case "auth/wrong-password":
          return "Incorrect password";

        case "auth/invalid-credential":
          return "Invalid email or password";

        case "auth/too-many-requests":
          return "Too many login attempts. Try again later.";

        default:
          return "Login failed";
      }
    };

  // ========================================
  // Login
  // ========================================

  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        // ========================================
        // Firebase Login
        // ========================================

        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            formData.email.trim(),
            formData.password
          );

        const user =
          userCredential.user;

        // ========================================
        // Refresh Auth State
        // ========================================

        await user.reload();

        // ========================================
        // Email Verification
        // ========================================

        if (
          !user.emailVerified
        ) {

          await signOut(auth);

          toast.error(
            "Please verify your email before login"
          );

          return;
        }

        // ========================================
        // User Document
        // ========================================

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        const userSnap =
          await getDoc(
            userRef
          );

        if (
          !userSnap.exists()
        ) {

          await signOut(auth);

          toast.error(
            "User profile not found"
          );

          return;
        }

        const userData =
          userSnap.data();

        // ========================================
        // Seller Approval
        // ========================================

        if (
          userData.role ===
            "seller" &&
          !userData.isApproved
        ) {

          await signOut(auth);

          toast.error(
            "Your seller account is pending admin approval"
          );

          return;
        }

        // ========================================
        // Update Last Login
        // ========================================

        await updateDoc(
          userRef,
          {

            emailVerified:
              true,

            lastLoginAt:
              serverTimestamp(),
          }
        );

        // ========================================
        // Activity Log
        // ========================================

        await logActivity({

          uid: user.uid,

          type: "login",

          title:
            "Account Login",

          description:
            "User logged into SellerOS successfully",

          meta: {
            role:
              userData.role,
            fullName:
              userData.fullName,
            businessName:
              userData.businessName ||
              null,
            subscriptionPlan:
              userData.subscription.planName ||
              null,
          },
        });

        // ========================================
        // Success
        // ========================================

        toast.success(
          "Login successful"
        );

        // ========================================
        // Role Redirect
        // ========================================

        switch (
          userData.role
        ) {

          case "super_admin":

          case "admin":

            navigate(
              "/admin"
            );

            break;

          case "seller":

            navigate(
              "/seller"
            );

            break;

          default:

            navigate(
              "/staff"
            );
        }

      } catch (error) {

        console.error(
          "LOGIN ERROR:",
          error
        );

        toast.error(
          getErrorMessage(
            error.code
          )
        );

      } finally {

        setLoading(false);
      }
    };

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
        bg-black/60
        backdrop-blur-sm
      " />

      {/* Login Card */}
      <Card className="
        relative z-10
        w-full max-w-md
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
            text-center mb-8
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

              Secure enterprise login portal

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
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              required
              className="
                h-14
                rounded-2xl
                bg-black/20
                border-white/10
                text-white
                placeholder:text-zinc-400
              "
            />

            {/* Password */}
            <div className="
              relative
            ">

              <Input
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                required
                className="
                  h-14
                  rounded-2xl
                  bg-black/20
                  border-white/10
                  text-white
                  placeholder:text-zinc-400
                  pr-14
                "
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
                    size={20}
                  />

                ) : (

                  <Eye
                    size={20}
                  />

                )}

              </button>

            </div>

            {/* Forgot */}
            <div className="
              flex justify-end
            ">

              <Link
                to="/forgot-password"
                className="
                  text-sm
                  text-violet-300
                  hover:text-violet-200
                "
              >

                Forgot Password?

              </Link>

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

                "Logging in..."

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

          {/* Footer */}
          <div className="
            mt-8
            text-center
            text-zinc-300
          ">

            Don’t have an account?

            <Link
              to="/register"
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

    </div>
  );
}