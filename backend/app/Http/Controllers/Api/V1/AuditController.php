<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class AuditController extends Controller
{
    /**
     * GET /audit-logs
     */
    public function index(): JsonResponse
    {
        $items = Cache::remember('admin:audit-logs', 300, fn () =>
            AuditLog::query()->orderByDesc('at')->limit(50)->get()->map(fn (AuditLog $a) => [
                'id' => $a->id,
                'adminId' => $a->admin_id,
                'adminName' => $a->admin_name,
                'action' => $a->action,
                'target' => $a->target,
                'detail' => $a->detail,
                'at' => $a->at?->toIso8601String(),
            ])->values()
        );

        return ApiResponse::collection($items->all(), $items->count());
    }
}
