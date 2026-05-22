import {
  updateDoc,
  doc,
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export default async function revokeSession(
  sessionId
) {

  try {

    await updateDoc(
      doc(
        db,
        "loginSessions",
        sessionId
      ),
      {

        revoked: true,

        isCurrent: false,
      }
    );

    return true;

  } catch (error) {

    console.error(
      "REVOKE SESSION ERROR:",
      error
    );

    return false;
  }
}