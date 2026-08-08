export function isReservationCleanupAuthorized(
  authorizationHeader: string | null,
  secret: string | undefined,
) {
  if (!secret || secret.length < 24) return false;
  return authorizationHeader === `Bearer ${secret}`;
}
