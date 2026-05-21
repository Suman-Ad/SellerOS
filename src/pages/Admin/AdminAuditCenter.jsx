import { useEffect, useMemo, useState } from "react";

import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  ShieldCheck,
  Search,
  RefreshCw,
  Activity,
  LogIn,
  CreditCard,
  Crown,
  Package,
  ShoppingCart,
  AlertTriangle,
  Users,
  Clock3,
  Download,
  Filter,
} from "lucide-react";

import { toast } from "sonner";

export default function AdminAuditCenter() {

  const [logs, setLogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [typeFilter,
    setTypeFilter] =
    useState("all");

  // ========================================
  // Fetch Logs
  // ========================================

  const fetchLogs = async () => {

    try {

      setLoading(true);

      const q = query(
        collection(
          db,
          "activityLogs"
        ),
        orderBy(
          "createdAt",
          "desc"
        ),
        limit(200)
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

      setLogs(data);

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to load audit logs"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchLogs();

  }, []);

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

        case "admin_action":
          return {
            icon: (
              <Users size={18} />
            ),
            color:
              "bg-cyan-500/10 text-cyan-400",
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

  // ========================================
  // Filtered Logs
  // ========================================

  const filteredLogs =
    useMemo(() => {

      return logs.filter(
        (log) => {

          const searchText =
            search.toLowerCase();

          const matchesSearch =
            log.title
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            log.description
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            log.uid
              ?.toLowerCase()
              .includes(
                searchText
              );

          const matchesType =
            typeFilter ===
              "all" ||
            log.type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );

    }, [
      logs,
      search,
      typeFilter,
    ]);

  // ========================================
  // Export CSV
  // ========================================

  const handleExportCSV =
    () => {

      try {

        const headers = [
          "Type",
          "Title",
          "Description",
          "UID",
          "Date",
        ];

        const rows =
          filteredLogs.map(
            (log) => [

              log.type,

              log.title,

              log.description,

              log.uid,

              log.createdAt
                ?.toDate?.()
                ?.toLocaleString(),
            ]
          );

        const csvContent =
          [
            headers.join(","),

            ...rows.map(
              (row) =>
                row.join(",")
            ),
          ].join("\n");

        const blob =
          new Blob(
            [csvContent],
            {
              type: "text/csv",
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const a =
          document.createElement(
            "a"
          );

        a.href = url;

        a.download =
          "audit_logs.csv";

        a.click();

        URL.revokeObjectURL(
          url
        );

        toast.success(
          "Audit logs exported"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Export failed"
        );
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
        <div className="
          flex flex-col
          lg:flex-row
          lg:items-center
          justify-between
          gap-6
        ">

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

              <ShieldCheck
                size={18}
              />

              SellerOS Audit Center

            </div>

            <h1 className="
              text-5xl
              font-black
            ">

              Admin Audit Center

            </h1>

            <p className="
              text-zinc-400
              mt-4 text-lg
            ">

              Monitor platform activity,
              security events and
              enterprise audit logs.

            </p>

          </div>

          <div className="
            flex items-center
            gap-4
          ">

            <Button
              onClick={
                fetchLogs
              }
              className="
                bg-zinc-800
                hover:bg-zinc-700
              "
            >

              <RefreshCw
                className="
                  mr-2
                  h-4 w-4
                "
              />

              Refresh

            </Button>

            <Button
              onClick={
                handleExportCSV
              }
              className="
                bg-violet-600
                hover:bg-violet-700
              "
            >

              <Download
                className="
                  mr-2
                  h-4 w-4
                "
              />

              Export CSV

            </Button>

          </div>

        </div>

        {/* Filters */}
        <Card className="
          bg-zinc-900
          border-zinc-800
        ">

          <CardContent className="
            p-6
          ">

            <div className="
              grid grid-cols-1
              lg:grid-cols-3
              gap-5
            ">

              {/* Search */}
              <div className="
                relative
              ">

                <Search
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-zinc-500
                  "
                />

                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="
                    h-12
                    pl-12
                    bg-zinc-950
                    border-zinc-800
                  "
                />

              </div>

              {/* Filter */}
              <div className="
                relative
              ">

                <Filter
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-zinc-500
                  "
                />

                <select
                  value={
                    typeFilter
                  }
                  onChange={(e) =>
                    setTypeFilter(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    h-12
                    pl-12
                    rounded-xl
                    bg-zinc-950
                    border
                    border-zinc-800
                    text-white
                    outline-none
                  "
                >

                  <option value="all">
                    All Activities
                  </option>

                  <option value="login">
                    Login
                  </option>

                  <option value="payment">
                    Payment
                  </option>

                  <option value="subscription_upgrade">
                    Subscription
                  </option>

                  <option value="product_upload">
                    Products
                  </option>

                  <option value="security">
                    Security
                  </option>

                  <option value="admin_action">
                    Admin Actions
                  </option>

                </select>

              </div>

              {/* Stats */}
              <div className="
                flex items-center
                justify-center
                rounded-2xl
                bg-zinc-950
                border
                border-zinc-800
                text-lg
                font-semibold
              ">

                Total Logs:
                {" "}
                {filteredLogs.length}

              </div>

            </div>

          </CardContent>

        </Card>

        {/* Timeline */}
        <Card className="
          bg-zinc-900
          border-zinc-800
          overflow-hidden
        ">

          <CardContent className="
            p-0
          ">

            {loading ? (

              <div className="
                p-20
                text-center
                text-zinc-400
              ">

                Loading audit logs...

              </div>

            ) : filteredLogs.length === 0 ? (

              <div className="
                p-20
                text-center
              ">

                <AlertTriangle
                  size={60}
                  className="
                    mx-auto
                    text-zinc-600
                  "
                />

                <h3 className="
                  text-3xl
                  font-bold
                  mt-6
                ">

                  No Audit Logs

                </h3>

                <p className="
                  text-zinc-400
                  mt-3
                ">

                  No activity logs found.

                </p>

              </div>

            ) : (

              <div className="
                divide-y
                divide-zinc-800
              ">

                {filteredLogs.map(
                  (log) => {

                    const ui =
                      getActivityUI(
                        log.type
                      );

                    return (

                      <div
                        key={
                          log.id
                        }
                        className="
                          flex flex-col
                          xl:flex-row
                          xl:items-center
                          justify-between
                          gap-6
                          px-8 py-6
                        "
                      >

                        {/* Left */}
                        <div className="
                          flex gap-5
                        ">

                          <div
                            className={`
                              w-14 h-14
                              rounded-2xl
                              flex items-center
                              justify-center
                              ${ui.color}
                            `}
                          >

                            {ui.icon}

                          </div>

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
                                  log.title
                                }

                              </h3>

                              <div className="
                                px-3 py-1
                                rounded-full
                                bg-zinc-800
                                text-xs
                                uppercase
                              ">

                                {
                                  log.type
                                }

                              </div>

                            </div>

                            <p className="
                              text-zinc-400
                              mt-2
                            ">

                              {
                                log.description
                              }

                            </p>

                            {/* Meta */}
                            {log.meta && (

                              <div className="
                                flex flex-wrap
                                gap-3 mt-5
                              ">

                                {Object.entries(
                                  log.meta
                                ).map(
                                  (
                                    [
                                      key,
                                      value,
                                    ]
                                  ) => (

                                    <div
                                      key={
                                        key
                                      }
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

                        {/* Right */}
                        <div className="
                          flex flex-col
                          xl:items-end
                          gap-3
                        ">

                          <div className="
                            flex items-center
                            gap-2
                            text-zinc-500
                            text-sm
                          ">

                            <Clock3
                              size={14}
                            />

                            {log.createdAt
                              ?.toDate?.()
                              ?.toLocaleString()}

                          </div>

                          <div className="
                            text-xs
                            text-zinc-600
                            break-all
                            max-w-xs
                          ">

                            UID:
                            {" "}
                            {log.uid}

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </CardContent>

        </Card>

      </div>

    </div>
  );
}