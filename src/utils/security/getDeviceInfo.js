export default function getDeviceInfo() {

  const ua =
    navigator.userAgent;

  let browser =
    "Unknown";

  let device =
    "Desktop";

  // Browser
  if (
    ua.includes("Chrome")
  ) {

    browser =
      "Chrome";

  } else if (
    ua.includes("Firefox")
  ) {

    browser =
      "Firefox";

  } else if (
    ua.includes("Safari")
  ) {

    browser =
      "Safari";

  } else if (
    ua.includes("Edge")
  ) {

    browser =
      "Edge";
  }

  // Device
  if (
    /mobile/i.test(ua)
  ) {

    device =
      "Mobile";
  }

  return {

    browser,

    device,

    userAgent: ua,
  };
}