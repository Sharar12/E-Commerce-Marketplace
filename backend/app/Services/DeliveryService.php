<?php

namespace App\Services;

use App\Models\Delivery;
use App\Models\DeliveryPartnerProfile;
use App\Models\Order;
use Illuminate\Support\Str;

/**
 * DeliveryService — partner assignment and COD reconciliation.
 */
class DeliveryService
{
    /**
     * Assign an order to the nearest available partner (least-busy
     * fallback) or a specific partner id when one is given.
     */
    public function assign(Order $order, ?string $partnerId = null): Delivery
    {
        $partnerId ??= $this->pickAvailablePartner();

        if (! $partnerId) {
            throw new \RuntimeException('No delivery partner available.');
        }

        $delivery = Delivery::updateOrCreate(
            ['order_id' => $order->id],
            [
                'id' => 'dlv-'.Str::lower(Str::random(10)),
                'partner_id' => $partnerId,
                'status' => 'assigned',
                'cod_amount' => $order->cod_amount,
                'assigned_at' => now(),
            ]
        );

        $order->update([
            'assigned_partner_id' => $partnerId,
            'updated_at' => now(),
        ]);

        return $delivery;
    }

    /**
     * Advance a delivery (picked_up -> out_for_delivery -> delivered).
     * COD reconciliation is computed on delivery.
     */
    public function advance(Delivery $delivery, string $status, float $collected = 0): Delivery
    {
        $allowed = [
            'assigned' => ['picked_up', 'failed'],
            'picked_up' => ['out_for_delivery'],
            'out_for_delivery' => ['delivered', 'failed', 'returned'],
        ];

        if (! in_array($status, $allowed[$delivery->status] ?? [], true)) {
            throw new \RuntimeException("Invalid delivery transition: {$delivery->status} -> {$status}");
        }

        $delivery->update([
            'status' => $status,
            'cod_collected' => $status === 'delivered' ? $collected : $delivery->cod_collected,
            'delivered_at' => $status === 'delivered' ? now() : null,
        ]);

        // Keep the order timeline in sync.
        $order = $delivery->order;
        if ($order) {
            $map = ['picked_up' => 'packed', 'out_for_delivery' => 'out_for_delivery', 'delivered' => 'delivered', 'failed' => 'cancelled'];
            $orderStatus = $map[$status] ?? null;
            if ($orderStatus) {
                $order->update(['status' => $orderStatus, 'updated_at' => now()]);
            }
        }

        return $delivery;
    }

    /**
     * Remit collected COD cash back to the platform.
     */
    public function remitCod(Delivery $delivery, float $amount): Delivery
    {
        $collected = $delivery->cod_collected ?? 0;

        if ($amount > $collected) {
            throw new \RuntimeException('Cannot remit more than collected.');
        }

        $delivery->update([
            'cod_remitted' => ($delivery->cod_remitted ?? 0) + $amount,
        ]);

        return $delivery;
    }

    /**
     * Partner with the fewest open deliveries (least-busy first).
     */
    private function pickAvailablePartner(): ?string
    {
        return DeliveryPartnerProfile::query()
            ->where('online', true)
            ->get()
            ->sortBy(fn (DeliveryPartnerProfile $p) => Delivery::where('partner_id', $p->id)
                ->whereIn('status', ['assigned', 'picked_up', 'out_for_delivery'])
                ->count())
            ->value('id');
    }
}
