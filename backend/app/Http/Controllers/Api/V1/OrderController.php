<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Responses\ApiResponse;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * GET /orders — filtered, paginated, role-scoped.
     *
     * The frontend passes customerId / sellerId / partnerId / status / q
     * filters. A seller can only ever see their own orders, a delivery
     * partner only their assigned ones, a customer only their own —
     * enforced here regardless of what the client asks for.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user->role;

        $query = Order::query()->with(['items', 'timeline', 'returnRequest']);

        // Hard role scoping — never trust client-supplied scoping keys.
        switch ($role) {
            case 'seller':
                $sellerId = $user->sellerProfile?->id;
                $query->where('seller_id', $sellerId);
                break;
            case 'delivery':
                // Own assigned orders + the unassigned shipped pool (available to accept).
                $partnerId = $user->deliveryPartnerProfile?->id;
                $query->where(function ($q) use ($partnerId) {
                    $q->where('assigned_partner_id', $partnerId)
                        ->orWhere(function ($pool) {
                            $pool->whereNull('assigned_partner_id')->where('status', 'shipped');
                        });
                });
                break;
            case 'customer':
                $query->where('customer_id', $user->id);
                break;
            default: // support / admin
                if ($request->filled('customerId')) {
                    $query->where('customer_id', $request->input('customerId'));
                }
                if ($request->filled('sellerId')) {
                    $query->where('seller_id', $request->input('sellerId'));
                }
                if ($request->filled('partnerId')) {
                    $query->where('assigned_partner_id', $request->input('partnerId'));
                }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('q')) {
            $q = (string) $request->input('q');
            $query->where(fn ($sub) => $sub
                ->where('order_code', 'like', "%{$q}%")
                ->orWhere('customer_name', 'like', "%{$q}%"));
        }

        $pageSize = min((int) $request->input('pageSize', 12), 100);

        return ApiResponse::paginated(
            $query->orderBy('placed_at', 'desc')->paginate($pageSize)->withQueryString(),
            OrderResource::class
        );
    }

    /**
     * POST /orders — place an order from the checkout cart.
     */
    public function store(Request $request, OrderService $orders): JsonResponse
    {
        $user = $request->user();

        // Customers place orders; admins may place on a customer's behalf.
        if (! in_array($user->role, ['customer', 'admin'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|string',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'items.*.image' => 'sometimes|string',
            'items.*.variantLabel' => 'sometimes|string',
            'items.*.sellerId' => 'sometimes|string',
            'address' => 'required|array',
            'address.name' => 'required|string',
            'address.line1' => 'required|string',
            'address.city' => 'required|string',
            'payment' => 'required|array',
            'payment.method' => 'required|string|in:bkash,nagad,card,cod,bank',
            'totals' => 'required|array',
            'totals.subtotal' => 'required|numeric',
            'totals.total' => 'required|numeric',
        ]);

        $customerId = $user->role === 'customer' ? $user->id : ($request->input('customerId') ?? $user->id);
        $customerName = $request->input('customerName', $user->name);
        $customerPhone = $request->input('customerPhone', $user->phone ?? '');
        $customerEmail = $request->input('customerEmail', $user->email);

        try {
            $order = $orders->create([
                'customer' => [
                    'id' => $customerId,
                    'name' => $customerName,
                    'phone' => $customerPhone,
                    'email' => $customerEmail,
                ],
                'sellerId' => $request->input('sellerId')
                    ?? ($validated['items'][0]['sellerId'] ?? null)
                    ?? 'sel-techpoint',
                'items' => $validated['items'],
                'address' => $validated['address'],
                'payment' => $validated['payment'],
                'totals' => $validated['totals'],
            ]);
        } catch (\Throwable $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }

        return response()->json([
            'data' => (new OrderResource($order->load(['items', 'timeline', 'returnRequest']))),
            'message' => 'Order placed',
        ], 201);
    }

    /**
     * GET /orders/{idOrCode} — lookup by id or order code, role-scoped.
     */
    public function show(Request $request, string $idOrCode): JsonResponse
    {
        $order = Order::with(['items', 'timeline', 'returnRequest'])
            ->where('id', $idOrCode)
            ->orWhere('order_code', $idOrCode)
            ->first();

        if (! $order) {
            return ApiResponse::error('Order not found', 404);
        }

        $user = $request->user();
        switch ($user->role) {
            case 'seller':
                if ($order->seller_id !== $user->sellerProfile?->id) {
                    return ApiResponse::error('Forbidden', 403);
                }
                break;
            case 'delivery':
                if ($order->assigned_partner_id !== $user->deliveryPartnerProfile?->id) {
                    return ApiResponse::error('Forbidden', 403);
                }
                break;
            case 'customer':
                if ($order->customer_id !== $user->id) {
                    return ApiResponse::error('Forbidden', 403);
                }
                break;
        }

        return ApiResponse::detail(new OrderResource($order));
    }

    /**
     * GET /orders/customer?customerId= — customer's own order history.
     */
    public function customer(Request $request): JsonResponse
    {
        $user = $request->user();
        $customerId = $request->input('customerId', $user->id);

        // Only customers (own history) and admin/support may use this route.
        if (! in_array($user->role, ['customer', 'admin', 'support'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }
        if ($user->role === 'customer' && $customerId !== $user->id) {
            return ApiResponse::error('Forbidden', 403);
        }

        $items = Order::with(['items', 'timeline', 'returnRequest'])
            ->where('customer_id', $customerId)
            ->orderBy('placed_at', 'desc')
            ->get();

        return ApiResponse::collection(
            OrderResource::collection($items)->resolve(),
            $items->count()
        );
    }

    /**
     * GET /orders/seller?sellerId= — seller's order queue.
     */
    public function seller(Request $request): JsonResponse
    {
        $user = $request->user();
        $sellerId = $request->input('sellerId', $user->sellerProfile?->id);

        // Only sellers (own queue) and admin/support may use this route.
        if (! in_array($user->role, ['seller', 'admin', 'support'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }
        if ($user->role === 'seller' && $sellerId !== $user->sellerProfile?->id) {
            return ApiResponse::error('Forbidden', 403);
        }

        $items = Order::with(['items', 'timeline', 'returnRequest'])
            ->where('seller_id', $sellerId)
            ->orderBy('placed_at', 'desc')
            ->get();

        return ApiResponse::collection(
            OrderResource::collection($items)->resolve(),
            $items->count()
        );
    }

    /**
     * GET /orders/partner?partnerId= — delivery partner's assigned queue.
     */
    public function partner(Request $request): JsonResponse
    {
        $user = $request->user();
        $partnerId = $request->input('partnerId', $user->deliveryPartnerProfile?->id);

        // Only delivery partners (own queue) and admin may use this route.
        if (! in_array($user->role, ['delivery', 'admin'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }
        if ($user->role === 'delivery' && $partnerId !== $user->deliveryPartnerProfile?->id) {
            return ApiResponse::error('Forbidden', 403);
        }

        $items = Order::with(['items', 'timeline', 'returnRequest'])
            ->where('assigned_partner_id', $partnerId)
            ->orderBy('placed_at', 'desc')
            ->get();

        return ApiResponse::collection(
            OrderResource::collection($items)->resolve(),
            $items->count()
        );
    }
}
