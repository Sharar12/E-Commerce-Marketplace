<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'customerId' => $this->customer_id,
            'customerName' => $this->customer_name,
            'subject' => $this->subject,
            'category' => $this->category,
            'status' => $this->status,
            'priority' => $this->priority,
            'orderCode' => $this->order_code,
            'assignedAgentId' => $this->assigned_agent_id,
            'createdBy' => $this->created_by,
            'messages' => $this->whenLoaded('messages')?->map(fn ($m) => [
                'id' => $m->id,
                'authorId' => $m->author_id,
                'authorName' => $m->author_name,
                'authorRole' => $m->author_role,
                'body' => $m->body,
                'isInternalNote' => (bool) $m->is_internal_note,
                'createdAt' => $m->created_at?->toIso8601String(),
            ])->values() ?? [],
            'slaDeadline' => $this->sla_deadline?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
            'escalated' => $this->escalated,
        ];
    }
}
