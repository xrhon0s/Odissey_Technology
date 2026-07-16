import { releaseExpiredOrderReservations } from "@/features/orders/order-service";
import { isReservationCleanupAuthorized } from "@/features/orders/reservation-cleanup";

export async function GET(request: Request) {
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

  const releasedOrders = await releaseExpiredOrderReservations();

  return Response.json(
    { ok: true, releasedOrders },
    { headers: { "Cache-Control": "no-store" } },
  );
}
