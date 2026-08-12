<?php

namespace App\Services;

use App\Events\PayoutApproved;
use App\Models\Order;
use App\Models\Payout;
use App\Models\PayoutRequest;
use App\Models\SellerEarning;
use App\Models\SellerProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * PayoutService — platform commission math and the payout lifecycle.
 */
class PayoutService
{
    /**
     * Accrue a seller's net earning for a completed order
     * (gross - platform commission), updating the live balance.
     */
    public function accrueEarning(Order $order): SellerEarning
    {
        $seller = SellerProfile::findOrFail($order->seller_id);
        $commission = round($order->subtotal * ($seller->commission_rate / 100));
        $net = $order->subtotal - $commission;

        $earning = SellerEarning::create([
            'seller_id' => $order->seller_id,
            'order_id' => $order->id,
            'gross' => $order->subtotal,
            'commission' => $commission,
            'net' => $net,
        ]);

        $seller->increment('payout_balance', $net);

        return $earning;
    }

    /**
     * Create a payout request for the seller's available balance.
     */
    public function requestPayout(SellerProfile $seller, string $method, ?string $accountSummary = null): PayoutRequest
    {
        $amount = $seller->payout_balance;

        if ($amount <= 0) {
            throw new \RuntimeException('No payable balance.');
        }

        return DB::transaction(function () use ($seller, $method, $accountSummary, $amount) {
            // Freeze the balance while the request is in flight.
            $seller->decrement('payout_balance', $amount);
            $seller->increment('pending_payout', $amount);

            return PayoutRequest::create([
                'id' => 'prq-'.Str::lower(Str::random(10)),
                'seller_id' => $seller->id,
                'amount' => $amount,
                'method' => $method,
                'account_summary' => $accountSummary ?? 'bKash merchant account',
                'status' => 'pending',
            ]);
        });
    }

    /**
     * Approve a payout request — marks it paid and creates the ledger record.
     */
    public function approve(PayoutRequest $request, string $transactionRef): Payout
    {
        if ($request->status !== 'pending') {
            throw new \RuntimeException('Only pending requests can be approved.');
        }

        $payout = DB::transaction(function () use ($request, $transactionRef) {
            $request->update([
                'status' => 'approved',
                'paid_at' => now(),
                'transaction_ref' => $transactionRef,
            ]);

            $seller = SellerProfile::findOrFail($request->seller_id);
            $seller->decrement('pending_payout', $request->amount);

            return Payout::create([
                'id' => 'pout-'.Str::lower(Str::random(10)),
                'seller_id' => $request->seller_id,
                'amount' => $request->amount,
                'method' => $request->method,
                'account_summary' => $request->account_summary,
                'status' => 'paid',
                'transaction_ref' => $transactionRef,
                'period_start' => now()->startOfMonth(),
                'period_end' => now(),
                'paid_at' => now(),
            ]);
        });

        event(new PayoutApproved($request));

        return $payout;
    }

    /**
     * Reject a payout request — the balance returns to the seller.
     */
    public function reject(PayoutRequest $request, string $reason): void
    {
        if ($request->status !== 'pending') {
            throw new \RuntimeException('Only pending requests can be rejected.');
        }

        DB::transaction(function () use ($request, $reason) {
            $request->update(['status' => 'rejected', 'admin_note' => $reason]);

            $seller = SellerProfile::findOrFail($request->seller_id);
            $seller->increment('payout_balance', $request->amount);
            $seller->decrement('pending_payout', $request->amount);
        });
    }
}
