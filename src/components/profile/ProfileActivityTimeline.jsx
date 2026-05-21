import { useEffect, useState } from "react";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Activity,
  LogIn,
  CreditCard,
  Crown,
  Package,
  ShoppingCart,
  ShieldCheck,
  User,
  Clock3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { toast } from "sonner";

export default function ProfileActivityTimeline({
  user,
}) {

  const [activities,
    setActivities] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  // ========================================
  // Fetch Activities
  // ========================================

  useEffect(() => {

    const fetchActivities =
      async () => {

        try {

          const q = query(
            collection(
              db,
              "activityLogs"
            ),
            where(
              "uid",
              "==",
              user.uid
            ),
            orderBy(
              "createdAt",
              "desc"
            ),
            limit(30)
          );

          const snapshot =
            await getDocs(q);

          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setActivities(data);

        } catch (error) {

          console.error(error);

          toast.error(
            "Failed to load activity timeline"
          );

        } finally {

          setLoading(false);
        }
      };

    if (user?.uid) {

      fetchActivities();
    }

  }, [user]);

  // ========================================
  // Activity UI
  // ========================================

  const getActivityUI =
    (type) => {

      switch (type) {

        case "login":
          return {
            icon: (
              <LogIn size={18} />
            ),
            color:
              "bg-blue-500/10 text-blue-400",
          };

        case "subscription_upgrade":
          return {
            icon: (
              <Crown size={18} />
            ),
            color:
              "bg-violet-500/10 text-violet-400",
          };

        case "payment":
          return {
            icon: (
              <CreditCard
                size={18}
              />
            ),
            color:
              "bg-emerald-500/10 text-emerald-400",
          };

        case "product_upload":
          return {
            icon: (
              <Package
                size={18}
              />
            ),
            color:
              "bg-orange-500/10 text-orange-400",
          };

        case "order_created":
          return {
            icon: (
              <ShoppingCart
                size={18}
              />
            ),
            color:
              "bg-pink-500/10 text-pink-400",
          };

        case "security":
          return {
            icon: (
              <ShieldCheck
                size={18}
              />
            ),
            color:
              "bg-red-500/10 text-red-400",
          };

        default:
          return {
            icon: (
              <Activity
                size={18}
              />
            ),
            color:
              "bg-zinc-700 text-zinc-300",
          };
      }
    };

  return (

    <Card className="
      bg-zinc-900
      border-zinc-800
      overflow-hidden
    ">

      <CardContent className="
        p-0
      ">

        {/* Header */}
        <div className="
          border-b
          border-zinc-800
          px-8 py-6
          flex items-center
          justify-between
        ">

          <div className="
            flex items-center
            gap-4
          ">

            <div className="
              w-14 h-14
              rounded-2xl
              bg-violet-500/10
              flex items-center
              justify-center
              text-violet-400
            ">

              <Activity size={28} />

            </div>

            <div>

              <h2 className="
                text-2xl
                font-black
                text-white
              ">

                Activity Timeline

              </h2>

              <p className="
                text-zinc-400
                mt-1
              ">

                Recent account and business activities

              </p>

            </div>

          </div>

        </div>

        {/* Loading */}
        {loading ? (

          <div className="
            p-16
            text-center
            text-zinc-400
          ">

            Loading activities...

          </div>

        ) : activities.length === 0 ? (

          /* Empty */
          <div className="
            p-20
            text-center
          ">

            <Clock3
              size={60}
              className="
                mx-auto
                text-zinc-600
              "
            />

            <h3 className="
              text-2xl
              font-bold
              text-white
              mt-6
            ">

              No Activity Found

            </h3>

            <p className="
              text-zinc-400
              mt-3
            ">

              Your account activity will appear here.

            </p>

          </div>

        ) : (

          /* Timeline */
          <div className="
            relative
          ">

            {/* Vertical Line */}
            <div className="
              absolute
              left-12
              top-0
              bottom-0
              w-px
              bg-zinc-800
            " />

            <div className="
              divide-y
              divide-zinc-800
            ">

              {activities.map(
                (activity) => {

                  const ui =
                    getActivityUI(
                      activity.type
                    );

                  return (

                    <div
                      key={
                        activity.id
                      }
                      className="
                        relative
                        flex
                        gap-6
                        px-8 py-6
                      "
                    >

                      {/* Icon */}
                      <div
                        className={`
                          relative z-10
                          w-10 h-10
                          rounded-xl
                          flex items-center
                          justify-center
                          ${ui.color}
                        `}
                      >

                        {ui.icon}

                      </div>

                      {/* Content */}
                      <div className="
                        flex-1
                      ">

                        <div className="
                          flex flex-col
                          lg:flex-row
                          lg:items-center
                          justify-between
                          gap-3
                        ">

                          <div>

                            <h3 className="
                              text-lg
                              font-semibold
                              text-white
                            ">

                              {
                                activity.title
                              }

                            </h3>

                            <p className="
                              text-zinc-400
                              mt-1
                            ">

                              {
                                activity.description
                              }

                            </p>

                          </div>

                          {/* Time */}
                          <div className="
                            flex items-center
                            gap-2
                            text-sm
                            text-zinc-500
                            whitespace-nowrap
                          ">

                            <Clock3
                              size={14}
                            />

                            {activity.createdAt
                              ?.toDate?.()
                              ?.toLocaleString()}

                          </div>

                        </div>

                        {/* Meta */}
                        {activity.meta && (

                          <div className="
                            flex flex-wrap
                            gap-3
                            mt-5
                          ">

                            {Object.entries(
                              activity.meta
                            ).map(
                              (
                                [
                                  key,
                                  value,
                                ]
                              ) => (

                                <div
                                  key={key}
                                  className="
                                    px-4 py-2
                                    rounded-xl
                                    bg-zinc-950
                                    border
                                    border-zinc-800
                                    text-sm
                                  "
                                >

                                  <span className="
                                    text-zinc-500
                                  ">

                                    {key}:

                                  </span>

                                  <span className="
                                    ml-2
                                    text-white
                                  ">

                                    {
                                      value
                                    }

                                  </span>

                                </div>
                              )
                            )}

                          </div>

                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        )}

      </CardContent>

    </Card>
  );
}