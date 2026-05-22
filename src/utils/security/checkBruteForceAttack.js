export default function checkBruteForceAttack(
  attempts = []
) {

  const recentAttempts =
    attempts.filter(
      (attempt) => {

        const createdAt =
          attempt.createdAt
            ?.toDate?.();

        if (!createdAt)
          return false;

        const diff =
          Date.now() -
          createdAt.getTime();

        return (
          diff <
          15 *
            60 *
            1000
        );
      }
    );

  return (
    recentAttempts.length >= 5
  );
}