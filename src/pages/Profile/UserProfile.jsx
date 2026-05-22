import { useEffect, useState } from "react";

import {
    doc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";

import {
    updateProfile,
    updatePassword,
} from "firebase/auth";

import { db, auth } from "@/firebase/config";

import { useAuth } from "@/context/AuthContext";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
    User,
    Crown,
    ShieldCheck,
    Mail,
    Phone,
    MapPin,
    Lock,
    Camera,
    CalendarClock,
    CheckCircle2,
    Sparkles,
    ArrowLeft,
} from "lucide-react";

import { toast } from "sonner";
import ProfileAvatarUpload
    from "@/components/profile/ProfileAvatarUpload";

import ProfileBannerUpload
    from "@/components/profile/ProfileBannerUpload";

import ProfileActivityTimeline
    from "@/components/profile/ProfileActivityTimeline";

import { useNavigate } from "react-router-dom";

export default function UserProfile() {

    const { user, userData } =
        useAuth();

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(false);

    const [passwordLoading,
        setPasswordLoading] =
        useState(false);

    // ========================================
    // Form
    // ========================================

    const [formData, setFormData] =
        useState({

            firstName: "",

            lastName: "",

            fullName: "",

            email: "",

            mobile: "",

            address: "",

            businessName: "",

            gstNo: "",

            govId: "",
        });

    // ========================================
    // Password
    // ========================================

    const [passwords,
        setPasswords] =
        useState({

            newPassword: "",

            confirmPassword: "",
        });

    // ========================================
    // Load User
    // ========================================

    useEffect(() => {

        if (!userData) return;

        setFormData({

            firstName:
                userData.firstName || "",

            lastName:
                userData.lastName || "",

            fullName:
                userData.fullName || "",

            email:
                userData.email || "",

            mobile:
                userData.mobile || "",

            address:
                userData.address || "",

            businessName:
                userData.businessName || "",

            gstNo:
                userData.gstNo || "",

            govId:
                userData.govId || "",
        });

    }, [userData]);

    // ========================================
    // Handle Change
    // ========================================

    const handleChange = (e) => {

        setFormData((prev) => ({
            ...prev,
            [e.target.name]:
                e.target.value,
        }));
    };

    // ========================================
    // Password Change
    // ========================================

    const handlePasswordChange =
        (e) => {

            setPasswords((prev) => ({
                ...prev,
                [e.target.name]:
                    e.target.value,
            }));
        };

    // ========================================
    // Save Profile
    // ========================================

    const handleSaveProfile =
        async () => {

            try {

                setLoading(true);

                const fullName = [
                    formData.firstName,
                    formData.lastName,
                ]
                    .filter(Boolean)
                    .join(" ");

                // ========================================
                // Update Auth
                // ========================================

                await updateProfile(
                    auth.currentUser,
                    {
                        displayName:
                            fullName,
                    }
                );

                // ========================================
                // Update Firestore
                // ========================================

                await updateDoc(
                    doc(db, "users", user.uid),
                    {

                        ...formData,

                        fullName,

                        updatedAt:
                            serverTimestamp(),
                    }
                );

                toast.success(
                    "Profile updated successfully"
                );

            } catch (error) {

                if (
                    error.code ===
                    "auth/requires-recent-login"
                ) {

                    return toast.error(
                        "Please logout and login again before changing password"
                    );
                }

                console.error(error);

                toast.error(error.message);

            } finally {

                setLoading(false);
            }
        };

    // ========================================
    // Reset Password
    // ========================================

    const handleResetPassword =
        async () => {

            try {

                if (
                    passwords.newPassword !==
                    passwords.confirmPassword
                ) {

                    return toast.error(
                        "Passwords do not match"
                    );
                }

                if (
                    passwords.newPassword.length <
                    6
                ) {

                    return toast.error(
                        "Password must be at least 6 characters"
                    );
                }

                setPasswordLoading(true);

                await updatePassword(
                    auth.currentUser,
                    passwords.newPassword
                );

                toast.success(
                    "Password updated successfully"
                );

                setPasswords({

                    newPassword: "",

                    confirmPassword: "",
                });

            } catch (error) {

                console.error(error);

                toast.error(
                    error.message
                );

            } finally {

                setPasswordLoading(false);
            }
        };

    // ========================================
    // Subscription
    // ========================================

    const subscription =
        userData?.subscription || {};

    const expiresAt =
        subscription.expiresAt?.toDate?.();

    if (!userData) {

        return (

            <div className="
      min-h-screen
      bg-zinc-950
      flex items-center
      justify-center
      text-zinc-400
    ">

                Loading profile...

            </div>
        );
    }

    return (

        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <button
                onClick={() =>
                    navigate(-1)
                }
                className="w-10 h-10 rounded-xl border border-gray-300 bg-zinc-800 flex items-center justify-center"
            >

                <ArrowLeft size={18} />

            </button>

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                    <div>

                        <div className="
              inline-flex items-center
              gap-3
              bg-violet-500/10
              border border-violet-500/20
              rounded-full
              px-5 py-2
              text-violet-300
              mb-5
            ">

                            <User size={18} />

                            SellerOS Profile

                        </div>

                        <h1 className="
              text-5xl font-black
            ">

                            My Profile

                        </h1>

                        <p className="
              text-zinc-400 mt-4 text-lg
            ">

                            Manage account, subscription,
                            business details and security.

                        </p>

                    </div>

                </div>


                {/* Layout */}
                <div className="
          grid grid-cols-1
          xl:grid-cols-3
          gap-8
        ">

                    {/* LEFT */}
                    <div className="
            xl:col-span-1
            space-y-8
          ">

                        {/* Profile Card */}
                        <Card className="
              bg-zinc-900
              border-zinc-800
              overflow-hidden
            ">

                            <CardContent className="
                p-0
              ">

                                {/* Banner */}
                                <ProfileBannerUpload
                                    user={user}
                                    userData={userData}
                                />

                                {/* Avatar */}
                                <div className="
                  px-8 pb-8
                  -mt-16
                ">

                                    <ProfileAvatarUpload
                                        user={user}
                                        userData={userData}
                                    />

                                    <div className="
                    mt-6
                  ">

                                        <h2 className="
                      text-3xl
                      font-black
                    ">

                                            {userData?.fullName}

                                        </h2>

                                        <p className="
                      text-zinc-400 mt-2
                    ">

                                            {userData?.email}

                                        </p>

                                        <div className="
                      flex flex-wrap
                      gap-3 mt-5
                    ">

                                            <div className="
                        bg-violet-500/10
                        text-violet-300
                        px-4 py-2
                        rounded-full
                        text-sm
                        flex items-center
                        gap-2
                      ">

                                                <Crown size={14} />

                                                {
                                                    subscription.planName ||
                                                    "Free"
                                                }

                                            </div>

                                            <div className="
                        bg-emerald-500/10
                        text-emerald-300
                        px-4 py-2
                        rounded-full
                        text-sm
                        flex items-center
                        gap-2
                      ">

                                                <CheckCircle2
                                                    size={14}
                                                />

                                                {
                                                    subscription.status ||
                                                    "inactive"
                                                }

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </CardContent>

                        </Card>

                        {/* Subscription */}
                        <Card className="
              bg-zinc-900
              border-zinc-800
            ">

                            <CardContent className="
                p-8
              ">

                                <div className="
                  flex items-center
                  gap-3 mb-6
                ">

                                    <Sparkles className="
                    text-violet-400
                  " />

                                    <h2 className="
                    text-2xl font-bold
                  ">

                                        Subscription

                                    </h2>

                                </div>

                                <div className="
                  space-y-5
                ">

                                    <InfoItem
                                        icon={
                                            <Crown size={18} />
                                        }
                                        label="Current Plan"
                                        value={
                                            subscription.planName ||
                                            "Free"
                                        }
                                    />

                                    <InfoItem
                                        icon={
                                            <ShieldCheck
                                                size={18}
                                            />
                                        }
                                        label="Status"
                                        value={
                                            subscription.status ||
                                            "inactive"
                                        }
                                    />

                                    <InfoItem
                                        icon={
                                            <CalendarClock
                                                size={18}
                                            />
                                        }
                                        label="Expiry"
                                        value={
                                            expiresAt
                                                ? expiresAt.toLocaleDateString()
                                                : "N/A"
                                        }
                                    />

                                </div>

                            </CardContent>

                        </Card>

                    </div>

                    {/* RIGHT */}
                    <div className="
            xl:col-span-2
            space-y-8
          ">

                        {/* Profile Form */}
                        <Card className="
              bg-zinc-900
              border-zinc-800
            ">

                            <CardContent className="
                p-8
              ">

                                <h2 className="
                  text-2xl
                  font-bold mb-8
                ">

                                    Profile Information

                                </h2>

                                <div className="
                  grid grid-cols-1
                  md:grid-cols-2
                  gap-6
                ">

                                    <InputField
                                        icon={<User size={18} />}
                                        name="firstName"
                                        placeholder="First Name"
                                        value={
                                            formData.firstName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <InputField
                                        icon={<User size={18} />}
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={
                                            formData.lastName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <InputField
                                        icon={<Mail size={18} />}
                                        name="email"
                                        placeholder="Email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled
                                    />

                                    <InputField
                                        icon={<Phone size={18} />}
                                        name="mobile"
                                        placeholder="Mobile"
                                        value={
                                            formData.mobile
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <InputField
                                        icon={<MapPin size={18} />}
                                        name="address"
                                        placeholder="Address"
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <InputField
                                        icon={<User size={18} />}
                                        name="businessName"
                                        placeholder="Business Name"
                                        value={
                                            formData.businessName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <InputField
                                        icon={<ShieldCheck size={18} />}
                                        name="gstNo"
                                        placeholder="GST Number"
                                        value={
                                            formData.gstNo
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <InputField
                                        icon={<ShieldCheck size={18} />}
                                        name="govId"
                                        placeholder="Government ID"
                                        value={
                                            formData.govId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                                <Button
                                    onClick={
                                        handleSaveProfile
                                    }
                                    disabled={loading}
                                    className="
                    mt-8
                    h-12
                    px-8
                    rounded-2xl
                    bg-violet-600
                    hover:bg-violet-700
                    font-semibold
                  "
                                >

                                    {loading
                                        ? "Saving..."
                                        : "Save Profile"}

                                </Button>

                            </CardContent>

                        </Card>

                        {/* Password */}
                        <Card className="
              bg-zinc-900
              border-zinc-800
            ">

                            <CardContent className="
                p-8
              ">

                                <div className="
                  flex items-center
                  gap-3 mb-8
                ">

                                    <Lock className="
                    text-violet-400
                  " />

                                    <h2 className="
                    text-2xl font-bold
                  ">

                                        Reset Password

                                    </h2>

                                </div>

                                <div className="
                  grid grid-cols-1
                  md:grid-cols-2
                  gap-6
                ">

                                    <InputField
                                        icon={<Lock size={18} />}
                                        type="password"
                                        name="newPassword"
                                        placeholder="New Password"
                                        value={
                                            passwords.newPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                    />

                                    <InputField
                                        icon={<Lock size={18} />}
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={
                                            passwords.confirmPassword
                                        }
                                        onChange={
                                            handlePasswordChange
                                        }
                                    />

                                </div>

                                <Button
                                    onClick={
                                        handleResetPassword
                                    }
                                    disabled={
                                        passwordLoading
                                    }
                                    className="
                    mt-8
                    h-12
                    px-8
                    rounded-2xl
                    bg-red-600
                    hover:bg-red-700
                    font-semibold
                  "
                                >

                                    {passwordLoading
                                        ? "Updating..."
                                        : "Update Password"}

                                </Button>

                            </CardContent>

                        </Card>
                        <ProfileActivityTimeline
                            user={user}
                        />
                    </div>

                </div>

            </div>

        </div>
    );
}

/* ========================================
   Input Field
======================================== */

function InputField({
    icon,
    ...props
}) {

    return (

        <div className="
      relative
    ">

            <div className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-zinc-500
      ">

                {icon}

            </div>

            <Input
                {...props}
                className="
          h-14
          pl-12
          rounded-2xl
          bg-zinc-950
          border-zinc-800
          text-white
        "
            />

        </div>
    );
}

/* ========================================
   Info Item
======================================== */

function InfoItem({
    icon,
    label,
    value,
}) {

    return (

        <div className="
      flex items-center
      justify-between
      gap-4
    ">

            <div className="
        flex items-center
        gap-3
      ">

                <div className="
          w-10 h-10
          rounded-xl
          bg-zinc-800
          flex items-center
          justify-center
          text-violet-400
        ">

                    {icon}

                </div>

                <p className="
          text-zinc-400
        ">

                    {label}

                </p>

            </div>

            <p className="
        font-semibold
        text-right
      ">

                {value}

            </p>

        </div>
    );
}