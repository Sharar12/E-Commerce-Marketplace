<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payouts', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('seller_id', 36);
            $table->foreign('seller_id')->references('id')->on('seller_profiles');
            $table->decimal('amount', 12, 2);
            $table->enum('method', ['card', 'bkash', 'nagad', 'cod'])->default('bkash');
            $table->string('account_summary')->nullable();
            $table->enum('status', ['pending', 'processing', 'paid', 'rejected'])->default('pending');
            $table->string('transaction_ref')->nullable();
            $table->timestamp('period_start')->nullable();
            $table->timestamp('period_end')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('seller_id');
            $table->index('status');
        });

        Schema::create('payout_requests', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('seller_id', 36);
            $table->foreign('seller_id')->references('id')->on('seller_profiles');
            $table->decimal('amount', 12, 2);
            $table->enum('method', ['card', 'bkash', 'nagad', 'cod'])->default('bkash');
            $table->string('account_summary')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('admin_note')->nullable();
            $table->string('transaction_ref')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('seller_id');
            $table->index('status');
        });

        Schema::create('seller_earnings', function (Blueprint $table) {
            $table->id();
            $table->string('seller_id', 36);
            $table->foreign('seller_id')->references('id')->on('seller_profiles');
            $table->string('order_id', 36)->nullable();
            $table->decimal('gross', 12, 2)->default(0);
            $table->decimal('commission', 12, 2)->default(0);
            $table->decimal('net', 12, 2)->default(0);
            $table->timestamps();

            $table->index('seller_id');
        });

        Schema::create('deliveries', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('order_id', 36);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->string('partner_id', 36)->nullable();
            $table->foreign('partner_id')->references('id')->on('delivery_partner_profiles');
            $table->enum('status', ['assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed', 'returned'])->default('assigned');
            $table->decimal('cod_amount', 12, 2)->nullable();
            $table->decimal('cod_collected', 12, 2)->nullable();
            $table->decimal('cod_remitted', 12, 2)->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index('partner_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('seller_earnings');
        Schema::dropIfExists('payout_requests');
        Schema::dropIfExists('payouts');
    }
};
