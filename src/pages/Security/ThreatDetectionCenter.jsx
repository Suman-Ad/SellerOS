import { useEffect, useState } from "react";

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

import { db }
from "@/firebase/config";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Activity,
  Lock,
  Clock3,
} from "lucide-react";

import { toast }
from "sonner";

export default function ThreatDetectionCenter() {

  const [alerts,
    setAlerts] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  // ========================================
  // Fetch Alerts
  // ========================================

  useEffect(() => {

    const fetchAlerts =
      async () => {

        try {

          const q = query(
            collection(
              db,
              "securityAlerts"
            ),
            orderBy(
              "createdAt",
              "desc"
            ),
            limit(50)
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

          setAlerts(data);

        } catch (error) {

          console.error(error);

          toast.error(
            "Failed to load threat alerts"
          );

        } finally {

          setLoading(false);
        }
      };

    fetchAlerts();

  }, []);

  // ========================================
  // Severity Color
  // ========================================

  const getSeverityColor =
    (severity) => {

      switch (severity) {

        case "critical":
          return "bg-red-500/10 text-red-400";

        case "high":
          return "bg-orange-500/10 text-orange-400";

        case "medium":
          return "bg-yellow-500/10 text-yellow-400";

        default:
          return "bg-emerald-500/10 text-emerald-400";
      }
    };

  return (

    <div className="
      min-h-screen
      bg-zinc-950
      text-white
      p-6
    ">

      <div className="
        max-w-7xl
        mx-auto
        space-y-8
      ">

        {/* Header */}
        <div>

          <div className="
            inline-flex
            items-center
            gap-3
            bg-red-500/10
            border
            border-red-500/20
            rounded-full
            px-5 py-2
            text-red-300
            mb-5
          ">

            <ShieldAlert
              size={18}
            />

            SellerOS SOC

          </div>

          <h1 className="
            text-5xl
            font-black
          ">

            Threat Detection Center

          </h1>

          <p className="
            text-zinc-400
            mt-4 text-lg
          ">

            Monitor security threats,
            account takeovers,
            brute-force attacks
            and suspicious activities.

          </p>

        </div>

        {/* Stats */}
        <div className="
          grid grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
        ">

          <SecurityCard
            icon={
              <AlertTriangle />
            }
            label="Critical Threats"
            value={
              alerts.filter(
                (a) =>
                  a.severity ===
                  "critical"
              ).length
            }
          />

          <SecurityCard
            icon={<Lock />}
            label="Brute Force"
            value={
              alerts.filter(
                (a) =>
                  a.type ===
                  "brute_force"
              ).length
            }
          />

          <SecurityCard
            icon={<Globe />}
            label="Suspicious IPs"
            value={
              alerts.filter(
                (a) =>
                  a.type ===
                  "suspicious_ip"
              ).length
            }
          />

          <SecurityCard
            icon={
              <ShieldCheck />
            }
            label="Resolved"
            value={
              alerts.filter(
                (a) =>
                  a.resolved
              ).length
            }
          />

        </div>

        {/* Alerts */}
        <Card className="
          bg-zinc-900
          border-zinc-800
        ">

          <CardContent className="
            p-0
          ">

            <div className="
              border-b
              border-zinc-800
              px-8 py-6
            ">

              <h2 className="
                text-2xl
                font-black
              ">

                Security Alerts

              </h2>

            </div>

            {loading ? (

              <div className="
                p-20
                text-center
                text-zinc-400
              ">

                Loading alerts...

              </div>

            ) : alerts.length ===
              0 ? (

              <div className="
                p-20
                text-center
              ">

                <ShieldCheck
                  size={60}
                  className="
                    mx-auto
                    text-emerald-400
                  "
                />

                <h3 className="
                  text-3xl
                  font-bold
                  mt-6
                ">

                  No Threats Detected

                </h3>

              </div>

            ) : (

              <div className="
                divide-y
                divide-zinc-800
              ">

                {alerts.map(
                  (alert) => (

                    <div
                      key={
                        alert.id
                      }
                      className="
                        px-8 py-6
                        flex flex-col
                        xl:flex-row
                        xl:items-center
                        justify-between
                        gap-6
                      "
                    >

                      <div>

                        <div className="
                          flex flex-wrap
                          items-center
                          gap-3
                        ">

                          <h3 className="
                            text-xl
                            font-bold
                          ">

                            {
                              alert.title
                            }

                          </h3>

                          <div className={`
                            px-3 py-1
                            rounded-full
                            text-xs
                            uppercase
                            ${getSeverityColor(
                              alert.severity
                            )}
                          `}>

                            {
                              alert.severity
                            }

                          </div>

                        </div>

                        <p className="
                          text-zinc-400
                          mt-2
                        ">

                          {
                            alert.description
                          }

                        </p>

                      </div>

                      <div className="
                        flex items-center
                        gap-2
                        text-zinc-500
                        text-sm
                      ">

                        <Clock3
                          size={14}
                        />

                        {alert.createdAt
                          ?.toDate?.()
                          ?.toLocaleString()}

                      </div>

                    </div>
                  )
                )}

              </div>

            )}

          </CardContent>

        </Card>

      </div>

    </div>
  );
}

function SecurityCard({

  icon,

  label,

  value,
}) {

  return (

    <Card className="
      bg-zinc-900
      border-zinc-800
    ">

      <CardContent className="
        p-6
      ">

        <div className="
          flex items-center
          justify-between
        ">

          <div>

            <p className="
              text-zinc-400
            ">

              {label}

            </p>

            <h3 className="
              text-4xl
              font-black
              mt-3
            ">

              {value}

            </h3>

          </div>

          <div className="
            w-14 h-14
            rounded-2xl
            bg-red-500/10
            text-red-400
            flex items-center
            justify-center
          ">

            {icon}

          </div>

        </div>

      </CardContent>

    </Card>
  );
}