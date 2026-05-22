import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export default async function createSecurityAlert({

  uid,

  type,

  severity = "medium",

  title,

  description,

  meta = {},
}) {

  try {

    await addDoc(
      collection(
        db,
        "securityAlerts"
      ),
      {

        uid,

        type,

        severity,

        title,

        description,

        meta,

        resolved: false,

        createdAt:
          serverTimestamp(),
      }
    );

    return true;

  } catch (error) {

    console.error(
      "SECURITY ALERT ERROR:",
      error
    );

    return false;
  }
}