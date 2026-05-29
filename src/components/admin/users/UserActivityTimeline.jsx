import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import {
  ShieldCheck,
  Clock3,
} from "lucide-react";

import { db }
from "@/firebase/config";

import {
  Badge,
} from "@/components/ui/badge";

export default function UserActivityTimeline({
  userId,
}) {

  const [logs, setLogs] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  /* =====================================================
     LOAD AUDIT LOGS
  ===================================================== */

  useEffect(() => {

    if (!userId)
      return;

    fetchLogs();

  }, [userId]);

  const fetchLogs =
    async () => {

      try {

        setLoading(true);

        const q = query(

          collection(
            db,
            "adminAuditLogs"
          ),

          where(
            "targetUserId",
            "==",
            userId
          ),

          orderBy(
            "createdAt",
            "desc"
          )
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

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="
      mt-8
    ">

      <div className="
        flex items-center
        gap-2
        mb-4
      ">

        <Clock3
          size={18}
        />

        <h3 className="
          font-bold
          text-lg
        ">

          Activity Timeline

        </h3>

      </div>

      {loading ? (

        <div className="
          text-sm
          text-muted-foreground
        ">

          Loading activity...

        </div>

      ) : logs.length === 0 ? (

        <div className="
          text-sm
          text-muted-foreground
        ">

          No activity found

        </div>

      ) : (

        <div className="
          space-y-4
        ">

          {logs.map((log) => (

            <div
              key={log.id}
              className="
                border
                rounded-2xl
                p-4
                flex
                gap-4
              "
            >

              {/* ICON */}
              <div className="
                h-10
                w-10
                rounded-xl
                bg-primary/10
                flex
                items-center
                justify-center
                shrink-0
              ">

                <ShieldCheck
                  size={18}
                />

              </div>

              {/* CONTENT */}
              <div className="
                flex-1
              ">

                <div className="
                  flex
                  items-center
                  gap-2
                  flex-wrap
                ">

                  <Badge>

                    {formatAction(
                      log.action
                    )}

                  </Badge>

                  <span className="
                    text-xs
                    text-muted-foreground
                  ">

                    by {
                      log.performedByEmail ||
                      "Unknown"
                    }

                  </span>

                </div>

                {/* DETAILS */}
                <div className="
                  mt-3
                  text-sm
                  space-y-1
                ">

                  {Object.keys(
                    log.newData || {}
                  ).map((key) => (

                    <div
                      key={key}
                    >

                      <span className="
                        font-medium
                      ">

                        {key}

                      </span>

                      {" : "}

                      <span className="
                        text-muted-foreground
                      ">

                        {
                          String(
                            log.oldData?.[key]
                          )
                        }

                        {" → "}

                        {
                          String(
                            log.newData?.[key]
                          )
                        }

                      </span>

                    </div>
                  ))}

                </div>

                {/* DATE */}
                <div className="
                  mt-3
                  text-xs
                  text-muted-foreground
                ">

                  {formatDate(
                    log.createdAt
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatAction(
  action
) {

  return action
    ?.replaceAll("_", " ")
    ?.toLowerCase()
    ?.replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

function formatDate(
  timestamp
) {

  if (
    !timestamp?.seconds
  ) {
    return "Just now";
  }

  return new Date(
    timestamp.seconds * 1000
  ).toLocaleString();
}