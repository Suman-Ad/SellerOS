// src/pages/Admin/AdminSubscriptions.jsx

import { useEffect, useMemo, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  BadgeIndianRupee,
  ShieldCheck,
  Boxes,
  Users,
  ShoppingCart,
} from "lucide-react";

import { toast } from "sonner";

const defaultForm = {
  name: "",
  slug: "",
  badge: "",
  description: "",

  priceMonthly: "",
  priceYearly: "",

  durationDays: 30,
  trialDays: 0,

  maxProducts: 0,
  maxOrdersPerMonth: 0,
  maxStaffAccounts: 0,

  analyticsAccess: false,
  aiInsightsAccess: false,
  bulkImportAccess: false,
  apiAccess: false,

  features: "",

  isActive: true,
};

export default function AdminSubscriptions() {

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(defaultForm);

  const plansCollection = useMemo(
    () => collection(db, "subscriptionPlans"),
    []
  );

  // =========================
  // Fetch Plans
  // =========================

  const fetchPlans = async () => {

    try {

      setLoading(true);

      const q = query(
        plansCollection,
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPlans(data);

    } catch (error) {

      console.error(error);

      toast.error("Failed to load plans");

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchPlans();

  }, []);

  // =========================
  // Handle Input
  // =========================

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {

    setFormData(defaultForm);

    setEditingId(null);

    setShowForm(false);
  };

  // =========================
  // Save Plan
  // =========================

  const handleSavePlan = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const payload = {

        name: formData.name,
        slug: formData.slug,
        badge: formData.badge,
        description: formData.description,

        priceMonthly: Number(
          formData.priceMonthly
        ),

        priceYearly: Number(
          formData.priceYearly
        ),

        durationDays: Number(
          formData.durationDays
        ),

        trialDays: Number(
          formData.trialDays
        ),

        maxProducts: Number(
          formData.maxProducts
        ),

        maxOrdersPerMonth: Number(
          formData.maxOrdersPerMonth
        ),

        maxStaffAccounts: Number(
          formData.maxStaffAccounts
        ),

        analyticsAccess:
          formData.analyticsAccess,

        aiInsightsAccess:
          formData.aiInsightsAccess,

        bulkImportAccess:
          formData.bulkImportAccess,

        apiAccess:
          formData.apiAccess,

        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),

        isActive: formData.isActive,

        updatedAt: serverTimestamp(),
      };

      if (editingId) {

        await updateDoc(
          doc(db, "subscriptionPlans", editingId),
          payload
        );

        toast.success(
          "Plan updated successfully"
        );

      } else {

        await addDoc(plansCollection, {
          ...payload,
          createdAt: serverTimestamp(),
        });

        toast.success(
          "Plan created successfully"
        );
      }

      resetForm();

      fetchPlans();

    } catch (error) {

      console.error(error);

      toast.error(error.message);

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // Edit
  // =========================

  const handleEdit = (plan) => {

    setEditingId(plan.id);

    setShowForm(true);

    setFormData({
      ...plan,
      features:
        plan.features?.join(", ") || "",
    });
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this subscription plan?"
      );

    if (!confirmDelete) return;

    try {

      await deleteDoc(
        doc(db, "subscriptionPlans", id)
      );

      toast.success("Plan deleted");

      fetchPlans();

    } catch (error) {

      toast.error(error.message);
    }
  };

  // =========================
  // Toggle Status
  // =========================

  const toggleStatus = async (
    id,
    current
  ) => {

    try {

      await updateDoc(
        doc(db, "subscriptionPlans", id),
        {
          isActive: !current,
          updatedAt: serverTimestamp(),
        }
      );

      toast.success(
        `Plan ${
          current
            ? "deactivated"
            : "activated"
        }`
      );

      fetchPlans();

    } catch (error) {

      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-black text-white flex items-center gap-3">

            <CreditCard className="text-violet-400" />

            Subscription Plans

          </h1>

          <p className="text-zinc-400 mt-2">
            Manage SaaS plans, pricing,
            access control and seller subscriptions.
          </p>

        </div>

        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-violet-600 hover:bg-violet-700"
        >

          <Plus className="mr-2 h-4 w-4" />

          Create Plan

        </Button>

      </div>

      {/* Form */}
      {showForm && (

        <Card className="bg-zinc-900 border-zinc-800">

          <CardContent className="p-6">

            <form
              onSubmit={handleSavePlan}
              className="space-y-6"
            >

              {/* Basic */}
              <div>

                <h2 className="text-lg font-semibold mb-4 text-white">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                  <Input
                    name="name"
                    placeholder="Plan Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    name="slug"
                    placeholder="Slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    name="badge"
                    placeholder="Badge"
                    value={formData.badge}
                    onChange={handleChange}
                  />

                  <Input
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Pricing */}
              <div>

                <h2 className="text-lg font-semibold mb-4 text-white">
                  Pricing
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                  <Input
                    name="priceMonthly"
                    type="number"
                    placeholder="Monthly Price"
                    value={formData.priceMonthly}
                    onChange={handleChange}
                  />

                  <Input
                    name="priceYearly"
                    type="number"
                    placeholder="Yearly Price"
                    value={formData.priceYearly}
                    onChange={handleChange}
                  />

                  <Input
                    name="durationDays"
                    type="number"
                    placeholder="Duration Days"
                    value={formData.durationDays}
                    onChange={handleChange}
                  />

                  <Input
                    name="trialDays"
                    type="number"
                    placeholder="Trial Days"
                    value={formData.trialDays}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Limits */}
              <div>

                <h2 className="text-lg font-semibold mb-4 text-white">
                  Usage Limits
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <Input
                    name="maxProducts"
                    type="number"
                    placeholder="Max Products"
                    value={formData.maxProducts}
                    onChange={handleChange}
                  />

                  <Input
                    name="maxOrdersPerMonth"
                    type="number"
                    placeholder="Max Orders"
                    value={formData.maxOrdersPerMonth}
                    onChange={handleChange}
                  />

                  <Input
                    name="maxStaffAccounts"
                    type="number"
                    placeholder="Max Staff Accounts"
                    value={formData.maxStaffAccounts}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Features */}
              <div>

                <h2 className="text-lg font-semibold mb-4 text-white">
                  Features & Permissions
                </h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                  {/* Toggles */}
                  <div className="space-y-3">

                    {[
                      {
                        key: "analyticsAccess",
                        label: "Analytics Access",
                      },
                      {
                        key: "aiInsightsAccess",
                        label: "AI Insights",
                      },
                      {
                        key: "bulkImportAccess",
                        label: "Bulk Import",
                      },
                      {
                        key: "apiAccess",
                        label: "API Access",
                      },
                    ].map((item) => (

                      <label
                        key={item.key}
                        className="flex items-center gap-3 text-sm text-zinc-300"
                      >

                        <input
                          type="checkbox"
                          name={item.key}
                          checked={
                            formData[item.key]
                          }
                          onChange={handleChange}
                        />

                        {item.label}

                      </label>

                    ))}

                    <label className="flex items-center gap-3 text-sm text-zinc-300">

                      <input
                        type="checkbox"
                        name="isActive"
                        checked={
                          formData.isActive
                        }
                        onChange={handleChange}
                      />

                      Active Plan

                    </label>

                  </div>

                  {/* Features */}
                  <div>

                    <textarea
                      name="features"
                      placeholder="Enter features separated by comma"
                      value={formData.features}
                      onChange={handleChange}
                      className="
                        w-full
                        min-h-[140px]
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-950
                        p-4
                        text-sm
                        text-white
                        outline-none
                      "
                    />

                  </div>

                </div>

              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">

                <Button
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700"
                >

                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Plan"
                    : "Create Plan"}

                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >

                  Cancel

                </Button>

              </div>

            </form>

          </CardContent>

        </Card>

      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {plans.map((plan) => (

          <Card
            key={plan.id}
            className="
              bg-zinc-900
              border-zinc-800
              overflow-hidden
              relative
            "
          >

            {/* Badge */}
            {plan.badge && (

              <div className="absolute top-4 right-4 bg-violet-600 text-white text-xs px-3 py-1 rounded-full font-semibold">

                {plan.badge}

              </div>

            )}

            <CardContent className="p-6">

              {/* Header */}
              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-2xl font-black text-white">
                    {plan.name}
                  </h2>

                  <p className="text-zinc-400 mt-2 text-sm">
                    {plan.description}
                  </p>

                </div>

                <div
                  className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${
                      plan.isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }
                  `}
                >

                  {plan.isActive
                    ? "ACTIVE"
                    : "INACTIVE"}

                </div>

              </div>

              {/* Pricing */}
              <div className="mt-6">

                <div className="flex items-end gap-2">

                  <h3 className="text-4xl font-black text-white">
                    ₹{plan.priceMonthly}
                  </h3>

                  <span className="text-zinc-400 mb-1">
                    /month
                  </span>

                </div>

                <p className="text-sm text-zinc-500 mt-1">
                  ₹{plan.priceYearly} yearly
                </p>

              </div>

              {/* Limits */}
              <div className="mt-6 space-y-3">

                <div className="flex items-center gap-3 text-sm text-zinc-300">

                  <Boxes size={16} />

                  {plan.maxProducts} Products

                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-300">

                  <ShoppingCart size={16} />

                  {plan.maxOrdersPerMonth} Orders

                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-300">

                  <Users size={16} />

                  {plan.maxStaffAccounts} Staff Accounts

                </div>

              </div>

              {/* Features */}
              <div className="mt-6 space-y-2">

                {plan.features?.map(
                  (feature, index) => (

                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >

                      <CheckCircle2
                        size={16}
                        className="text-emerald-400"
                      />

                      {feature}

                    </div>
                  )
                )}

              </div>

              {/* Permissions */}
              <div className="mt-6 flex flex-wrap gap-2">

                {plan.analyticsAccess && (
                  <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs">
                    Analytics
                  </div>
                )}

                {plan.aiInsightsAccess && (
                  <div className="bg-violet-500/10 text-violet-400 px-3 py-1 rounded-full text-xs">
                    AI Insights
                  </div>
                )}

                {plan.bulkImportAccess && (
                  <div className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs">
                    Bulk Import
                  </div>
                )}

                {plan.apiAccess && (
                  <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs">
                    API Access
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="mt-8 flex items-center justify-between">

                <button
                  onClick={() =>
                    toggleStatus(
                      plan.id,
                      plan.isActive
                    )
                  }
                  className={`
                    flex items-center gap-2 text-sm font-medium
                    ${
                      plan.isActive
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  `}
                >

                  {plan.isActive ? (
                    <>
                      <XCircle size={16} />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Activate
                    </>
                  )}

                </button>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() =>
                      handleEdit(plan)
                    }
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
                  >

                    <Pencil size={16} />

                  </button>

                  <button
                    onClick={() =>
                      handleDelete(plan.id)
                    }
                    className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
                  >

                    <Trash2 size={16} />

                  </button>

                </div>

              </div>

            </CardContent>

          </Card>

        ))}

      </div>

      {/* Empty */}
      {!loading && plans.length === 0 && (

        <Card className="bg-zinc-900 border-zinc-800">

          <CardContent className="p-20 text-center">

            <Sparkles
              size={52}
              className="mx-auto text-zinc-600"
            />

            <h2 className="text-2xl font-bold text-white mt-6">
              No Subscription Plans
            </h2>

            <p className="text-zinc-400 mt-2">
              Create your first SaaS plan.
            </p>

          </CardContent>

        </Card>

      )}

    </div>
  );
}