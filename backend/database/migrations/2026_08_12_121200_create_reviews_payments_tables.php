<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('product_id', 36);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->string('customer_id', 36);
            $table->foreign('customer_id')->references('id')->on('users');
            $table->unsignedTinyInteger('rating');
            $table->string('title')->nullable();
            $table->text('body');
            $table->json('images')->nullable();
            $table->boolean('verified_purchase')->default(false);
            $table->boolean('is_flagged')->default(false);
            $table->string('flag_reason')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index('product_id');
            $table->index('customer_id');
        });

        Schema::create('review_replies', function (Blueprint $table) {
            $table->id();
            $table->string('review_id', 36);
            $table->foreign('review_id')->references('id')->on('reviews')->cascadeOnDelete();
            $table->string('seller_id', 36)->nullable();
            $table->text('body');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        Schema::create('return_requests', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('order_id', 36);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->string('reason');
            $table->text('detail')->nullable();
            $table->json('images')->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->enum('status', ['pending', 'approved', 'denied', 'refunded'])->default('pending');
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->string('decision_note')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('order_id', 36);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->enum('method', ['card', 'bkash', 'nagad', 'cod']);
            $table->enum('status', ['pending', 'paid', 'refunded', 'failed'])->default('pending');
            $table->decimal('amount', 12, 2);
            $table->string('transaction_ref')->nullable();
            $table->string('masked_account')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('order_id');
        });

        Schema::create('payment_methods', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->enum('type', ['card', 'bkash', 'nagad']);
            $table->string('brand')->nullable();
            $table->string('last4', 4)->nullable();
            $table->string('expiry', 7)->nullable();
            $table->timestamps();

            $table->index('user_id');
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('payment_id', 36);
            $table->foreign('payment_id')->references('id')->on('payments')->cascadeOnDelete();
            $table->string('return_request_id', 36)->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'processed', 'failed'])->default('pending');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('return_requests');
        Schema::dropIfExists('review_replies');
        Schema::dropIfExists('reviews');
    }
};
