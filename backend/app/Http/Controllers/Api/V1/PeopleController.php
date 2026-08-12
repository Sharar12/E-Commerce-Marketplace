<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CustomerResource;
use App\Http\Resources\Api\V1\DeliveryPartnerResource;
use App\Http\Resources\Api\V1\SupportAgentResource;
use App\Http\Responses\ApiResponse;
use App\Models\CustomerProfile;
use App\Models\DeliveryPartnerProfile;
use App\Models\SupportAgentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeopleController extends Controller
{
    /**
     * GET /customers — admin/support view of the customer base.
     */
    public function customers(): JsonResponse
    {
        $items = CustomerProfile::query()
            ->with('user:id,name,email,phone,avatar,created_at')
            ->withCount('orders')
            ->withSum('orders as orders_revenue', 'total')
            ->orderBy('created_at', 'desc')
            ->get();

        return ApiResponse::collection(
            CustomerResource::collection($items)->resolve(),
            $items->count()
        );
    }

    /**
     * GET /customers/{id} — single customer (account pages).
     */
    public function customerShow(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        // Customers may only fetch their own profile; admins/support may fetch any.
        if ($user->role === 'customer' && $id !== $user->id) {
            return ApiResponse::error('Forbidden', 403);
        }
        if (! in_array($user->role, ['admin', 'support', 'customer'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }

        // Frontend keys customers by their user id (cus-01), not the profile id.
        $item = CustomerProfile::query()
            ->with('user:id,name,email,phone,avatar,created_at')
            ->withCount('orders')
            ->withSum('orders as orders_revenue', 'total')
            ->where('user_id', $id)
            ->first();

        if (! $item) {
            return ApiResponse::error('Customer not found', 404);
        }

        return ApiResponse::detail(new CustomerResource($item));
    }

    /**
     * GET /delivery-partners
     */
    public function deliveryPartners(): JsonResponse
    {
        $items = DeliveryPartnerProfile::query()
            ->with('user:id,name,phone,email,avatar,created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return ApiResponse::collection(
            DeliveryPartnerResource::collection($items)->resolve(),
            $items->count()
        );
    }

    /**
     * GET /delivery-partners/{id} — single partner (delivery profile page).
     */
    public function deliveryPartnerShow(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        // Delivery partners may only fetch their own profile; admins any.
        if ($user->role === 'delivery' && $id !== $user->deliveryPartnerProfile?->id) {
            return ApiResponse::error('Forbidden', 403);
        }
        if (! in_array($user->role, ['admin', 'delivery'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }

        $item = DeliveryPartnerProfile::query()
            ->with('user:id,name,phone,email,avatar,created_at')
            ->find($id);

        if (! $item) {
            return ApiResponse::error('Partner not found', 404);
        }

        return ApiResponse::detail(new DeliveryPartnerResource($item));
    }

    /**
     * GET /support-agents
     */
    public function supportAgents(): JsonResponse
    {
        $items = SupportAgentProfile::query()
            ->with('user:id,name,email,avatar,created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return ApiResponse::collection(
            SupportAgentResource::collection($items)->resolve(),
            $items->count()
        );
    }
}
