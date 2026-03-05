export const isAuthorizedCronRequest = (request: Request): boolean => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${cronSecret}`) return true;

  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (vercelCronHeader === "1") return true;

  return false;
};
