<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 36)->primary(); // frontend uses string ids (cus-01, sel-techpoint, ...)
            $table->enum('role', ['customer', 'seller', 'delivery', 'support', 'admin'])->default('customer');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('avatar')->nullable();
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // Customer-specific profile (loyalty, tier, referral)
        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36)->unique();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unsignedInteger('loyalty_points')->default(0);
            $table->enum('tier', ['bronze', 'silver', 'gold', 'platinum'])->default('bronze');
            $table->string('referral_code', 12)->nullable()->index();
            $table->string('referred_by', 36)->nullable();
            $table->json('notification_prefs')->nullable();
            $table->timestamps();
        });

        // Seller shop profile (approval status, branding, payouts)
        Schema::create('seller_profiles', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36)->unique();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('shop_name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('category_ids')->nullable();
            $table->decimal('rating', 3, 1)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('followers')->default(0);
            $table->enum('status', ['pending', 'active', 'suspended', 'rejected'])->default('pending');
            $table->json('verification_docs')->nullable();
            $table->json('bank_account')->nullable();
            $table->string('address')->nullable();
            $table->text('bio')->nullable();
            $table->unsignedInteger('response_rate')->default(100);
            $table->string('avg_response_time')->nullable();
            $table->decimal('commission_rate', 5, 2)->default(4.00);
            $table->decimal('payout_balance', 12, 2)->default(0);
            $table->decimal('pending_payout', 12, 2)->default(0);
            $table->timestamps();
        });

        // Delivery partner profile (vehicle, service areas, earnings)
        Schema::create('delivery_partner_profiles', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36)->unique();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->json('vehicle')->nullable();
            $table->json('service_areas')->nullable();
            $table->boolean('online')->default(false);
            $table->decimal('rating', 3, 1)->default(0);
            $table->unsignedInteger('completed_deliveries')->default(0);
            $table->decimal('completion_rate', 5, 1)->default(0);
            $table->decimal('earnings_today', 12, 2)->default(0);
            $table->decimal('earnings_week', 12, 2)->default(0);
            $table->decimal('total_earnings', 12, 2)->default(0);
            $table->decimal('payout_balance', 12, 2)->default(0);
            $table->timestamps();
        });

        // Support agent profile
        Schema::create('support_agent_profiles', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36)->unique();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->enum('agent_role', ['agent', 'lead', 'manager'])->default('agent');
            $table->unsignedInteger('tickets_resolved')->default(0);
            $table->string('avg_response_time')->nullable();
            $table->decimal('satisfaction_score', 3, 1)->default(0);
            $table->json('skills')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_agent_profiles');
        Schema::dropIfExists('delivery_partner_profiles');
        Schema::dropIfExists('seller_profiles');
        Schema::dropIfExists('customer_profiles');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
