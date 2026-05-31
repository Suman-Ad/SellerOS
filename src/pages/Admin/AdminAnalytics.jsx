import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";

import KPIGrid from "@/components/admin/KPIGrid";

import { getAdminAnalytics } from "@/components/admin/analyticsService";

import RevenueOverview from "@/components/admin/RevenueOverview";

import RevenueChart from "@/components/admin/RevenueChart";

import OrderAnalytics from "@/components/admin/OrderAnalytics";

import SellerApprovalQueue from "@/components/admin/SellerApprovalQueue";

import TopSellerLeaderboard from "@/components/admin/TopSellerLeaderboard";

import RiskAlerts from "@/components/admin/RiskAlerts";

import ActivityFeed from "@/components/admin/ActivityFeed";

import QuickActions from "@/components/admin/QuickActions";

import SystemStatus from "@/components/admin/SystemStatus";

import RevenueTrendChart from "@/components/admin/RevenueTrendChart";

import OrderStatusChart from "@/components/admin/OrderStatusChart";

import CategoryAnalytics from "@/components/admin/CategoryAnalytics";

import BusinessInsights from "@/components/admin/BusinessInsights";

import RecentPayments
  from "@/components/admin/RecentPayments";

export default function AdminAnalytics() {

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
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <h1 className="text-3xl font-bold">
            SellerOS Admin Analytics Center
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

            <div className="mt-8">
              <RevenueOverview analytics={analytics} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

              <div className="xl:col-span-2">
                <RevenueChart
                  analytics={analytics}
                />
              </div>

              <div className="mt-8">

                <RecentPayments
                  payments={
                    analytics.recentPayments
                  }
                />

              </div>

              <div>
                <OrderAnalytics analytics={analytics} />
              </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

              <div>
                <SellerApprovalQueue
                  analytics={analytics}
                />
              </div>

              <div>
                <TopSellerLeaderboard />
              </div>

              <div>
                <RiskAlerts />
              </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

              <div className="xl:col-span-2">
                <ActivityFeed />
              </div>

              <div>
                <QuickActions />
              </div>

            </div>

            <div className="mt-8">

              <SystemStatus />

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">

              <div className="xl:col-span-2">
                <RevenueTrendChart
                  analytics={analytics}
                />
              </div>

              <div>
                <OrderStatusChart
                  analytics={analytics}
                />
              </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

              <CategoryAnalytics
                analytics={analytics}
              />

              <BusinessInsights />

            </div>
          </>
        )}


      </div>


    </div>
  );
}