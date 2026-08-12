<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TicketResource;
use App\Http\Responses\ApiResponse;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    /**
     * GET /tickets — support sees the queue, customers only their own.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = SupportTicket::query()->with('messages');

        if ($user->role === 'customer') {
            $query->where('customer_id', $user->id);
        } elseif ($request->filled('customerId')) {
            $query->where('customer_id', $request->input('customerId'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $pageSize = min((int) $request->input('pageSize', 50), 100);
        $items = $query->orderBy('created_at', 'desc')->limit($pageSize)->get();

        return ApiResponse::collection(
            TicketResource::collection($items)->resolve(),
            $items->count()
        );
    }

    /**
     * GET /tickets/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $ticket = SupportTicket::with('messages')->find($id);

        if (! $ticket) {
            return ApiResponse::error('Ticket not found', 404);
        }

        $user = $request->user();
        if ($user->role === 'customer' && $ticket->customer_id !== $user->id) {
            return ApiResponse::error('Forbidden', 403);
        }

        return ApiResponse::detail(new TicketResource($ticket));
    }

    /**
     * POST /tickets/{id}/messages — customer reply or support response.
     *
     * Body: { body: string, isInternalNote?: boolean }
     */
    public function reply(Request $request, string $id): JsonResponse
    {
        $ticket = SupportTicket::with('messages')->find($id);

        if (! $ticket) {
            return ApiResponse::error('Ticket not found', 404);
        }

        $user = $request->user();

        // Customers reply only to their own tickets; support/admin to any.
        if ($user->role === 'customer' && $ticket->customer_id !== $user->id) {
            return ApiResponse::error('Forbidden', 403);
        }
        if (! in_array($user->role, ['customer', 'support', 'admin'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:4000',
            'isInternalNote' => 'sometimes|boolean',
        ]);

        $isInternal = (bool) ($validated['isInternalNote'] ?? false);

        // Internal notes are a support/admin-only affordance.
        if ($isInternal && ! in_array($user->role, ['support', 'admin'], true)) {
            return ApiResponse::error('Forbidden', 403);
        }

        $message = TicketMessage::create([
            'id' => 'tmsg-'.Str::lower(Str::random(12)),
            'ticket_id' => $ticket->id,
            'author_id' => $user->id,
            'author_name' => $user->name,
            'author_role' => $user->role,
            'body' => $validated['body'],
            'is_internal_note' => $isInternal,
        ]);

        return response()->json([
            'data' => [
                'id' => $message->id,
                'ticketId' => $message->ticket_id,
                'authorId' => $message->author_id,
                'authorName' => $message->author_name,
                'authorRole' => $message->author_role,
                'body' => $message->body,
                'isInternalNote' => (bool) $message->is_internal_note,
                'createdAt' => $message->created_at?->toIso8601String(),
            ],
            'message' => $isInternal ? 'Internal note saved' : 'Reply sent',
        ], 201);
    }
}
