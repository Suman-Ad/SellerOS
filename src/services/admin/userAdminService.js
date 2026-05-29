import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* =========================================================
   SUSPEND USER
========================================================= */

export async function suspendUser(
  userId
) {

  try {

    await updateDoc(
      doc(db, "users", userId),
      {
        status: "suspended",

        updatedAt:
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

/* =========================================================
   REACTIVATE USER
========================================================= */

export async function reactivateUser(
  userId
) {

  try {

    await updateDoc(
      doc(db, "users", userId),
      {
        status: "active",

        updatedAt:
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