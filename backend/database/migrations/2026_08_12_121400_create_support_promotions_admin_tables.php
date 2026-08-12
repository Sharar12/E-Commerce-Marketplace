<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('code', 20)->unique();
            $table->string('customer_id', 36);
            $table->foreign('customer_id')->references('id')->on('users');
            $table->string('customer_name');
            $table->string('subject');
            $table->enum('category', ['order_issue', 'payment', 'return', 'account', 'seller_complaint', 'delivery', 'other']);
            $table->enum('status', ['new', 'open', 'pending', 'resolved'])->default('new');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->string('order_code')->nullable();
            $table->string('assigned_agent_id', 36)->nullable();
            $table->enum('created_by', ['customer', 'seller'])->default('customer');
            $table->timestamp('sla_deadline')->nullable();
            $table->json('escalated')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index('customer_id');
            $table->index('assigned_agent_id');
            $table->index('status');
        });

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('ticket_id', 36);
            $table->foreign('ticket_id')->references('id')->on('support_tickets')->cascadeOnDelete();
            $table->string('author_id', 36)->nullable();
            $table->string('author_name');
            $table->string('author_role', 20);
            $table->text('body');
            $table->boolean('is_internal_note')->default(false);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->index('ticket_id');
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('code', 30)->unique();
            $table->string('title');
            $table->enum('discount_type', ['percent', 'fixed']);
            $table->decimal('discount_value', 12, 2);
            $table->decimal('min_order', 12, 2)->default(0);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('usage_limit')->default(0);
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('flash_sales', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('title');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedTinyInteger('discount_percent')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->string('flash_sale_id', 36);
            $table->foreign('flash_sale_id')->references('id')->on('flash_sales')->cascadeOnDelete();
            $table->string('product_id', 36);
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('cms_banners', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image');
            $table->string('cta_label')->nullable();
            $table->string('cta_href')->nullable();
            $table->string('bg_class')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });

        Schema::create('admin_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('admin_id', 36)->nullable();
            $table->string('admin_name')->nullable();
            $table->string('action');
            $table->string('target')->nullable();
            $table->text('detail')->nullable();
            $table->timestamp('at')->nullable();
            $table->timestamps();
        });

        Schema::create('knowledge_articles', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('title');
            $table->string('category');
            $table->longText('body');
            $table->unsignedInteger('views')->default(0);
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_articles');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('admin_settings');
        Schema::dropIfExists('cms_banners');
        Schema::dropIfExists('flash_sale_products');
        Schema::dropIfExists('flash_sales');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('support_tickets');
    }
};
