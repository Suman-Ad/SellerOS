import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* =========================================================
   LOG ADMIN ACTION
========================================================= */

export async function logAdminAction({
  action,
  targetUserId,
  targetUserEmail,
  performedBy,
  performedByEmail,
  oldData = {},
  newData = {},
}) {

  try {

    await addDoc(
      collection(
        db,
        "adminAuditLogs"
      ),
      {
        action,

        targetUserId,
        targetUserEmail,

        performedBy,
        performedByEmail,

        oldData,
        newData,

        createdAt:
          serverTimestamp(),
      }
    );

    return {
      success: true,
    };

  } catch (error) {

    console.error(error);

    return {
      success: false,
      error:
        error.message,
    };
  }
}