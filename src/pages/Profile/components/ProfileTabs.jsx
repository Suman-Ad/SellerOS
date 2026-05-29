import {
  useState,
} from "react";

import {
  User,
  Building2,
  ShieldCheck,
  Lock,
  Activity,
  Crown,
} from "lucide-react";

import OverviewTab
from "../tabs/OverviewTab";

import BusinessTab
from "../tabs/BusinessTab";

import ComplianceTab
from "../tabs/ComplianceTab";

import SecurityTab
from "../tabs/SecurityTab";

import ActivityTab
from "../tabs/ActivityTab";

import SubscriptionTab
from "../tabs/SubscriptionTab";

export default function ProfileTabs({
  user,
  userData,
}) {

  const [activeTab,
    setActiveTab] =
    useState("overview");

  // ========================================
  // TABS
  // ========================================

  const tabs = [

    {
      id: "overview",

      label: "Overview",

      icon:
        <User size={16} />,
    },

    {
      id: "business",

      label: "Business",

      icon:
        <Building2 size={16} />,
    },

    {
      id: "compliance",

      label: "Compliance",

      icon:
        <ShieldCheck size={16} />,
    },

    {
      id: "security",

      label: "Security",

      icon:
        <Lock size={16} />,
    },

    {
      id: "activity",

      label: "Activity",

      icon:
        <Activity size={16} />,
    },

    {
      id: "subscription",

      label: "Subscription",

      icon:
        <Crown size={16} />,
    },
  ];

  // ========================================
  // TAB CONTENT
  // ========================================

  const renderTab =
    () => {

      switch (activeTab) {

        case "overview":

          return (
            <OverviewTab
              user={user}
              userData={userData}
            />
          );

        case "business":

          return (
            <BusinessTab
              user={user}
              userData={userData}
            />
          );

        case "compliance":

          return (
            <ComplianceTab
              user={user}
              userData={userData}
            />
          );

        case "security":

          return (
            <SecurityTab
              user={user}
              userData={userData}
            />
          );

        case "activity":

          return (
            <ActivityTab
              user={user}
              userData={userData}
            />
          );

        case "subscription":

          return (
            <SubscriptionTab
              user={user}
              userData={userData}
            />
          );

        default:

          return null;
      }
    };

  return (

    <div>

      {/* ========================================
         TAB NAVIGATION
      ======================================== */}

      <div className="
        flex
        flex-wrap
        gap-3
        mb-6
      ">

        {tabs.map((tab) => (

          <button
            key={tab.id}

            onClick={() =>
              setActiveTab(
                tab.id
              )
            }

            className={`
              h-11
              px-5
              rounded-2xl
              border
              transition-all
              flex
              items-center
              gap-2
              text-sm
              font-semibold

              ${activeTab === tab.id

                ? `
                  bg-violet-600
                  border-violet-500
                  text-white
                `

                : `
                  bg-zinc-900
                  border-zinc-800
                  text-zinc-400
                  hover:bg-zinc-800
                `
              }
            `}
          >

            {tab.icon}

            {tab.label}

          </button>
        ))}

      </div>

      {/* ========================================
         TAB CONTENT
      ======================================== */}

      <div>

        {renderTab()}

      </div>

    </div>
  );
}