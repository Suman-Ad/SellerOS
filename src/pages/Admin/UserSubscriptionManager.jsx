import { useEffect, useMemo, useState } from "react";

import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  CreditCard,
  Users,
  Crown,
  ShieldCheck,
  CalendarClock,
  Search,
  RefreshCw,
  Ban,
  CheckCircle2,
} from "lucide-react";

import { toast } from "sonner";

import {
  activateSubscription,
} from "@/services/subscription/activateSubscription";

import UserSubscriptionHistoryDrawer
  from "@/components/admin/UserSubscriptionHistoryDrawer";

export default function UserSubscriptionManager() {

  const [users, setUsers] = useState([]);

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [selectedPlan, setSelectedPlan] =
    useState("");

  const usersCollection = useMemo(
    () => collection(db, "users"),
    []
  );

  const [historyOpen, setHistoryOpen] =
    useState(false);

  // =========================
  // Fetch Users
  // =========================

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const q = query(
        usersCollection,
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(data);

    } catch (error) {

      console.error(error);

      toast.error("Failed to load users");

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // Fetch Plans
  // =========================

  const fetchPlans = async () => {

    try {

      const snapshot = await getDocs(
        collection(db, "subscriptionPlans")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPlans(data);

    } catch (error) {

      console.error(error);
    }
  };

  useEffect(() => {

    fetchUsers();

    fetchPlans();

  }, []);

  // =========================
  // Upgrade / Change Plan
  // =========================

  const handleUpdatePlan = async () => {

    if (!selectedUser || !selectedPlan) {
      return toast.error(
        "Select user and plan"
      );
    }

    try {

      const plan = plans.find(
        (p) => p.id === selectedPlan
      );

      if (!plan) {
        return toast.error("Plan not found");
      }

      // await updateDoc(
      //   doc(db, "users", selectedUser.id),
      //   {
      //     subscription: {
      //       planId: plan.id,
      //       planName: plan.name,

      //       status: "active",

      //       isActive: true,

      //       updatedAt:
      //         serverTimestamp(),
      //     },
      //   }
      // );

      await activateSubscription({

        userId:
          selectedUser.id,

        plan,

        billingCycle:
          "monthly",

        paymentInfo: {

          method:
            "Admin",

          verified:
            true,
        },
      });

      toast.success(
        "Subscription updated"
      );

      setSelectedUser(null);

      setSelectedPlan("");

      fetchUsers();

    } catch (error) {

      console.error(error);

      toast.error(error.message);
    }
  };

  // =========================
  // Suspend Subscription
  // =========================

  const handleSuspend = async (
    userId
  ) => {

    try {

      await updateDoc(
        doc(db, "users", userId),
        {
          "subscription.isActive":
            false,

          "subscription.status":
            "suspended",

          updatedAt:
            serverTimestamp(),
        }
      );

      toast.success(
        "Subscription suspended"
      );

      fetchUsers();

    } catch (error) {

      toast.error(error.message);
    }
  };

  // =========================
  // Activate Subscription
  // =========================

  const handleActivate = async (
    userId
  ) => {

    try {

      await updateDoc(
        doc(db, "users", userId),
        {
          "subscription.isActive":
            true,

          "subscription.status":
            "active",

          updatedAt:
            serverTimestamp(),
        }
      );

      toast.success(
        "Subscription activated"
      );

      fetchUsers();

    } catch (error) {

      toast.error(error.message);
    }
  };

  // =========================
  // Filter Users
  // =========================

  const filteredUsers = users.filter(
    (user) => {

      const text = search.toLowerCase();

      return (
        user.fullName
          ?.toLowerCase()
          .includes(text) ||
        user.email
          ?.toLowerCase()
          .includes(text) ||
        user.subscription?.planName
          ?.toLowerCase()
          .includes(text)
      );
    }
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-black text-white flex items-center gap-3">

            <CreditCard className="text-violet-400" />

            User Subscription Manager

          </h1>

          <p className="text-zinc-400 mt-2">
            Manage seller plans, upgrades,
            subscription status and SaaS access.
          </p>

        </div>

        <Button
          onClick={fetchUsers}
          className="bg-zinc-800 hover:bg-zinc-700"
        >

          <RefreshCw className="mr-2 h-4 w-4" />

          Refresh

        </Button>

      </div>

      {/* Search */}
      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-4">

          <div className="flex items-center gap-3">

            <Search
              size={18}
              className="text-zinc-400"
            />

            <Input
              placeholder="Search users, email or plans..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </CardContent>

      </Card>

      {/* Users */}
      <div className="grid grid-cols-1 gap-6">

        {filteredUsers.map((user) => {

          const subscription =
            user.subscription || {};

          const expiryDate =
            subscription.expiresAt?.toDate
              ? subscription.expiresAt.toDate()
              : null;

          const daysLeft =
            expiryDate
              ? Math.ceil(
                (expiryDate - new Date()) /
                (1000 * 60 * 60 * 24)
              )
              : 0;

          const subscriptionHealth =
            !subscription.isActive
              ? "Suspended"
              : daysLeft <= 0
                ? "Expired"
                : daysLeft <= 7
                  ? "Expiring Soon"
                  : "Healthy";

          return (

            <Card
              key={user.id}
              className="bg-zinc-900 border-zinc-800"
            >

              <CardContent className="p-6">

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                  {/* Left */}
                  <div className="flex items-start gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl font-black text-white">

                      {user.fullName?.charAt(0)}

                    </div>

                    <div>

                      <h2 className="text-xl font-bold text-white">
                        {user.fullName}
                      </h2>

                      <p className="text-zinc-400 mt-1">
                        {user.email}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm">

                        <div className="text-zinc-400">

                          Revenue:
                          <span className="text-white ml-2">
                            Coming Soon
                          </span>

                        </div>

                        <div className="text-zinc-400">

                          Payments:
                          <span className="text-white ml-2">
                            Coming Soon
                          </span>

                        </div>

                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-4">

                        <div className="bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">

                          <Crown size={14} />

                          {subscription.planName ||
                            "No Plan"}

                        </div>

                        <div
                          className={`
                            px-3 py-1 rounded-full text-sm
                            ${subscription.isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                            }
                          `}
                        >

                          {subscription.status ||
                            "inactive"}

                        </div>

                        <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">

                          <ShieldCheck
                            size={14}
                          />

                          {user.role}

                        </div>

                        {/* Billing Cycle */}
                        <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm">

                          {subscription.billingCycle ||
                            "monthly"}

                        </div>

                        {/* Expiry */}
                        <div className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">

                          <CalendarClock size={14} />

                          {expiryDate
                            ? expiryDate.toLocaleDateString(
                              "en-IN"
                            )
                            : "No Expiry"}

                        </div>

                        {/* Days Left */}
                        <div
                          className={`
    px-3 py-1 rounded-full text-sm
    ${subscriptionHealth ===
                              "Healthy"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : subscriptionHealth ===
                                "Expiring Soon"
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-red-500/10 text-red-400"
                            }
  `}
                        >

                          {subscriptionHealth ===
                            "Healthy"
                            ? `${daysLeft} Days Left`
                            : subscriptionHealth}

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* Right */}
                  <div className="flex flex-col lg:flex-row gap-3">

                    {/* Plan Select */}
                    <select
                      value={
                        selectedUser?.id ===
                          user.id
                          ? selectedPlan
                          : ""
                      }
                      onChange={(e) => {

                        setSelectedUser(user);

                        setSelectedPlan(
                          e.target.value
                        );
                      }}
                      className="
                        min-w-[240px]
                        h-11
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-950
                        px-4
                        text-sm
                        text-white
                        outline-none
                      "
                    >

                      <option value="">
                        Select Plan
                      </option>

                      {plans.map((plan) => (

                        <option
                          key={plan.id}
                          value={plan.id}
                        >

                          {plan.name}

                        </option>

                      ))}

                    </select>

                    {/* Update */}
                    <Button
                      onClick={
                        handleUpdatePlan
                      }
                      className="bg-violet-600 hover:bg-violet-700"
                    >

                      Update Plan

                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {

                        setSelectedUser(user);

                        setHistoryOpen(true);

                      }}
                    >

                      View History

                    </Button>

                    {/* Suspend / Activate */}
                    {subscription.isActive ? (

                      <Button
                        onClick={() =>
                          handleSuspend(
                            user.id
                          )
                        }
                        className="bg-red-600 hover:bg-red-700"
                      >

                        <Ban className="mr-2 h-4 w-4" />

                        Suspend

                      </Button>

                    ) : (

                      <Button
                        onClick={() =>
                          handleActivate(
                            user.id
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >

                        <CheckCircle2 className="mr-2 h-4 w-4" />

                        Activate

                      </Button>

                    )}

                  </div>

                </div>

              </CardContent>

            </Card>

          );
        })}

      </div>

      {/* Empty */}
      {!loading &&
        filteredUsers.length === 0 && (

          <Card className="bg-zinc-900 border-zinc-800">

            <CardContent className="p-16 text-center">

              <Users
                size={52}
                className="mx-auto text-zinc-600"
              />

              <h2 className="text-2xl font-bold text-white mt-6">
                No Users Found
              </h2>

              <p className="text-zinc-400 mt-2">
                No subscriptions available.
              </p>

            </CardContent>

          </Card>

        )}

      <UserSubscriptionHistoryDrawer
        open={historyOpen}
        user={selectedUser}
        onClose={() =>
          setHistoryOpen(false)
        }
      />

    </div>
  );
}