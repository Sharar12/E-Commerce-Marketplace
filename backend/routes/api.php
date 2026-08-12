<?php

use App\Http\Controllers\Api\V1\AuditController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\KnowledgeController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PayoutController;
use App\Http\Controllers\Api\V1\ProductManageController;
use App\Http\Controllers\Api\V1\PeopleController;
use App\Http\Controllers\Api\V1\PromotionController;
use App\Http\Controllers\Api\V1\TicketController;
use App\Http\Controllers\Api\V1\Public\BrandController;
use App\Http\Controllers\Api\V1\Public\CategoryController;
use App\Http\Controllers\Api\V1\Public\ProductController;
use App\Http\Controllers\Api\V1\Public\ReviewController;
use App\Http\Controllers\Api\V1\Public\SellerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ApnarDokan API v1
|--------------------------------------------------------------------------
| Every endpoint is mounted under /api/v1 by bootstrap/app.php.
| Controllers live under App\Http\Controllers\Api\V1 grouped by role.
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'apnardokan-api',
    'version' => 'v1',
]));

/*
|--------------------------------------------------------------------------
| Auth (public)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/otp/send', [AuthController::class, 'sendOtp']);
    Route::post('/otp/verify', [AuthController::class, 'verifyOtp']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

/*
|--------------------------------------------------------------------------
| Public catalog (no auth)
|--------------------------------------------------------------------------
*/
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/sellers', [SellerController::class, 'index']);
Route::get('/sellers/{seller}', [SellerController::class, 'show']);

/* Product static subroutes MUST precede /products/{id} */
Route::get('/products/category', [ProductController::class, 'category']);
Route::get('/products/flash-sale', [ProductController::class, 'flashSale']);
Route::get('/products/recommended', [ProductController::class, 'recommended']);
Route::get('/products/top-sellers', [ProductController::class, 'topSellers']);
Route::get('/products/search-suggest', [ProductController::class, 'searchSuggest']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);

Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/knowledge', [KnowledgeController::class, 'index']);
Route::get('/promotions', [PromotionController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authenticated + role-scoped routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Orders (role-scoped inside the controller)
    Route::get('/orders/customer', [OrderController::class, 'customer']);
    Route::get('/orders/seller', [OrderController::class, 'seller']);
    Route::get('/orders/partner', [OrderController::class, 'partner']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/orders', [OrderController::class, 'index']);

    // People listings + detail (admin / support views)
    Route::get('/customers', [PeopleController::class, 'customers']);
    Route::get('/customers/{customer}', [PeopleController::class, 'customerShow']);
    Route::get('/delivery-partners', [PeopleController::class, 'deliveryPartners']);
    Route::get('/delivery-partners/{partner}', [PeopleController::class, 'deliveryPartnerShow']);
    Route::get('/support-agents', [PeopleController::class, 'supportAgents']);

    // Support tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::post('/tickets/{ticket}/messages', [TicketController::class, 'reply']);

    // Seller/admin financials + ops
    Route::get('/payouts', [PayoutController::class, 'index']);
    Route::post('/payouts/requests', [PayoutController::class, 'store']);
    Route::get('/audit-logs', [AuditController::class, 'index']);

    // Seller product management
    Route::post('/products', [ProductManageController::class, 'store']);
    Route::put('/products/{product}', [ProductManageController::class, 'update']);

    // Role dashboards
    Route::get('/dashboard/admin', [DashboardController::class, 'admin']);
    Route::get('/dashboard/seller', [DashboardController::class, 'seller']);
    Route::get('/dashboard/customer', [DashboardController::class, 'customer']);
    Route::get('/dashboard/delivery', [DashboardController::class, 'delivery']);
    Route::get('/dashboard/support', [DashboardController::class, 'support']);
});
