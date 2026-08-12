<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('label')->default('Home');
            $table->string('name');
            $table->string('phone', 20);
            $table->string('line1');
            $table->string('line2')->nullable();
            $table->string('city');
            $table->string('area');
            $table->string('postal_code', 10);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('user_id');
        });

        Schema::create('carts', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('user_id', 36)->nullable();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->string('cart_id', 36);
            $table->foreign('cart_id')->references('id')->on('carts')->cascadeOnDelete();
            $table->string('product_id', 36);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->string('variant_label')->nullable();
            $table->timestamps();

            $table->unique(['cart_id', 'product_id', 'variant_label'], 'cart_item_unique');
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->string('user_id', 36);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('product_id', 36);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->timestamp('added_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('order_code', 20)->unique();
            $table->string('customer_id', 36);
            $table->foreign('customer_id')->references('id')->on('users');
            $table->string('customer_name');
            $table->string('customer_phone', 20);
            $table->string('customer_email')->nullable();
            $table->string('seller_id', 36)->nullable(); // primary seller (single-seller orders)
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('shipping_fee', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->string('coupon_code')->nullable();
            $table->enum('payment_method', ['card', 'bkash', 'nagad', 'cod'])->default('cod');
            $table->enum('payment_status', ['pending', 'paid', 'refunded', 'failed'])->default('pending');
            $table->enum('status', [
                'placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered',
                'cancelled', 'return_requested', 'returned', 'refunded',
            ])->default('placed');
            $table->json('delivery_address');
            $table->string('assigned_partner_id', 36)->nullable();
            $table->timestamp('eta')->nullable();
            $table->string('delivery_note')->nullable();
            $table->decimal('cod_amount', 12, 2)->nullable();
            $table->timestamp('placed_at')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index('customer_id');
            $table->index('seller_id');
            $table->index('assigned_partner_id');
            $table->index('status');
            $table->index('placed_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('order_id', 36);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->string('product_id', 36);
            $table->foreign('product_id')->references('id')->on('products');
            $table->string('name');
            $table->string('image')->nullable();
            $table->unsignedInteger('quantity');
            $table->decimal('price', 12, 2);
            $table->string('variant_label')->nullable();
            $table->string('seller_id', 36)->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('seller_id');
        });

        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 36);
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->enum('status', [
                'placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered',
                'cancelled', 'return_requested', 'returned', 'refunded',
            ]);
            $table->string('label');
            $table->timestamp('timestamp')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('addresses');
    }
};
