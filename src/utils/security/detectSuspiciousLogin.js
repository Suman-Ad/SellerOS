export default function detectSuspiciousLogin({

  previousSessions = [],

  currentBrowser,

  currentDevice,
}) {

  // ========================================
  // No History
  // ========================================

  if (
    previousSessions.length === 0
  ) {

    return false;
  }

  // ========================================
  // Unknown Device
  // ========================================

  const knownSession =
    previousSessions.find(
      (session) =>
        session.browser ===
          currentBrowser &&
        session.device ===
          currentDevice
    );

  if (!knownSession) {

    return true;
  }

  return false;
}