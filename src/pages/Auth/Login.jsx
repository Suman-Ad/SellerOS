import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from  "@/assets/image.png";

import { toast } from "sonner";

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

export default function Login() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

      const user = userCredential.user;

      // Refresh latest auth state
      await user.reload();

      // Email verification check
      if (!user.emailVerified) {

        toast.error(
          "Please verify your email before login"
        );

        await signOut(auth);

        return;
      }

      // Get Firestore user document
      const userRef = doc(db, "users", user.uid);

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {

        toast.error("User profile not found");

        await signOut(auth);

        return;
      }

      const userData = userSnap.data();

      // Update Firestore email verification
      await updateDoc(userRef, {
        emailVerified: true,
      });

      // Seller approval check
      if (
        userData.role === "seller" &&
        !userData.isApproved
      ) {

        toast.error(
          "Your seller account is pending admin approval"
        );

        await signOut(auth);

        return;
      }

      toast.success("Login successful");

      // Role-based redirects
      if (userData.role === "super_admin") {

        navigate("/admin");

      }
      else if (userData.role === "admin") {

        navigate("/admin");

      }
      else if (
        userData.role === "seller"
      ) {

        navigate("/seller");

      }
      else {

        navigate("/staff");
      }

    } catch (error) {

      console.error("LOGIN ERROR:", error);

      toast.error(error.message);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6" style={backgroundStyle}>

      <Card className="bg-white/15 backdrop-blur-md border border-white/20 p-8 rounded-xl shadow-2xl w-full max-w-md" style={backgroundStyle}>

        <CardContent className="p-8">

          <div className="mb-6">

            <h1 className="text-3xl font-bold">
              Login
            </h1>

            <p className="text-zinc-400 mt-2" >
              Welcome back to SellerOS
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >

            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </Button>

          </form>

          <p className="text-zinc-900 text-sm mt-10">

            Don’t have an account?{" "}

            <Link
              to="/register"
              className="text-violet-900"
            >
              Register
            </Link>

          </p>

        </CardContent>

      </Card>

    </div>
  );
}