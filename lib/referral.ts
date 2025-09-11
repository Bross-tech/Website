/**
 * Generate a referral link for a given agent ID.
 * Uses NEXT_PUBLIC_SITE_URL in production, localhost in dev.
 */
export function generateReferralLink(agentId: string): string {
  if (!agentId) return "";

  // Use environment variable or fallback to current origin
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  return `${baseUrl}/signup?ref=${encodeURIComponent(agentId)}`;
}
