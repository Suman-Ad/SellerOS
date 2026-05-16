import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/firebase/config";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

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

      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (!userCredential.user.emailVerified) {
        toast.error("Please verify your email first.");
        return;
      }

      toast.success("Login successful");

      navigate("/");

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
              Login
            </h1>

            <p className="text-zinc-400 mt-2">
              Welcome back to SellerOS
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

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
              {loading ? "Logging in..." : "Login"}
            </Button>

          </form>

          <p className="text-zinc-400 text-sm mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-violet-500"
            >
              Register
            </Link>
          </p>

        </CardContent>

      </Card>

    </div>
  );
}