import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  useEffect,
  useState,
} from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import {
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  Store,
  User,
  XCircle,
  Ban,
  X,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Globe,
  BadgeCheck,
  FileText,
} from "lucide-react";

export default function SellerApprovals() {

  const [sellers, setSellers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedSeller,
    setSelectedSeller] =
    useState(null);

  const [drawerOpen,
    setDrawerOpen] =
    useState(false);

  const openSellerDrawer = (
    seller
  ) => {

    setSelectedSeller(seller);

    setDrawerOpen(true);
  };

  const fetchSellers = async () => {

    try {

      const q = query(
        collection(db, "users"),
        where("role", "==", "seller")
      );

      const snapshot =
        await getDocs(q);

      const sellerList =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setSellers(sellerList);

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to fetch sellers"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const totalSellers =
    sellers.length;

  const approvedSellers =
    sellers.filter(
      (s) => s.isApproved
    ).length;

  const pendingSellers =
    sellers.filter(
      (s) => !s.isApproved
    ).length;

  const filteredSellers =
    sellers.filter((seller) => {

      const matchesSearch =
        seller.businessName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        seller.fullName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "approved"
            ? seller.isApproved
            : !seller.isApproved;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const approveSeller = async (
    sellerId
  ) => {

    try {

      await updateDoc(
        doc(db, "users", sellerId),
        {
          isApproved: true,
          approvalStatus:
            "approved",
        }
      );

      toast.success(
        "Seller approved"
      );

      fetchSellers();

    } catch (error) {

      toast.error(error.message);
    }
  };

  const rejectSeller = async (
    sellerId
  ) => {

    try {

      await updateDoc(
        doc(db, "users", sellerId),
        {
          approvalStatus:
            "rejected",
        }
      );

      toast.success(
        "Seller rejected"
      );

      fetchSellers();

    } catch (error) {

      toast.error(error.message);
    }
  };

  const suspendSeller = async (
    sellerId
  ) => {

    try {

      await updateDoc(
        doc(db, "users", sellerId),
        {
          approvalStatus:
            "suspended",
        }
      );

      toast.success(
        "Seller suspended"
      );

      fetchSellers();

    } catch (error) {

      toast.error(error.message);
    }
  };



  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold">
            Seller Approvals
          </h1>

          <p className="text-zinc-400 mt-2">
            Manage onboarding and verification
          </p>

        </div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total */}
        <Card className="bg-zinc-900 border-zinc-800">

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-zinc-400 text-sm">
                  Total Sellers
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {totalSellers}
                </h2>

              </div>

              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">

                <Store className="text-violet-500" />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* Approved */}
        <Card className="bg-zinc-900 border-zinc-800">

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-zinc-400 text-sm">
                  Approved Sellers
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {approvedSellers}
                </h2>

              </div>

              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">

                <CheckCircle2 className="text-green-500" />

              </div>

            </div>

          </CardContent>

        </Card>

        {/* Pending */}
        <Card className="bg-zinc-900 border-zinc-800">

          <CardContent className="p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-zinc-400 text-sm">
                  Pending Approvals
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {pendingSellers}
                </h2>

              </div>

              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">

                <Clock3 className="text-yellow-500" />

              </div>

            </div>

          </CardContent>

        </Card>

      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

          {/* Search */}
          <div className="flex items-center bg-zinc-800 rounded-xl px-4 h-12 w-full lg:w-[380px]">

            <Search
              size={18}
              className="text-zinc-400"
            />

            <input
              type="text"
              placeholder="Search seller..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="bg-transparent outline-none border-none px-3 text-sm w-full"
            />

          </div>

          {/* Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded-xl h-12 px-4 text-sm outline-none"
          >

            <option value="all">
              All Sellers
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="pending">
              Pending
            </option>

          </select>

        </CardContent>

      </Card>

      {/* Table */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">

        <CardContent className="p-0 overflow-auto">

          <table className="w-full">

            <thead className="bg-zinc-800/80">

              <tr className="text-left text-sm text-zinc-400">

                <th className="p-4">
                  Seller
                </th>

                <th className="p-4">
                  Business
                </th>

                <th className="p-4">
                  Verification
                </th>

                <th className="p-4">
                  Subscription
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredSellers.map(
                (seller) => (

                  <tr
                    key={seller.id}
                    className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
                  >

                    {/* Seller */}
                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center font-bold">

                          {seller.fullName
                            ?.charAt(0)}

                        </div>

                        <div>

                          <p className="font-medium">
                            {seller.fullName}
                          </p>

                          <p className="text-sm text-zinc-400">
                            {seller.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Business */}
                    <td className="p-4">

                      <div>

                        <p className="font-medium">
                          {
                            seller.businessName
                          }
                        </p>

                        <p className="text-sm text-zinc-400">
                          GST:
                          {" "}
                          {seller.gstNo ||
                            "N/A"}
                        </p>

                      </div>

                    </td>

                    {/* Verification */}
                    <td className="p-4">

                      <div className="flex items-center gap-2">

                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">

                          <ShieldCheck size={14} />

                          KYC Verified

                        </span>

                      </div>

                    </td>

                    {/* Subscription */}
                    <td className="p-4">

                      <span className="px-3 py-1 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20">

                        Enterprise

                      </span>

                    </td>

                    {/* Status */}
                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs ${seller.isApproved
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          }`}
                      >

                        {seller.isApproved
                          ? "Approved"
                          : "Pending"}

                      </span>

                    </td>

                    {/* Actions */}
                    <td className="p-4">

                      <div className="flex items-center justify-end gap-2">

                        {!seller.isApproved && (

                          <Button
                            size="sm"
                            onClick={() =>
                              approveSeller(
                                seller.id
                              )
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >

                            Approve

                          </Button>

                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openSellerDrawer(seller)
                          }
                          className="border-zinc-700 hover:bg-zinc-800"
                        >

                          View

                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            rejectSeller(
                              seller.id
                            )
                          }
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >

                          <XCircle size={16} />

                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            suspendSeller(
                              seller.id
                            )
                          }
                          className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                        >

                          <Ban size={16} />

                        </Button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          {/* Empty */}
          {!loading &&
            filteredSellers.length ===
            0 && (

              <div className="p-16 text-center">

                <User className="mx-auto text-zinc-600 mb-4" size={48} />

                <h3 className="text-lg font-semibold">
                  No sellers found
                </h3>

                <p className="text-zinc-500 mt-2">
                  Try changing filters or search query
                </p>

              </div>

            )}

        </CardContent>

      </Card>

      {/* Seller Drawer */}
      {drawerOpen &&
        selectedSeller && (

          <div className="fixed inset-0 z-50 flex justify-end">

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() =>
                setDrawerOpen(false)
              }
            />

            {/* Drawer */}
            <div className="relative w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-800 overflow-y-auto animate-in slide-in-from-right duration-300">

              {/* Header */}
              <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 p-6 flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold">
                    Seller Details
                  </h2>

                  <p className="text-zinc-400 mt-1">
                    Review seller onboarding
                  </p>

                </div>

                <button
                  onClick={() =>
                    setDrawerOpen(false)
                  }
                  className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
                >

                  <X size={20} />

                </button>

              </div>

              {/* Content */}
              <div className="p-6 space-y-6">

                {/* Profile */}
                <Card className="bg-zinc-900 border-zinc-800">

                  <CardContent className="p-6">

                    <div className="flex items-start gap-4">

                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold">

                        {selectedSeller.fullName?.charAt(0)}

                      </div>

                      <div className="flex-1">

                        <div className="flex items-center gap-2">

                          <h3 className="text-2xl font-bold">

                            {selectedSeller.fullName}

                          </h3>

                          <BadgeCheck
                            className="text-green-500"
                            size={20}
                          />

                        </div>

                        <p className="text-zinc-400 mt-1">

                          {selectedSeller.businessName}

                        </p>

                        {/* Status */}
                        <div className="flex flex-wrap gap-2 mt-4">

                          <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">

                            KYC Verified

                          </span>

                          <span className="px-3 py-1 rounded-full text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20">

                            Enterprise Plan

                          </span>

                          <span className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">

                            92% Onboarding
                          </span>

                        </div>

                      </div>

                    </div>

                  </CardContent>

                </Card>

                {/* Contact */}
                <Card className="bg-zinc-900 border-zinc-800">

                  <CardContent className="p-6">

                    <h3 className="font-semibold mb-5">
                      Contact Information
                    </h3>

                    <div className="space-y-4">

                      <div className="flex items-center gap-3">

                        <Mail
                          size={18}
                          className="text-zinc-400"
                        />

                        <span>
                          {selectedSeller.email}
                        </span>

                      </div>

                      <div className="flex items-center gap-3">

                        <Phone
                          size={18}
                          className="text-zinc-400"
                        />

                        <span>
                          {selectedSeller.phone ||
                            "Not Available"}
                        </span>

                      </div>

                      <div className="flex items-center gap-3">

                        <MapPin
                          size={18}
                          className="text-zinc-400"
                        />

                        <span>
                          {selectedSeller.address ||
                            "Address not provided"}
                        </span>

                      </div>

                    </div>

                  </CardContent>

                </Card>

                {/* Business */}
                <Card className="bg-zinc-900 border-zinc-800">

                  <CardContent className="p-6">

                    <h3 className="font-semibold mb-5">
                      Business Information
                    </h3>

                    <div className="grid grid-cols-2 gap-5">

                      <div>

                        <p className="text-zinc-500 text-sm">
                          GST Number
                        </p>

                        <p className="mt-1 font-medium">
                          {selectedSeller.gstNo ||
                            "N/A"}
                        </p>

                      </div>

                      <div>

                        <p className="text-zinc-500 text-sm">
                          PAN Number
                        </p>

                        <p className="mt-1 font-medium">
                          {selectedSeller.panNo ||
                            "N/A"}
                        </p>

                      </div>

                      <div>

                        <p className="text-zinc-500 text-sm">
                          Subscription
                        </p>

                        <p className="mt-1 font-medium">
                          Enterprise
                        </p>

                      </div>

                      <div>

                        <p className="text-zinc-500 text-sm">
                          Joined
                        </p>

                        <p className="mt-1 font-medium">
                          Jan 2026
                        </p>

                      </div>

                    </div>

                  </CardContent>

                </Card>

                {/* Marketplace */}
                <Card className="bg-zinc-900 border-zinc-800">

                  <CardContent className="p-6">

                    <h3 className="font-semibold mb-5">
                      Marketplace Connections
                    </h3>

                    <div className="flex flex-wrap gap-3">

                      <span className="px-4 py-2 rounded-xl bg-zinc-800 text-sm">

                        Amazon

                      </span>

                      <span className="px-4 py-2 rounded-xl bg-zinc-800 text-sm">

                        Flipkart

                      </span>

                      <span className="px-4 py-2 rounded-xl bg-zinc-800 text-sm">

                        Meesho

                      </span>

                    </div>

                  </CardContent>

                </Card>

                {/* Revenue Stats */}
                <div className="grid grid-cols-2 gap-4">

                  <Card className="bg-zinc-900 border-zinc-800">

                    <CardContent className="p-5">

                      <p className="text-zinc-400 text-sm">
                        Monthly Revenue
                      </p>

                      <h3 className="text-2xl font-bold mt-2">
                        ₹1.2L
                      </h3>

                    </CardContent>

                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800">

                    <CardContent className="p-5">

                      <p className="text-zinc-400 text-sm">
                        Total Orders
                      </p>

                      <h3 className="text-2xl font-bold mt-2">
                        1,248
                      </h3>

                    </CardContent>

                  </Card>

                </div>

                {/* Timeline */}
                <Card className="bg-zinc-900 border-zinc-800">

                  <CardContent className="p-6">

                    <h3 className="font-semibold mb-5">
                      Approval Timeline
                    </h3>

                    <div className="space-y-5">

                      <div className="flex gap-4">

                        <div className="w-3 h-3 rounded-full bg-green-500 mt-2" />

                        <div>

                          <p className="font-medium">
                            Account Created
                          </p>

                          <p className="text-sm text-zinc-500 mt-1">
                            Seller registered successfully
                          </p>

                        </div>

                      </div>

                      <div className="flex gap-4">

                        <div className="w-3 h-3 rounded-full bg-yellow-500 mt-2" />

                        <div>

                          <p className="font-medium">
                            KYC Submitted
                          </p>

                          <p className="text-sm text-zinc-500 mt-1">
                            Awaiting admin verification
                          </p>

                        </div>

                      </div>

                    </div>

                  </CardContent>

                </Card>

              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-zinc-950 border-t border-zinc-800 p-6 flex items-center justify-end gap-3">

                {!selectedSeller.isApproved && (

                  <Button
                    onClick={() =>
                      approveSeller(
                        selectedSeller.id
                      )
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >

                    Approve Seller

                  </Button>

                )}

                <Button
                  variant="outline"
                  onClick={() =>
                    rejectSeller(
                      selectedSeller.id
                    )
                  }
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >

                  Reject

                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    suspendSeller(
                      selectedSeller.id
                    )
                  }
                  className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                >

                  Suspend

                </Button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}