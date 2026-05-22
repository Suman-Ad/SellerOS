import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db }
from "@/firebase/config";

import getDeviceInfo
from "./getDeviceInfo";

import detectSuspiciousLogin
from "./detectSuspiciousLogin";

export default async function createLoginSession(
  uid
) {

  try {

    // ========================================
    // Device Info
    // ========================================

    const {
      browser,
      device,
      userAgent,
    } = getDeviceInfo();

    // ========================================
    // Previous Sessions
    // ========================================

    const q = query(
      collection(
        db,
        "loginSessions"
      ),
      where(
        "uid",
        "==",
        uid
      )
    );

    const snapshot =
      await getDocs(q);

    const previousSessions =
      snapshot.docs.map(
        (doc) => doc.data()
      );

    // ========================================
    // Detect Suspicious
    // ========================================

    const isSuspicious =
      detectSuspiciousLogin({

        previousSessions,

        currentBrowser:
          browser,

        currentDevice:
          device,
      });

    // ========================================
    // Create Session
    // ========================================

    await addDoc(
      collection(
        db,
        "loginSessions"
      ),
      {

        uid,

        browser,

        device,

        userAgent,

        location:
          "Unknown",

        ip:
          "Unknown",

        isCurrent: true,

        isSuspicious,

        createdAt:
          serverTimestamp(),
      }
    );

    return {
      success: true,
      isSuspicious,
    };

  } catch (error) {

    console.error(
      "CREATE SESSION ERROR:",
      error
    );

    return {
      success: false,
    };
  }
}