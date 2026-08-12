<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

/**
 * ApnarDokan API envelope.
 *
 * Deliberately mirrors the shapes the Next.js frontend's mocked baseQuery
 * already consumes, so the Section 7 swap is a drop-in:
 *
 *   Collections (paginated): { items, total, page, pageSize, totalPages }
 *   Collections (plain)    : { items, total }
 *   Details                : the resource object directly
 *   Errors                 : { message } (+ errors map on 422)
 */
class ApiResponse
{
    public static function paginated(LengthAwarePaginator $paginator, ?string $resourceClass = null): JsonResponse
    {
        $items = $paginator->items();

        // Transform raw models through an ApiResource when provided, so the
        // JSON keys match the frontend's camelCase contract (e.g. ProductResource).
        if ($resourceClass !== null && class_exists($resourceClass)) {
            $items = collect($items)->map(
                fn ($model) => (new $resourceClass($model))->resolve()
            )->all();
        }

        return response()->json([
            'items' => $items,
            'total' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'pageSize' => $paginator->perPage(),
            'totalPages' => $paginator->lastPage(),
        ]);
    }

    public static function collection(array $items, int $total): JsonResponse
    {
        return response()->json([
            'items' => $items,
            'total' => $total,
        ]);
    }

    public static function detail(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status);
    }

    public static function message(string $message, int $status = 200): JsonResponse
    {
        return response()->json(['message' => $message], $status);
    }

    public static function error(string $message, int $status): JsonResponse
    {
        return response()->json(['message' => $message], $status);
    }
}
