import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* =========================================================
   UPDATE USER ROLES
========================================================= */

export async function updateUserRoles({
  userId,
  platformRole,
  organizationRole,
}) {

  try {

    await updateDoc(
      doc(db, "users", userId),
      {
        platformRole,
        organizationRole,

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