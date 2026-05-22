import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";

import KPIGrid from "@/components/admin/KPIGrid";

import { getAdminAnalytics } from "@/components/admin/analyticsService";

import SellerApprovalQueue from "@/components/admin/SellerApprovalQueue";


export default function AdminDashboard() {

  const { userData } = useAuth();

  const [analytics, setAnalytics] =
    useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      const data =
        await getAdminAnalytics();

      setAnalytics(data);
    }

    loadAnalytics();
  }, []);

  if (!analytics) {
    return (
      <div className="p-10 text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <h1 className="text-3xl font-bold">
            SellerOS Admin Command Center
          </h1>

          {/* <p className="text-zinc-400 mt-2">
            Welcome back, {userData?.fullName}
          </p> */}

        </div>

      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto p-6">

        {analytics && (
          <>
            <KPIGrid analytics={analytics} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

              <div>
                <SellerApprovalQueue
                  analytics={analytics}
                />
              </div>

            </div>

          </>
        )}


      </div>


    </div>
  );
}