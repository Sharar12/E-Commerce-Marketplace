<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('parent_id', 36)->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('product_count')->default(0);
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('seller_id', 36);
            $table->string('category_id', 36);
            $table->string('brand', 100)->default('Generic');
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('slug');
            $table->text('description');
            $table->json('highlights')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('mrp', 12, 2)->nullable();
            $table->enum('currency', ['BDT'])->default('BDT');
            $table->unsignedInteger('stock')->default(0);
            $table->decimal('rating', 3, 1)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('sold_count')->default(0);
            $table->json('tags')->nullable();
            $table->boolean('is_flash_sale')->default(false);
            $table->timestamp('flash_sale_ends_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(true);
            $table->boolean('is_flagged')->default(false);
            $table->string('flag_reason')->nullable();
            $table->json('delivery_estimate_days')->nullable();
            $table->boolean('free_delivery')->default(false);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index('seller_id');
            $table->index('category_id');
            $table->index('is_published');
            $table->index(['is_published', 'is_flash_sale']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('product_id', 36);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->string('name')->default('Color');
            $table->string('value');
            $table->decimal('price_delta', 12, 2)->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->timestamps();

            $table->index('product_id');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('product_id', 36);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->string('url');
            $table->string('alt')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('product_id');
        });

        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('product_id', 36);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->string('variant_id', 36)->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('low_stock_threshold')->default(5);
            $table->unsignedInteger('reserved')->default(0);
            $table->timestamp('restocked_at')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'variant_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
    }
};
