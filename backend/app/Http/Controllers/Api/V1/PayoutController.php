<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Payout;
use App\Services\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayoutController extends Controller
{
    /**
     * GET /payouts?sellerId= — sellers only see their own ledger.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only sellers (own ledger) and admin (all ledgers) may use this route.
        if (! in_array($user->role, ['seller', 'admin'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }

        $query = Payout::query();

        if ($user->role === 'seller') {
            $query->where('seller_id', $user->sellerProfile?->id);
        } elseif ($request->filled('sellerId')) {
            $query->where('seller_id', $request->input('sellerId'));
        }

        $items = $query->orderBy('created_at', 'desc')->get()->map(fn (Payout $p) => [
            'id' => $p->id,
            'sellerId' => $p->seller_id,
            'amount' => (float) $p->amount,
            'method' => $p->method,
            'accountSummary' => $p->account_summary,
            'status' => $p->status,
            'periodStart' => $p->period_start?->toIso8601String(),
            'periodEnd' => $p->period_end?->toIso8601String(),
            'createdAt' => $p->created_at?->toIso8601String(),
            'paidAt' => $p->paid_at?->toIso8601String(),
        ])->values();

        return ApiResponse::collection($items->all(), $items->count());
    }

    /**
     * POST /payouts/requests — seller requests a withdrawal of available balance.
     *
     * Body: { method: 'bkash'|'bank'|'nagad', accountSummary?: string }
     */
    public function store(Request $request, PayoutService $service): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'seller') {
            return ApiResponse::error('Forbidden', 403);
        }

        $validated = $request->validate([
            'method' => 'required|string|in:bkash,bank,nagad,rocket',
            'accountSummary' => 'sometimes|string|max:120',
        ]);

        $seller = $user->sellerProfile;

        if (! $seller) {
            return ApiResponse::error('Seller profile not found', 404);
        }

        try {
            $requestRecord = $service->requestPayout(
                $seller,
                $validated['method'],
                $validated['accountSummary'] ?? null
            );
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        return response()->json([
            'data' => [
                'id' => $requestRecord->id,
                'sellerId' => $requestRecord->seller_id,
                'amount' => (float) $requestRecord->amount,
                'method' => $requestRecord->method,
                'accountSummary' => $requestRecord->account_summary,
                'status' => $requestRecord->status,
                'createdAt' => $requestRecord->created_at?->toIso8601String(),
            ],
            'message' => 'Withdrawal requested',
        ], 201);
    }
}
