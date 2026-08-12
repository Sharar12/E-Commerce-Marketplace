<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportAgentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->user;

        return [
            'id' => $this->id,
            'name' => $user->name ?? '',
            'email' => $user->email ?? '',
            'avatar' => $user->avatar ?? '',
            'status' => 'active',
            'role' => $this->agent_role,
            'ticketsResolved' => $this->tickets_resolved,
            'avgResponseTime' => $this->avg_response_time,
            'satisfactionScore' => (float) $this->satisfaction_score,
            'skills' => $this->skills ?? [],
            'joinedAt' => $user?->created_at?->toIso8601String(),
        ];
    }
}
