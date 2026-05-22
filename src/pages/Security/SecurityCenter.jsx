import { useEffect, useMemo, useState } from "react";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import {
  signOut,
} from "firebase/auth";

import {
  db,
  auth,
} from "@/firebase/config";

import { useAuth }
from "@/context/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button }
from "@/components/ui/button";

import { Input }
from "@/components/ui/input";

import {

  ShieldCheck,

  AlertTriangle,

  Smartphone,

  Monitor,

  Globe,

  Clock3,

  Search,

  RefreshCw,

  Lock,

  LogOut,

  Activity,

  CheckCircle2,

} from "lucide-react";

import { toast }
from "sonner";

import revokeSession
from "@/utils/security/revokeSession";

import logActivity
from "@/utils/activity/logActivity";

export default function SecurityCenter() {

  const { user, userData } =
    useAuth();

  const [loading,
    setLoading] =
    useState(true);

  const [sessions,
    setSessions] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  // ========================================
  // Fetch Sessions
  // ========================================

  const fetchSessions =
    async () => {

      try {

        setLoading(true);

        const q = query(
          collection(
            db,
            "loginSessions"
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

        setSessions(data);

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load sessions"
        );

      } finally {

        setLoading(false);
      }
    };

  // ========================================
  // Init
  // ========================================

  useEffect(() => {

    if (user?.uid) {

      fetchSessions();
    }

  }, [user]);

  // ========================================
  // Logout All Devices
  // ========================================

  const handleLogoutAll =
    async () => {

      try {

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {

            forceLogout:
              true,

            securityUpdatedAt:
              serverTimestamp(),
          }
        );

        await logActivity({

          uid: user.uid,

          type: "security",

          title:
            "Logout All Devices",

          description:
            "User logged out from all active devices",

          meta: {
            action:
              "force_logout",
          },
        });

        toast.success(
          "Logged out from all devices"
        );

        await signOut(auth);

      } catch (error) {

        console.error(error);

        toast.error(
          error.message
        );
      }
    };

  // ========================================
  // Revoke Session
  // ========================================

  const handleRevokeSession =
    async (sessionId) => {

      try {

        const success =
          await revokeSession(
            sessionId
          );

        if (!success) {

          return toast.error(
            "Failed to revoke session"
          );
        }

        toast.success(
          "Session revoked"
        );

        fetchSessions();

      } catch (error) {

        console.error(error);

        toast.error(
          error.message
        );
      }
    };

  // ========================================
  // Filter Sessions
  // ========================================

  const filteredSessions =
    useMemo(() => {

      return sessions.filter(
        (session) => {

          const text =
            search.toLowerCase();

          return (

            session.browser
              ?.toLowerCase()
              .includes(text)

            ||

            session.device
              ?.toLowerCase()
              .includes(text)

            ||

            session.location
              ?.toLowerCase()
              .includes(text)

            ||

            session.ip
              ?.toLowerCase()
              .includes(text)

          );
        }
      );

    }, [
      sessions,
      search,
    ]);

  // ========================================
  // Suspicious Sessions
  // ========================================

  const suspiciousSessions =
    sessions.filter(
      (session) =>
        session.isSuspicious
    );

  // ========================================
  // Device Icon
  // ========================================

  const getDeviceIcon =
    (device) => {

      if (
        device
          ?.toLowerCase()
          .includes("mobile")
      ) {

        return (
          <Smartphone
            size={22}
          />
        );
      }

      return (
        <Monitor
          size={22}
        />
      );
    };

  // ========================================
  // Loading
  // ========================================

  if (!userData) {

    return (

      <div className="
        min-h-screen
        bg-zinc-950
        flex items-center
        justify-center
        text-zinc-400
      ">

        Loading Security Center...

      </div>
    );
  }

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

              SellerOS Security

            </div>

            <h1 className="
              text-5xl
              font-black
            ">

              Security Center

            </h1>

            <p className="
              text-zinc-400
              mt-4 text-lg
            ">

              Manage sessions,
              suspicious devices,
              and enterprise account security.

            </p>

          </div>

          <div className="
            flex items-center
            gap-4
          ">

            <Button
              onClick={
                fetchSessions
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
                handleLogoutAll
              }
              className="
                bg-red-600
                hover:bg-red-700
              "
            >

              <LogOut
                className="
                  mr-2
                  h-4 w-4
                "
              />

              Logout All

            </Button>

          </div>

        </div>

        {/* Suspicious */}
        {suspiciousSessions.length >
          0 && (

          <Card className="
            border-red-500/30
            bg-red-500/10
          ">

            <CardContent className="
              p-6
            ">

              <div className="
                flex items-start
                gap-5
              ">

                <div className="
                  w-14 h-14
                  rounded-2xl
                  bg-red-500/20
                  flex items-center
                  justify-center
                  text-red-400
                ">

                  <AlertTriangle
                    size={28}
                  />

                </div>

                <div>

                  <h2 className="
                    text-2xl
                    font-bold
                    text-red-300
                  ">

                    Suspicious Activity Detected

                  </h2>

                  <p className="
                    text-red-200/80
                    mt-2
                  ">

                    {
                      suspiciousSessions.length
                    } suspicious session(s) detected.

                  </p>

                </div>

              </div>

            </CardContent>

          </Card>

        )}

        {/* Search */}
        <Card className="
          bg-zinc-900
          border-zinc-800
        ">

          <CardContent className="
            p-6
          ">

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
                placeholder="Search sessions..."
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

          </CardContent>

        </Card>

        {/* Sessions */}
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
            ">

              <h2 className="
                text-2xl
                font-black
              ">

                Active Sessions

              </h2>

            </div>

            {loading ? (

              <div className="
                p-20
                text-center
                text-zinc-400
              ">

                Loading sessions...

              </div>

            ) : filteredSessions.length ===
              0 ? (

              <div className="
                p-20
                text-center
              ">

                <Activity
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

                  No Sessions Found

                </h3>

              </div>

            ) : (

              <div className="
                divide-y
                divide-zinc-800
              ">

                {filteredSessions.map(
                  (session) => (

                    <div
                      key={
                        session.id
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

                        <div className={`
                          w-14 h-14
                          rounded-2xl
                          flex items-center
                          justify-center
                          ${
                            session.isSuspicious
                              ? "bg-red-500/10 text-red-400"
                              : "bg-violet-500/10 text-violet-400"
                          }
                        `}>

                          {getDeviceIcon(
                            session.device
                          )}

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
                                session.browser
                              }

                            </h3>

                            {session.isCurrent && (

                              <div className="
                                px-3 py-1
                                rounded-full
                                bg-emerald-500/10
                                text-emerald-400
                                text-xs
                              ">

                                Current

                              </div>

                            )}

                            {session.isSuspicious && (

                              <div className="
                                px-3 py-1
                                rounded-full
                                bg-red-500/10
                                text-red-400
                                text-xs
                              ">

                                Suspicious

                              </div>

                            )}

                          </div>

                          <div className="
                            flex flex-wrap
                            gap-5 mt-4
                            text-sm
                            text-zinc-400
                          ">

                            <div className="
                              flex items-center
                              gap-2
                            ">

                              <Monitor
                                size={14}
                              />

                              {
                                session.device
                              }

                            </div>

                            <div className="
                              flex items-center
                              gap-2
                            ">

                              <Globe
                                size={14}
                              />

                              {
                                session.ip ||
                                "Unknown IP"
                              }

                            </div>

                            <div className="
                              flex items-center
                              gap-2
                            ">

                              <Clock3
                                size={14}
                              />

                              {session.createdAt
                                ?.toDate?.()
                                ?.toLocaleString()}

                            </div>

                          </div>

                          <div className="
                            mt-3
                            text-sm
                            text-zinc-500
                          ">

                            Location:
                            {" "}
                            {
                              session.location ||
                              "Unknown"
                            }

                          </div>

                        </div>

                      </div>

                      {/* Right */}
                      <div className="
                        flex flex-col
                        xl:items-end
                        gap-3
                      ">

                        <div className={`
                          flex items-center
                          gap-2 text-sm
                          ${
                            session.isSuspicious
                              ? "text-red-400"
                              : "text-emerald-400"
                          }
                        `}>

                          {session.isSuspicious ? (

                            <AlertTriangle
                              size={16}
                            />

                          ) : (

                            <CheckCircle2
                              size={16}
                            />

                          )}

                          {session.isSuspicious
                            ? "Potential Risk"
                            : "Secure"}

                        </div>

                        {!session.revoked && (

                          <Button
                            onClick={() =>
                              handleRevokeSession(
                                session.id
                              )
                            }
                            variant="outline"
                            className="
                              border-zinc-700
                              bg-zinc-950
                              hover:bg-zinc-800
                            "
                          >

                            <Lock
                              className="
                                mr-2
                                h-4 w-4
                              "
                            />

                            Revoke

                          </Button>

                        )}

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