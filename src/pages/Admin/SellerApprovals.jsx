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

export default function SellerApprovals() {

  const [sellers, setSellers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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

  return (
    <div>

      <div className="mb-6">

        <h1 className="text-3xl font-bold">
          Seller Approvals
        </h1>

        <p className="text-zinc-400 mt-2">
          Manage seller onboarding
        </p>

      </div>

      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-0 overflow-auto">

          <table className="w-full">

            <thead className="bg-zinc-800">

              <tr className="text-left">

                <th className="p-4">
                  Business
                </th>

                <th className="p-4">
                  Owner
                </th>

                <th className="p-4">
                  Email
                </th>

                <th className="p-4">
                  GST
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {sellers.map((seller) => (

                <tr
                  key={seller.id}
                  className="border-t border-zinc-800"
                >

                  <td className="p-4">
                    {seller.businessName}
                  </td>

                  <td className="p-4">
                    {seller.fullName}
                  </td>

                  <td className="p-4">
                    {seller.email}
                  </td>

                  <td className="p-4">
                    {seller.gstNo || "-"}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        seller.isApproved
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {seller.isApproved
                        ? "Approved"
                        : "Pending"}
                    </span>

                  </td>

                  <td className="p-4">

                    {!seller.isApproved && (

                      <Button
                        size="sm"
                        onClick={() =>
                          approveSeller(
                            seller.id
                          )
                        }
                      >
                        Approve
                      </Button>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {!loading &&
            sellers.length === 0 && (

              <div className="p-10 text-center text-zinc-400">

                No sellers found

              </div>

            )}

        </CardContent>

      </Card>

    </div>
  );
}