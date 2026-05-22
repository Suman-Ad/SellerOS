import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";

import { auth, db } from "@/firebase/config";

import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/image.png";

import { toast } from "sonner";

import logActivity
  from "@/utils/activity/logActivity";

const backgroundStyle = {
  backgroundImage: `url(${logo})`,
  backgroundSize: 'cover',        // Scales the image to fill the screen without stretching
  backgroundPosition: 'center',    // Centers the focal point of the image
  backgroundRepeat: 'no-repeat',  // Prevents the image from tiling
  width: '100vw',                 // Full viewport width
  height: '100vh',                // Full viewport height
  display: 'flex',                // Layout tool to align your form
  justifyContent: 'center',       // Centers form horizontally
  alignItems: 'center'            // Centers form vertically
};

export default function Register() {
  const navigate = useNavigate();


  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);

  const [plansLoading, setPlansLoading] =
    useState(true);

  const [formData, setFormData] = useState({
    businessName: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    address: "",
    pin: "",
    govId: "",
    gstNo: "",
    role: "seller",
    selectedPlanId: "",
    selectedPlanName: "",
  });

  useEffect(() => {

    const fetchPlans = async () => {

      try {

        const q = query(
          collection(db, "subscriptionPlans"),
          where("isActive", "==", true)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlans(data);

        // Auto select first plan
        if (data.length > 0) {

          setFormData((prev) => ({
            ...prev,
            selectedPlanId: data[0].id,
            selectedPlanName: data[0].name,
          }));
        }

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load subscription plans"
        );

      } finally {

        setPlansLoading(false);
      }
    };

    fetchPlans();

  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    let user = null;

    try {
      setLoading(true);

      const fullName =
        `${formData.firstName} ${formData.lastName}`;

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

      user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
      });

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,

        businessName: formData.businessName,

        firstName: formData.firstName,
        lastName: formData.lastName,

        fullName,

        email: formData.email,
        mobile: formData.mobile,

        address: formData.address,
        pin: formData.pin,

        govId: formData.govId,
        gstNo: formData.gstNo,

        role: formData.role,

        approvalStatus: "pending",
        isApproved: false,
        emailVerified: false,

        subscription: {
          planId: formData.selectedPlanId,
          planName: formData.selectedPlanName,

          status: "trial",

          isActive: true,

          subscribedAt: serverTimestamp(),
        },

        createdAt: serverTimestamp(),
      });

      // ========================================
      // Activity Log
      // ========================================

      await logActivity({

        uid: user.uid,

        type: "register",

        title:
          "Account Registration",

        description:
          `New User:- ${formData.fullName} as a ${formData.role}\nShop Name:- ${formData.businessName}\n Plan:- ${formData.subscription.planName} registered for SellerOS successfully`,

        meta: {
          role:
            formData.role,
          fullName:
            formData.fullName,
          businessName:
            formData.businessName ||
            null,
          subscriptionPlan:
            formData.subscription.planName ||
            null,
        },
      });

      toast.success(
        "Registration successful. Please verify your email."
      );

      navigate("/login");

    } catch (error) {

      console.error("REGISTER ERROR:", error);

      // Rollback auth user if Firestore fails
      try {
        if (user) {
          await user.delete();
        }
      } catch (deleteError) {
        console.error("DELETE ERROR:", deleteError);
      }

      toast.error(error.message);

    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6" style={backgroundStyle}>
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 text-white" style={backgroundStyle}>
        <CardContent className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              Create Account
            </h1>

            <p className="text-zinc-400 mt-2">
              Start using SellerOS
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >
            {/* Business */}
            <Input
              name="businessName"
              placeholder="Business Name"
              value={formData.businessName}
              onChange={handleChange}
              required
            />

            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />

              <Input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email + Mobile */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            {/* Address */}
            <Input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />

            {/* PIN + GST */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="pin"
                placeholder="PIN Code"
                value={formData.pin}
                onChange={handleChange}
              />

              <Input
                name="gstNo"
                placeholder="GST Number"
                value={formData.gstNo}
                onChange={handleChange}
              />
            </div>

            {/* Govt ID */}
            <Input
              name="govId"
              placeholder="Government ID Number"
              value={formData.govId}
              onChange={handleChange}
            />

            {/* Role */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white"
            >
              <option value="seller">Seller</option>
              <option value="staff">Staff</option>
            </select>


            <div className="space-y-4">

              <h2 className="text-lg font-semibold text-white">
                Select Subscription Plan
              </h2>

              {plansLoading ? (

                <div className="text-zinc-400">
                  Loading plans...
                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {plans.map((plan) => {

                    const selected =
                      formData.selectedPlanId === plan.id;

                    return (

                      <button
                        type="button"
                        key={plan.id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            selectedPlanId: plan.id,
                            selectedPlanName: plan.name,
                          }))
                        }
                        className={`
              text-left
              rounded-2xl
              border
              p-5
              transition-all
              ${selected
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-zinc-700 bg-zinc-900"
                          }
            `}
                      >

                        <div className="flex items-center justify-between">

                          <h3 className="text-xl font-bold text-white">
                            {plan.name}
                          </h3>

                          {plan.badge && (

                            <div className="bg-violet-600 text-white text-xs px-3 py-1 rounded-full">
                              {plan.badge}
                            </div>

                          )}

                        </div>

                        <p className="text-zinc-400 text-sm mt-2">
                          {plan.description}
                        </p>

                        <div className="mt-4">

                          <span className="text-3xl font-black text-white">
                            ₹{plan.priceMonthly}
                          </span>

                          <span className="text-zinc-400">
                            /month
                          </span>

                        </div>

                        <div className="mt-4 space-y-2">

                          {plan.features?.slice(0, 4).map(
                            (feature, index) => (

                              <div
                                key={index}
                                className="text-sm text-zinc-300 flex items-center gap-2"
                              >

                                • {feature}

                              </div>
                            )
                          )}

                        </div>

                      </button>
                    );
                  })}

                </div>

              )}

            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>

          <p className="text-zinc-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-500"
            >
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}