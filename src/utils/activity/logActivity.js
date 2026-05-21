import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export default async function logActivity({

  uid,

  type,

  title,

  description,

  meta = {},
}) {

  try {

    await addDoc(
      collection(
        db,
        "activityLogs"
      ),
      {

        uid,

        type,

        title,

        description,

        meta,

        createdAt:
          serverTimestamp(),
      }
    );

    return true;

  } catch (error) {

    console.error(
      "ACTIVITY LOG ERROR:",
      error
    );

    return false;
  }
}