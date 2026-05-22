export default function calculateRiskScore({

  isSuspiciousDevice,

  failedAttempts,

  impossibleTravel,

  unusualLoginTime,
}) {

  let score = 0;

  if (isSuspiciousDevice) {

    score += 30;
  }

  if (failedAttempts >= 5) {

    score += 40;
  }

  if (impossibleTravel) {

    score += 50;
  }

  if (unusualLoginTime) {

    score += 15;
  }

  // Max 100
  return Math.min(score, 100);
}