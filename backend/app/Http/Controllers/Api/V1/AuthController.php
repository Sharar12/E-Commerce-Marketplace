<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\VerifyOtpRequest;
use App\Http\Responses\ApiResponse;
use App\Models\CustomerProfile;
use App\Models\DeliveryPartnerProfile;
use App\Models\SellerProfile;
use App\Models\SupportAgentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Login — returns a Sanctum token plus the frontend SessionUser payload.
     */
    public function login(LoginRequest $request): \Illuminate\Http\JsonResponse
    {
        $user = User::with(['sellerProfile', 'deliveryPartnerProfile', 'supportAgentProfile', 'customerProfile'])
            ->where('email', $request->email)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return ApiResponse::error('The provided credentials are incorrect.', 422);
        }

        // Customers are not blocked by approval; sellers/delivery must be approved to sign in.
        if (in_array($user->role, ['seller', 'delivery'], true) && ! $this->isApproved($user)) {
            return ApiResponse::error('Your account is pending approval.', 403);
        }

        $token = $user->createToken('apnardokan', [$user->role])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->sessionPayload(),
        ]);
    }

    /**
     * Register — customer self-signup; seller/delivery start pending_approval.
     */
    public function register(RegisterRequest $request): \Illuminate\Http\JsonResponse
    {
        $role = $request->input('role', 'customer');

        $user = User::create([
            'id' => $this->nextUserId($role),
            'role' => $role,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
        ]);

        if ($role === 'seller') {
            $id = $this->nextProfileId('sel');
            $slug = $request->slug ?? Str::slug($request->shop_name).'-'.$id;
            SellerProfile::create([
                'id' => $id,
                'user_id' => $user->id,
                'shop_name' => $request->shop_name,
                'slug' => $slug,
                'address' => $request->address,
                'status' => 'pending',
                'category_ids' => $request->input('category_ids', []),
            ]);
        }

        if ($role === 'delivery') {
            DeliveryPartnerProfile::create([
                'id' => $this->nextProfileId('dlv'),
                'user_id' => $user->id,
                'vehicle' => $request->has('vehicle_type')
                    ? ['type' => $request->vehicle_type, 'regNo' => $request->vehicle_reg_no ?? '']
                    : null,
                'service_areas' => $request->input('service_areas', []),
                'online' => false,
            ]);
        }

        if ($role === 'customer') {
            CustomerProfile::create([
                'id' => $this->nextProfileId('cus'),
                'user_id' => $user->id,
                'referral_code' => 'APD'.Str::upper(Str::random(4)),
            ]);
        }

        $token = $user->createToken('apnardokan', [$role])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load(['sellerProfile', 'deliveryPartnerProfile', 'supportAgentProfile'])->sessionPayload(),
        ], 201);
    }

    public function me(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user()->load([
            'sellerProfile', 'deliveryPartnerProfile', 'supportAgentProfile', 'customerProfile',
        ]);

        return response()->json([
            'user' => $user->sessionPayload(),
        ]);
    }

    public function logout(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::message('Logged out successfully.');
    }

    /**
     * OTP stub — logs the code instead of hitting an SMS gateway in dev.
     */
    public function sendOtp(VerifyOtpRequest $request): \Illuminate\Http\JsonResponse
    {
        $otp = (string) random_int(100000, 999999);
        Log::info('[OTP stub] send to '.$request->phone, ['otp' => $otp]);
        cache()->put('otp:'.$request->phone, $otp, now()->addMinutes(5));

        return ApiResponse::message('OTP sent.');
    }

    public function verifyOtp(VerifyOtpRequest $request): \Illuminate\Http\JsonResponse
    {
        $stored = cache()->get('otp:'.$request->phone);

        if (! $stored || $stored !== $request->otp) {
            return ApiResponse::error('Invalid or expired OTP.', 422);
        }

        cache()->forget('otp:'.$request->phone);

        return ApiResponse::message('OTP verified.');
    }

    /**
     * Password reset stub — writes the reset link to the log (dev behavior).
     */
    public function forgotPassword(ForgotPasswordRequest $request): \Illuminate\Http\JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Str::random(64);
            Log::info('[Password reset stub] '.$request->email, ['reset_url' => url('/reset-password/'.$token)]);
        }

        // Always return the same message to avoid leaking which emails exist.
        return ApiResponse::message('If that email exists, a reset link has been sent.');
    }

    private function isApproved(User $user): bool
    {
        if ($user->role === 'seller') {
            return $user->sellerProfile?->status === 'active';
        }
        if ($user->role === 'delivery') {
            return $user->deliveryPartnerProfile !== null; // delivery partners are approved on creation of profile
        }

        return true;
    }

    private function nextUserId(string $role): string
    {
        $prefix = match ($role) {
            'seller' => 'usr-sel',
            'delivery' => 'usr-dlv',
            'support' => 'usr-agt',
            'admin' => 'usr-adm',
            default => 'usr-cus',
        };

        return $prefix.'-'.strtolower(Str::random(8));
    }

    private function nextProfileId(string $prefix): string
    {
        $existing = match ($prefix) {
            'sel' => SellerProfile::count(),
            'dlv' => DeliveryPartnerProfile::count(),
            'cus' => CustomerProfile::count(),
            default => SupportAgentProfile::count(),
        };

        return $prefix.'-'.str_pad((string) ($existing + 1), 2, '0', STR_PAD_LEFT);
    }
}
