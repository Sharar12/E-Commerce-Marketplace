<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\KnowledgeArticle;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class KnowledgeController extends Controller
{
    /**
     * GET /knowledge
     */
    public function index(): JsonResponse
    {
        $items = Cache::remember('catalog:knowledge', 3600, fn () =>
            KnowledgeArticle::query()->orderBy('views', 'desc')->get()->map(fn (KnowledgeArticle $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'category' => $a->category,
                'body' => $a->body,
                'updatedAt' => $a->updated_at?->toIso8601String(),
                'views' => (int) $a->views,
            ])->values()
        );

        return ApiResponse::collection($items->all(), $items->count());
    }
}
