import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";

import { auth, db } from "@/firebase/config";

import { doc, setDoc } from "firebase/firestore";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.fullName,
      });

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        role: "staff",
        createdAt: new Date(),
      });

      toast.success("Registration successful. Verify your email.");

      navigate("/login");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
        
        <CardContent className="p-8">

          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              Create Account
            </h1>

            <p className="text-zinc-400 mt-2">
              Start using SellerOS
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            <Input
              name="fullName"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            <Input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

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