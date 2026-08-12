<?php

namespace App\Providers;

use App\Events\OrderPlaced;
use App\Events\OrderStatusChanged;
use App\Events\PayoutApproved;
use App\Events\TicketEscalated;
use App\Listeners\NotifyOrderPlaced;
use App\Listeners\NotifyOrderStatusChanged;
use App\Listeners\NotifyPayoutApproved;
use App\Listeners\NotifyTicketEscalated;
use App\Models\Order;
use App\Models\Payout;
use App\Models\Product;
use App\Models\SupportTicket;
use App\Policies\OrderPolicy;
use App\Policies\PayoutPolicy;
use App\Policies\ProductPolicy;
use App\Policies\TicketPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The model-to-policy mappings.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Product::class => ProductPolicy::class,
        Order::class => OrderPolicy::class,
        SupportTicket::class => TicketPolicy::class,
        Payout::class => PayoutPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        \Illuminate\Support\Facades\Event::listen(
            OrderPlaced::class,
            NotifyOrderPlaced::class
        );
        \Illuminate\Support\Facades\Event::listen(
            OrderStatusChanged::class,
            NotifyOrderStatusChanged::class
        );
        \Illuminate\Support\Facades\Event::listen(
            PayoutApproved::class,
            NotifyPayoutApproved::class
        );
        \Illuminate\Support\Facades\Event::listen(
            TicketEscalated::class,
            NotifyTicketEscalated::class
        );
    }
}
