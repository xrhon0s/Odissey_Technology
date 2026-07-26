import { deleteExpiredRateLimits } from "@/db/queries/rate-limits";
import { releaseExpiredOrderReservations } from "@/features/orders/order-service";
import { isReservationCleanupAuthorized } from "@/features/orders/reservation-cleanup";

export async function POST(request: Request) {
  if (
    !isReservationCleanupAuthorized(
      request.headers.get("authorization"),
      process.env.CRON_SECRET,
    )
  ) {
    return Response.json(
      { message: "No autorizado.", ok: false },
      { status: 401 },
    );
  }

  const [releasedOrders] = await Promise.all([
    releaseExpiredOrderReservations(),
    deleteExpiredRateLimits(),
  ]);

  return Response.json(
    { ok: true, releasedOrders },
    { headers: { "Cache-Control": "no-store" } },
  );
}
