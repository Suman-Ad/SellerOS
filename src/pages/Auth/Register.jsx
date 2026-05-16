import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";

import { auth, db } from "@/firebase/config";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  

  const [loading, setLoading] = useState(false);

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
  });

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

        role: "seller",

        approvalStatus: "pending",
        isApproved: false,
        emailVerified: false,

        createdAt: serverTimestamp(),
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 text-white">
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