<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\AdminSetting;
use App\Models\AuditLog;
use App\Models\Brand;
use App\Models\Cart;
use App\Models\Category;
use App\Models\CmsBanner;
use App\Models\Coupon;
use App\Models\CustomerProfile;
use App\Models\DeliveryPartnerProfile;
use App\Models\FlashSale;
use App\Models\KnowledgeArticle;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Payout;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\ReviewReply;
use App\Models\SellerEarning;
use App\Models\SellerProfile;
use App\Models\SupportAgentProfile;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    private const STATUS_LABELS = [
        'placed' => 'Placed', 'confirmed' => 'Confirmed', 'packed' => 'Packed',
        'shipped' => 'Shipped', 'out_for_delivery' => 'Out for Delivery', 'delivered' => 'Delivered',
        'cancelled' => 'Cancelled', 'return_requested' => 'Return Requested',
        'returned' => 'Returned', 'refunded' => 'Refunded',
    ];

    public function run(): void
    {
        $this->seedRolesAndProfiles();
        $this->seedCatalog();
        $this->seedCartsAndWishlists();
        $this->seedOrders();
        $this->seedReviews();
        $this->seedTickets();
        $this->seedPromotionsAndCms();
        $this->seedPayoutsAndSettings();
    }

    /* ================================================================
     * Users, profiles, sellers, delivery partners, support agents
     * ================================================================ */

    private function seedRolesAndProfiles(): void
    {
        // Admin
        User::create([
            'id' => 'usr-adm-01', 'role' => 'admin', 'name' => 'Ashraful Islam',
            'email' => 'admin@apnardokan.com', 'phone' => '+8801700000000',
            'avatar' => '', 'password' => 'demo1234',
        ]);

        // Customers (mock: cus-01 .. cus-20)
        $customerNames = [
            'Rahim Uddin', 'Karim Mia', 'Sultana Parvin', 'Nusrat Jahan', 'Tanvir Ahmed',
            'Farzana Akter', 'Mahmudul Hasan', 'Jannatul Ferdous', 'Sakib Rahman', 'Taslima Begum',
            'Imran Hossain', 'Rokeya Sultana', 'Arif Chowdhury', 'Nadia Islam', 'Shakil Khan',
            'Mim Akter', 'Rubel Sheikh', 'Anika Tabassum', 'Fahim Karim', 'Sharmin Lucky',
        ];

        foreach ($customerNames as $i => $name) {
            $userId = 'cus-'.str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT);
            $email = strtolower(str_replace([' ', "'"], '.', $name)).'@gmail.com';
            $avatar = "https://picsum.photos/seed/avatar-{$i}/120/120";

            User::create([
                'id' => $userId, 'role' => 'customer', 'name' => $name, 'email' => $email,
                'phone' => '+8801'.fake()->numberBetween(300000000, 999999999),
                'avatar' => $avatar, 'password' => 'demo1234',
            ]);

            $tiers = ['bronze', 'silver', 'gold', 'platinum'];
            CustomerProfile::create([
                'id' => 'cusprof-'.($i + 1),
                'user_id' => $userId,
                'loyalty_points' => fake()->numberBetween(120, 12400),
                'tier' => $tiers[$i % 4],
                'referral_code' => 'APD'.str_pad((string) (100 + $i), 3, '0', STR_PAD_LEFT),
                'notification_prefs' => ['email' => true, 'sms' => $i % 3 !== 0, 'push' => true],
            ]);

            // Two addresses per customer
            foreach ([0, 1] as $a) {
                Address::create([
                    'id' => "addr-{$userId}-{$a}",
                    'user_id' => $userId,
                    'label' => $a === 0 ? 'Home' : 'Work',
                    'name' => $name,
                    'phone' => '+8801'.fake()->numberBetween(300000000, 999999999),
                    'line1' => fake()->streetName().', '.fake()->streetAddress(),
                    'city' => fake()->randomElement(['Dhaka', 'Chattogram', 'Sylhet', 'Khulna']),
                    'area' => fake()->randomElement(['Banani', 'Dhanmondi', 'Gulshan', 'Uttara', 'Agrabad']),
                    'postal_code' => (string) fake()->numberBetween(1000, 9999),
                    'is_default' => $a === 0,
                ]);
            }

            // Saved payment methods (half the customers)
            if ($i % 2 === 0) {
                PaymentMethod::create([
                    'id' => "pm-{$userId}-1", 'user_id' => $userId, 'type' => 'card',
                    'brand' => 'Visa', 'last4' => (string) fake()->numberBetween(1000, 9999), 'expiry' => '09/28',
                ]);
                PaymentMethod::create([
                    'id' => "pm-{$userId}-2", 'user_id' => $userId, 'type' => 'bkash',
                    'brand' => 'bKash', 'last4' => null, 'expiry' => null,
                ]);
            }
        }

        // Demo customer with known credentials (matches frontend demo login)
        User::updateOrCreate(['email' => 'rahim.uddin@gmail.com'], [
            'id' => 'cus-01', 'role' => 'customer', 'name' => 'Rahim Uddin',
            'phone' => '+8801711111111', 'password' => 'demo1234',
        ]);

        // Sellers (mock ids: sel-techpoint, sel-stylehub, ...)
        $sellers = [
            ['sel-techpoint', 'TechPoint BD', 'techpoint-bd', 'Tanvir Ahmed', 'tanvir@techpointbd.com', 'cat-electronics', 4.8, 1240, 45200, 'active', 'Gulshan-1, Dhaka', 'Authorized dealer of Apple, Samsung & Xiaomi in Bangladesh.'],
            ['sel-stylehub', 'StyleHub', 'stylehub', 'Nusrat Jahan', 'nusrat@stylehub.com', 'cat-fashion', 4.6, 890, 38100, 'active', 'Bashundhara City, Dhaka', 'Curated fashion from international brands & local artisans.'],
            ['sel-homeluxe', 'HomeLuxe Living', 'homeluxe-living', 'Mahmudul Hasan', 'mahmud@homeluxe.com', 'cat-home', 4.7, 560, 15200, 'active', 'Dhanmondi, Dhaka', 'Furniture and home essentials delivered assembled.'],
            ['sel-glow', 'Glow Beauty Store', 'glow-beauty', 'Farzana Akter', 'farzana@glow.com', 'cat-beauty', 4.5, 720, 28900, 'active', 'Uttara, Dhaka', 'Authentic skincare & cosmetics — 100% genuine products.'],
            ['sel-sportzone', 'SportZone', 'sportzone', 'Sakib Rahman', 'sakib@sportzone.com', 'cat-sports', 4.4, 340, 9600, 'active', 'Agrabad, Chattogram', 'Gym equipment, sportswear and outdoor gear.'],
            ['sel-krishi', 'Krishi Fresh Market', 'krishi-fresh', 'Taslima Begum', 'taslima@krishifresh.com', 'cat-grocery', 4.9, 1120, 52300, 'active', 'Kawran Bazar, Dhaka', 'Farm-fresh groceries delivered from local producers.'],
            ['sel-kidsworld', 'KidsWorld', 'kidsworld', 'Jannatul Ferdous', 'jannat@kidsworld.com', 'cat-toys', 4.3, 210, 7300, 'pending', 'Shibganj, Sylhet', 'Safe, certified toys and baby gear.'],
            ['sel-autocare', 'AutoCare Pro', 'autocare-pro', 'Arif Chowdhury', 'arif@autocare.com', 'cat-auto', 4.6, 180, 5400, 'active', 'Khalishpur, Khulna', 'Auto parts, batteries and accessories.'],
            ['sel-electronix', 'Electronix Hub', 'electronix-hub', 'Imran Hossain', 'imran@electronix.com', 'cat-electronics', 4.1, 95, 3100, 'suspended', 'Zindabazar, Sylhet', 'Consumer electronics & accessories.'],
            ['sel-banglashop', 'BanglaShop', 'banglashop', 'Rokeya Sultana', 'rokeya@banglashop.com', 'cat-fashion', 4.7, 640, 21800, 'active', 'Shaheb Bazar, Rajshahi', 'Handloom & heritage products from across Bangladesh.'],
        ];

        foreach ($sellers as [$id, $shopName, $slug, $owner, $email, $category, $rating, $reviews, $followers, $status, $address, $bio]) {
            User::create([
                'id' => "usr-{$id}", 'role' => 'seller', 'name' => $owner, 'email' => $email,
                'phone' => '+8801'.fake()->numberBetween(300000000, 999999999),
                'avatar' => "https://picsum.photos/seed/logo-{$id}/120/120",
                'password' => 'demo1234',
            ]);

            SellerProfile::create([
                'id' => $id,
                'user_id' => "usr-{$id}",
                'shop_name' => $shopName,
                'slug' => $slug,
                'logo' => "https://picsum.photos/seed/logo-{$id}/120/120",
                'cover_image' => "https://picsum.photos/seed/cover-{$id}/1200/300",
                'category_ids' => [$category],
                'rating' => $rating,
                'review_count' => $reviews,
                'followers' => $followers,
                'status' => $status,
                'verification_docs' => [
                    ['id' => "doc-{$id}", 'name' => 'Trade License.pdf', 'type' => 'license', 'uploadedAt' => now()->subMonths(6)->toISOString()],
                ],
                'bank_account' => ['bankName' => 'bKash Merchant', 'accountName' => $shopName, 'accountNo' => '+8801'.fake()->numberBetween(300000000, 999999999), 'routingNo' => 'BKASH'],
                'address' => $address,
                'bio' => $bio,
                'response_rate' => fake()->numberBetween(88, 99),
                'avg_response_time' => fake()->randomElement(['Under 1 hour', 'Under 2 hours', 'Under 3 hours']),
                'commission_rate' => fake()->randomElement([2.5, 3.5, 4, 4.5, 5]),
                'payout_balance' => fake()->numberBetween(9000, 215000),
                'pending_payout' => fake()->numberBetween(0, 68000),
            ]);
        }

        // Delivery partners (mock ids: dlv-01 .. dlv-05)
        $partners = [
            ['dlv-01', 'Habib Mia', 'habib.mia@apnardokan.delivery', 'Motorcycle', 'DHA-1234-KA', ['Banani', 'Gulshan', 'Uttara'], 4.8, 3200, 98.2],
            ['dlv-02', 'Jamal Hossain', 'jamal.hossain@apnardokan.delivery', 'Bicycle', 'DHA-2345-KHA', ['Dhanmondi', 'Mirpur', 'Motijheel'], 4.5, 2100, 95.5],
            ['dlv-03', 'Rashidul Islam', 'rashidul.islam@apnardokan.delivery', 'CNG Auto-rickshaw', 'DHA-3456-GA', ['Agrabad', 'New Market', 'GEC'], 4.3, 1500, 92.0],
            ['dlv-04', 'Shahin Alam', 'shahin.alam@apnardokan.delivery', 'Pickup Van', 'DHA-4567-GHA', ['Sonadanga', 'Khalishpur'], 4.6, 980, 96.4],
            ['dlv-05', 'Motiur Rahman', 'motiur.rahman@apnardokan.delivery', 'Motorcycle', 'DHA-5678-CHA', ['Shaheb Bazar', 'Shibganj'], 4.7, 2400, 97.1],
        ];

        foreach ($partners as [$id, $name, $email, $vehicleType, $regNo, $areas, $rating, $deliveries, $completion]) {
            User::create([
                'id' => "usr-{$id}", 'role' => 'delivery', 'name' => $name, 'email' => $email,
                'phone' => '+8801'.fake()->numberBetween(500000000, 999999999),
                'avatar' => "https://picsum.photos/seed/partner-{$id}/120/120",
                'password' => 'demo1234',
            ]);

            DeliveryPartnerProfile::create([
                'id' => $id,
                'user_id' => "usr-{$id}",
                'vehicle' => ['type' => $vehicleType, 'regNo' => $regNo],
                'service_areas' => $areas,
                'online' => true,
                'rating' => $rating,
                'completed_deliveries' => $deliveries,
                'completion_rate' => $completion,
                'earnings_today' => fake()->numberBetween(350, 1200),
                'earnings_week' => fake()->numberBetween(3500, 12000),
                'total_earnings' => fake()->numberBetween(80000, 900000),
                'payout_balance' => fake()->numberBetween(500, 4000),
            ]);
        }

        // Support agents (mock ids: agt-01 .. agt-04)
        $agents = [
            ['agt-01', 'Sharmin Lucky', 'sharmin@apnardokan.com', 'agent', 842, '4m 12s', 4.8, ['Order Issues', 'Returns', 'Payments']],
            ['agt-02', 'Rafiul Karim', 'rafi@apnardokan.com', 'agent', 691, '6m 40s', 4.6, ['Account', 'Seller Complaints', 'Escalations']],
            ['agt-03', 'Sumaiya Tabassum', 'sumaiya@apnardokan.com', 'lead', 1204, '3m 55s', 4.9, ['All Categories', 'Team Lead']],
            ['agt-04', 'Nahid Hasan', 'nahid@apnardokan.com', 'agent', 320, '11m 02s', 3.9, ['Deliveries']],
        ];

        foreach ($agents as [$id, $name, $email, $agentRole, $resolved, $avg, $satisfaction, $skills]) {
            User::create([
                'id' => "usr-{$id}", 'role' => 'support', 'name' => $name, 'email' => $email,
                'phone' => '+8801'.fake()->numberBetween(100000000, 999999999),
                'avatar' => "https://picsum.photos/seed/agent-{$id}/120/120",
                'password' => 'demo1234',
            ]);

            SupportAgentProfile::create([
                'id' => $id,
                'user_id' => "usr-{$id}",
                'agent_role' => $agentRole,
                'tickets_resolved' => $resolved,
                'avg_response_time' => $avg,
                'satisfaction_score' => $satisfaction,
                'skills' => $skills,
            ]);
        }
    }

    /* ================================================================
     * Categories, brands, products
     * ================================================================ */

    private function seedCatalog(): void
    {
        $categories = [
            ['cat-electronics', 'Electronics', 'electronics', 'Smartphone'],
            ['cat-fashion', 'Fashion', 'fashion', 'Shirt'],
            ['cat-home', 'Home & Living', 'home-living', 'Sofa'],
            ['cat-beauty', 'Beauty & Health', 'beauty-health', 'Sparkles'],
            ['cat-sports', 'Sports & Outdoors', 'sports-outdoors', 'Dumbbell'],
            ['cat-grocery', 'Grocery', 'grocery', 'ShoppingBasket'],
            ['cat-toys', 'Toys & Kids', 'toys-kids', 'ToyBrick'],
            ['cat-auto', 'Automotive', 'automotive', 'Car'],
        ];

        foreach ($categories as [$id, $name, $slug, $icon]) {
            Category::create([
                'id' => $id, 'name' => $name, 'slug' => $slug, 'icon' => $icon,
                'image' => "https://picsum.photos/seed/{$slug}/480/320",
            ]);
        }

        $brandNames = ['Apple', 'Samsung', 'Xiaomi', 'HP', "Levi's", 'H&M', 'Aarong', 'IKEA', 'Otobi', 'RENO', 'Nivea', 'L\'Oréal', 'Nike', 'Adidas', 'MRF', 'Bosch', 'Dell', 'Asus'];
        foreach ($brandNames as $i => $name) {
            Brand::create([
                'id' => 'brd-'.str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT),
                'name' => $name,
                'slug' => Str::slug($name),
            ]);
        }

        // Products — mirror the frontend mock catalog (38 items)
        $productSeeds = [
            // [name, category, brand, price, mrp, description, tags, isFlash, isFeatured, [deliveryDays]]
            ['iPhone 16 Pro 256GB', 'cat-electronics', 'Apple', 169999, 174999, "Apple's flagship with the A18 Pro chip, titanium design and a 48MP pro camera system.", ['new', 'bestseller'], false, true, [2, 5]],
            ['Samsung Galaxy S25 Ultra', 'cat-electronics', 'Samsung', 154999, 159999, 'Galaxy AI powered flagship with a 200MP camera and S Pen built in.', ['bestseller'], false, true, [2, 5]],
            ['Xiaomi 14T Pro 12/512GB', 'cat-electronics', 'Xiaomi', 64999, 74999, 'Leica optics, Dimensity 9300+ and 120W HyperCharge for power users.', ['flash'], true, false, [2, 5]],
            ['HP Pavilion 15 Laptop (i7, 16GB, 512GB SSD)', 'cat-electronics', 'HP', 118000, 128000, 'Everyday performance laptop with a vivid FHD display and backlit keyboard.', ['popular'], false, false, [2, 5]],
            ['Dell Inspiron 14 2-in-1', 'cat-electronics', 'Dell', 104500, 112000, 'Convertible laptop with touch display, ideal for students and creators.', [], false, false, [2, 5]],
            ['Asus ROG Strix Gaming Laptop', 'cat-electronics', 'Asus', 219000, 229000, 'RTX 4060 powered gaming laptop with 165Hz display.', ['gaming'], false, false, [2, 5]],
            ['Samsung 55" Crystal 4K UHD Smart TV', 'cat-electronics', 'Samsung', 84500, 96900, 'Crystal Processor 4K upscales every scene with vivid colors.', ['popular'], false, true, [2, 5]],
            ['Xiaomi Smart Band 9', 'cat-electronics', 'Xiaomi', 3490, 4490, "1.62\" AMOLED fitness band with 21-day battery and 150+ sport modes.", ['flash'], true, false, [2, 5]],
            ['AirPods Pro 2 (USB-C)', 'cat-electronics', 'Apple', 24900, 27900, 'Active noise cancellation, adaptive audio and MagSafe charging case.', [], false, false, [2, 5]],
            ["Levi's 511 Slim Fit Jeans", 'cat-fashion', "Levi's", 4490, 5990, 'Iconic slim fit denim crafted from stretch cotton for all-day comfort.', ['bestseller'], false, true, [2, 4]],
            ["H&M Men's Oversized T-Shirt", 'cat-fashion', 'H&M', 1290, 1590, 'Soft cotton oversized tee with a relaxed streetwear silhouette.', [], false, false, [2, 4]],
            ["Aarong Women's Panjabi Set", 'cat-fashion', 'Aarong', 5950, 6950, 'Hand-finished cotton panjabi set with intricate embroidery.', ['festive'], false, false, [2, 4]],
            ['Aarong Jamdani Saree', 'cat-fashion', 'Aarong', 14990, 16990, 'Authentic Tangail Jamdani weave, a symbol of Bangladeshi heritage.', ['premium'], false, false, [2, 4]],
            ["Nike Air Force 1 '07", 'cat-fashion', 'Nike', 12400, 13900, 'The basketball icon in crisp white leather with classic AF-1 cushioning.', ['bestseller'], false, true, [2, 4]],
            ['Adidas Samba OG', 'cat-fashion', 'Adidas', 10900, 11900, 'Vintage-inspired low-top trainer with suede overlays and gum sole.', ['trending'], false, false, [2, 4]],
            ["H&M Women's Maxi Dress", 'cat-fashion', 'H&M', 2190, 2690, 'Flowing maxi dress in soft viscose with a flattering A-line cut.', [], false, false, [2, 4]],
            ['Otobi 3-Seater Fabric Sofa', 'cat-home', 'Otobi', 48500, 55000, 'Contemporary 3-seater with high-resilience foam and durable fabric.', ['popular'], false, true, [3, 6]],
            ['IKEA MALM Bed Frame (Queen)', 'cat-home', 'IKEA', 28900, 31900, 'Clean-lined bed frame with generous under-bed storage in white.', [], false, false, [3, 6]],
            ['RENO Premium Mattress (Queen)', 'cat-home', 'RENO', 21900, 27900, 'Memory foam mattress engineered for pressure relief and cool sleep.', ['flash'], true, false, [3, 6]],
            ['Otobi Dining Table 6-Seater', 'cat-home', 'Otobi', 36000, 39900, 'Solid sheesham wood dining table with classic finish.', [], false, false, [3, 6]],
            ['IKEA POÄNG Armchair', 'cat-home', 'IKEA', 12900, 14500, 'Comfortable armchair with bentwood frame and moulded seat cushion.', ['popular'], false, true, [3, 6]],
            ['Nivea Soft Moisturizing Cream 300ml', 'cat-beauty', 'Nivea', 590, 720, 'Light, fast-absorbing moisturizer with jojoba oil and vitamin E.', ['bestseller'], false, true, [2, 3]],
            ["L'Oréal Paris Revitalift Night Cream", 'cat-beauty', 'L\'Oréal', 1650, 1900, 'Anti-aging night cream with Pro-Retinol for visibly smoother skin.', [], false, false, [2, 3]],
            ['Nivea Men Active Energy Shower Gel', 'cat-beauty', 'Nivea', 380, 450, 'Energizing shower gel with charcoal and a fresh masculine scent.', [], false, false, [2, 3]],
            ["L'Oréal Paris Infallible Foundation", 'cat-beauty', 'L\'Oréal', 1490, 1650, '24-hour matte foundation with medium-to-full coverage.', [], false, false, [2, 3]],
            ['Nike Pro Dri-FIT Training Tee', 'cat-sports', 'Nike', 2900, 3400, 'Sweat-wicking training tee that keeps you cool and dry.', [], false, false, [2, 4]],
            ['Adidas Performance Backpack', 'cat-sports', 'Adidas', 4200, 4900, 'Sleek 32L backpack with padded laptop compartment.', ['popular'], false, true, [2, 4]],
            ['Nike Revolution 7 Running Shoes', 'cat-sports', 'Nike', 6900, 7900, 'Everyday running shoe with soft foam cushioning and a breathable upper.', [], false, false, [2, 4]],
            ['MRF Cricket Bat (Grade A Kashmir Willow)', 'cat-sports', 'MRF', 8900, 10500, 'Lightweight English willow bat with a thick edge profile.', ['cricket'], false, false, [2, 4]],
            ['Premium Basmati Rice 5kg', 'cat-grocery', 'RENO', 950, 1100, 'Aged long-grain basmati rice, aromatic and fluffy every time.', ['daily'], false, false, [1, 2]],
            ['Cold Pressed Mustard Oil 1L', 'cat-grocery', 'RENO', 420, 490, 'Traditional kachi ghani mustard oil, naturally extracted.', ['daily'], false, false, [1, 2]],
            ['Organic Honey 500g', 'cat-grocery', 'RENO', 780, 900, 'Pure forest honey collected from the Sundarbans.', ['premium'], false, false, [1, 2]],
            ['Assorted Dry Fruits Gift Pack', 'cat-grocery', 'RENO', 1450, 1750, 'Premium mix of almonds, cashews, raisins and pistachios.', ['gift'], false, false, [1, 2]],
            ['STEM Building Blocks 500pcs', 'cat-toys', 'Bosch', 2200, 2800, 'Educational building set that sparks creativity and logic.', ['kids'], false, false, [2, 4]],
            ['Remote Control Monster Truck', 'cat-toys', 'Bosch', 3100, 3700, 'High-speed RC truck with off-road tyres and long battery life.', ['popular'], false, true, [2, 4]],
            ['Baby Walker with Music & Lights', 'cat-toys', 'Bosch', 1850, 2300, 'Interactive walker with tunes, lights and activity panel.', ['baby'], false, false, [2, 4]],
            ['Bosch Car Battery 60Ah', 'cat-auto', 'Bosch', 9800, 11500, 'Maintenance-free battery with 24-month warranty.', [], false, false, [3, 5]],
            ['MRF Tyre 185/65 R15', 'cat-auto', 'MRF', 7200, 8200, 'All-season radial tyre for reliable grip in any weather.', [], false, false, [3, 5]],
            ['Bosch Wiper Blades (Set of 2)', 'cat-auto', 'Bosch', 1350, 1600, 'Silent, streak-free wipers with universal fitment.', ['popular'], false, true, [3, 5]],
        ];

        $sellerIds = ['sel-techpoint', 'sel-stylehub', 'sel-homeluxe', 'sel-glow', 'sel-sportzone', 'sel-krishi', 'sel-kidsworld', 'sel-autocare', 'sel-electronix', 'sel-banglashop'];

        foreach ($productSeeds as $i => [$name, $categoryId, $brand, $price, $mrp, $description, $tags, $isFlash, $isFeatured, $deliveryDays]) {
            $id = 'prd-'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT);
            $sellerId = $sellerIds[$i % count($sellerIds)];
            $stock = fake()->numberBetween(2, 120);
            $flashEnds = $isFlash ? now()->addDays(fake()->numberBetween(1, 3)) : null;

            Product::create([
                'id' => $id,
                'seller_id' => $sellerId,
                'category_id' => $categoryId,
                'brand' => $brand,
                'sku' => 'APD-'.Str::upper(Str::substr($brand, 0, 3)).'-'.($i + 1) * 37,
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => $description,
                'highlights' => ['Premium quality', 'Warranty included', 'Fast delivery'],
                'price' => $price,
                'mrp' => $mrp,
                'currency' => 'BDT',
                'stock' => $stock,
                'rating' => round(3.6 + fake()->randomFloat(1, 0, 1.4), 1),
                'review_count' => fake()->numberBetween(8, 400),
                'sold_count' => fake()->numberBetween(20, 4000),
                'tags' => $tags,
                'is_flash_sale' => $isFlash,
                'flash_sale_ends_at' => $flashEnds,
                'is_featured' => $isFeatured,
                'is_published' => true,
                'delivery_estimate_days' => $deliveryDays,
                'free_delivery' => $price >= 499,
                'created_at' => now()->subMonths(fake()->numberBetween(1, 24)),
            ]);

            // 4 images
            for ($img = 0; $img < 4; $img++) {
                ProductImage::create([
                    'id' => "{$id}-img{$img}",
                    'product_id' => $id,
                    'url' => "https://picsum.photos/seed/apnar-{$id}-{$img}/640/640",
                    'alt' => "{$name} — image ".($img + 1),
                    'sort_order' => $img,
                ]);
            }

            // Variants for every 3rd product
            if ($i % 3 === 0) {
                foreach (['Midnight Black', 'Pearl White', 'Sky Blue'] as $vi => $value) {
                    ProductVariant::create([
                        'id' => "{$id}-v{$vi}",
                        'product_id' => $id,
                        'name' => 'Color',
                        'value' => $value,
                        'price_delta' => $vi === 0 ? 0 : 200 * $vi,
                        'stock' => fake()->numberBetween(4, 40),
                    ]);
                }
            }
        }

        // Backfill category product counts
        foreach (Category::all() as $category) {
            $category->update([
                'product_count' => Product::where('category_id', $category->id)->count(),
            ]);
        }
    }

    /* ================================================================
     * Carts + wishlists
     * ================================================================ */

    private function seedCartsAndWishlists(): void
    {
        foreach (User::where('role', 'customer')->take(8)->get() as $user) {
            Cart::create(['id' => 'cart-'.$user->id, 'user_id' => $user->id]);
        }
    }

    /* ================================================================
     * Orders (128, spanning every status) + payments + earnings
     * ================================================================ */

    private function seedOrders(): void
    {
        $statuses = array_keys(self::STATUS_LABELS);
        $customers = User::where('role', 'customer')->get();
        $products = Product::with('variants', 'images')->get();
        $partners = DeliveryPartnerProfile::pluck('id')->all();
        $sellerProfiles = SellerProfile::pluck('id')->all();

        for ($i = 1; $i <= 128; $i++) {
            $customer = $customers[$i % $customers->count()];
            $itemCount = fake()->numberBetween(1, 3);
            $items = [];
            $subtotal = 0;

            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products[(($i * 7) + ($j * 13)) % $products->count()];
                $qty = fake()->numberBetween(1, 3);
                $price = $product->price;
                $subtotal += $price * $qty;
                $items[] = [
                    'id' => "oi-{$i}-{$j}",
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'image' => $product->images->first()?->url ?? '',
                    'quantity' => $qty,
                    'price' => $price,
                    'variant_label' => $product->variants->first()?->value,
                    'seller_id' => $product->seller_id,
                ];
            }

            $discount = fake()->boolean(30) ? round($subtotal * 0.1) : 0;
            $shippingFee = $subtotal > 499 ? 0 : 60;
            $tax = round($subtotal * 0.05);
            $total = $subtotal - $discount + $shippingFee + $tax;
            $status = $statuses[fake()->numberBetween(0, count($statuses) - 1)];
            // Newest orders land today / this week so "today" KPIs stay alive.
            $placedAt = $i <= 10
                ? now()->subHours(fake()->numberBetween(2, 20))
                : ($i <= 20
                    ? now()->subDays(fake()->numberBetween(1, 6))->subHours(fake()->numberBetween(6, 21))
                    : now()->subDays(fake()->numberBetween(0, 90))->subHours(fake()->numberBetween(6, 21)));
            $paymentMethod = fake()->randomElement(['bkash', 'nagad', 'card', 'cod']);
            $orderId = 'ord-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT);
            $partnerId = in_array($status, ['out_for_delivery', 'delivered', 'return_requested', 'returned', 'refunded'], true)
                ? $partners[$i % count($partners)] : null;

            Order::create([
                'id' => $orderId,
                'order_code' => 'APD'.str_pad((string) (100000 + $i), 6, '0', STR_PAD_LEFT),
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone,
                'customer_email' => $customer->email,
                'seller_id' => $items[0]['seller_id'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_fee' => $shippingFee,
                'tax' => $tax,
                'total' => $total,
                'coupon_code' => $discount > 0 ? fake()->randomElement(['WELCOME10', 'APD50', 'FREESHIP']) : null,
                'payment_method' => $paymentMethod,
                'payment_status' => $status === 'refunded' ? 'refunded' : ($paymentMethod === 'cod' ? 'pending' : ($status === 'cancelled' ? 'failed' : 'paid')),
                'status' => $status,
                'delivery_address' => [
                    'id' => "addr-{$orderId}",
                    'label' => 'Home',
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'line1' => fake()->streetName().', '.fake()->streetAddress(),
                    'city' => fake()->randomElement(['Dhaka', 'Chattogram', 'Sylhet', 'Khulna']),
                    'area' => fake()->randomElement(['Banani', 'Dhanmondi', 'Gulshan', 'Uttara']),
                    'postal_code' => (string) fake()->numberBetween(1000, 9999),
                    'isDefault' => true,
                ],
                'assigned_partner_id' => $partnerId,
                'eta' => $status === 'out_for_delivery' ? now()->addHours(2) : null,
                'cod_amount' => $paymentMethod === 'cod' ? $total : null,
                'placed_at' => $placedAt,
                'updated_at' => $placedAt->copy()->addHours(40),
            ]);

            foreach ($items as $item) {
                OrderItem::create($item + ['order_id' => $orderId]);
            }

            // Timeline
            $timelineSteps = match ($status) {
                'cancelled' => ['placed', 'cancelled'],
                'placed' => ['placed'],
                'confirmed' => ['placed', 'confirmed'],
                'packed' => ['placed', 'confirmed', 'packed'],
                'shipped' => ['placed', 'confirmed', 'packed', 'shipped'],
                'return_requested', 'returned', 'refunded' => ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', $status],
                default => ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'],
            };

            foreach ($timelineSteps as $stepIndex => $step) {
                OrderStatusHistory::create([
                    'order_id' => $orderId,
                    'status' => $step,
                    'label' => self::STATUS_LABELS[$step],
                    'timestamp' => $placedAt->copy()->addHours($stepIndex * fake()->numberBetween(5, 22)),
                    'note' => $step === 'out_for_delivery' && $status === 'out_for_delivery' ? 'Delivery partner en route' : null,
                ]);
            }

            // Payment record
            Payment::create([
                'id' => "pay-{$orderId}",
                'order_id' => $orderId,
                'method' => $paymentMethod,
                'status' => $status === 'refunded' ? 'refunded' : ($paymentMethod === 'cod' ? 'pending' : ($status === 'cancelled' ? 'failed' : 'paid')),
                'amount' => $total,
                'transaction_ref' => $paymentMethod === 'cod' ? null : 'TXN'.fake()->numberBetween(100000, 999999),
                'masked_account' => $paymentMethod === 'bkash' ? '017******'.fake()->numberBetween(10, 99) : null,
                'paid_at' => $status === 'cancelled' ? null : $placedAt,
            ]);

            // Return request for return-related statuses
            if (in_array($status, ['return_requested', 'returned', 'refunded'], true)) {
                ReturnRequest::create([
                    'id' => "rr-{$orderId}",
                    'order_id' => $orderId,
                    'reason' => fake()->randomElement(['Wrong item delivered', 'Damaged in transit', 'Item not as described', 'No longer needed']),
                    'detail' => 'The item arrived with visible damage to the packaging.',
                    'images' => [],
                    'requested_at' => $placedAt->copy()->addHours(50),
                    'status' => $status === 'refunded' ? 'refunded' : ($status === 'returned' ? 'approved' : 'pending'),
                    'refund_amount' => $status === 'refunded' ? $total : null,
                    'decision_note' => $status === 'refunded' ? 'Refund issued to original payment method' : null,
                ]);
            }

            // Seller earning (commission accrual on completed orders)
            if (in_array($status, ['delivered', 'out_for_delivery'], true)) {
                $seller = SellerProfile::find($items[0]['seller_id']);
                $commission = round($subtotal * ($seller->commission_rate / 100));
                SellerEarning::create([
                    'seller_id' => $items[0]['seller_id'],
                    'order_id' => $orderId,
                    'gross' => $subtotal,
                    'commission' => $commission,
                    'net' => $subtotal - $commission,
                ]);
            }
        }
    }

    /* ================================================================
     * Reviews + replies
     * ================================================================ */

    private function seedReviews(): void
    {
        $customers = User::where('role', 'customer')->get();
        $products = Product::all();
        $bodies = [
            'Absolutely love it! Delivery was fast and the packaging was perfect.',
            'Good quality for the price. Would recommend to friends.',
            'Works exactly as described. The seller was very responsive.',
            'Decent product but delivery took longer than expected.',
            'Exceeded my expectations. Premium feel, highly recommended!',
            'Value for money. Happy with the purchase overall.',
        ];

        $counter = 0;
        foreach ($products as $product) {
            $count = fake()->numberBetween(2, 6);
            for ($j = 0; $j < $count; $j++) {
                $customer = $customers[($counter + $j) % $customers->count()];
                $counter++;
                $rating = max(1, min(5, round($product->rating + (fake()->randomFloat(1, -1, 1)))));

                $review = Review::create([
                    'id' => "rev-{$product->id}-{$j}",
                    'product_id' => $product->id,
                    'customer_id' => $customer->id,
                    'rating' => $rating,
                    'title' => $rating >= 4 ? fake()->randomElement(['Excellent!', 'Good value', 'Highly recommend', 'As described']) : 'Needs improvement',
                    'body' => $bodies[fake()->numberBetween(0, count($bodies) - 1)],
                    'images' => $j % 3 === 0 ? ["https://picsum.photos/seed/revimg-{$counter}/240/240"] : [],
                    'verified_purchase' => fake()->boolean(80),
                    'created_at' => now()->subDays(fake()->numberBetween(1, 60)),
                ]);

                if (fake()->boolean(50)) {
                    ReviewReply::create([
                        'review_id' => $review->id,
                        'seller_id' => $product->seller_id,
                        'body' => "Thank you for your feedback! We're glad you're happy with your purchase.",
                        'created_at' => now()->subDays(fake()->numberBetween(0, 5)),
                    ]);
                }
            }
        }
    }

    /* ================================================================
     * Support tickets + messages
     * ================================================================ */

    private function seedTickets(): void
    {
        $customers = User::where('role', 'customer')->take(10)->get();
        $agents = SupportAgentProfile::pluck('id')->all();
        $categories = ['order_issue', 'payment', 'return', 'account', 'seller_complaint', 'delivery', 'other'];
        $statuses = ['new', 'open', 'pending', 'resolved'];
        $priorities = ['low', 'medium', 'high', 'urgent'];

        for ($i = 1; $i <= 24; $i++) {
            $customer = $customers[$i % $customers->count()];
            $category = $categories[fake()->numberBetween(0, count($categories) - 1)];
            $status = $statuses[fake()->numberBetween(0, 3)];
            $ticketId = 'tkt-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT);
            $assigned = $status !== 'new' ? $agents[$i % count($agents)] : null;

            SupportTicket::create([
                'id' => $ticketId,
                'code' => 'TKT-'.str_pad((string) (1000 + $i), 4, '0', STR_PAD_LEFT),
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'subject' => fake()->randomElement(['Order not delivered yet', 'Payment issue', 'Need a refund', 'Account locked', 'Wrong item received', 'Delivery delayed']),
                'category' => $category,
                'status' => $status,
                'priority' => $priorities[fake()->numberBetween(0, 3)],
                'order_code' => fake()->boolean(60) ? 'APD'.fake()->numberBetween(100000, 100128) : null,
                'assigned_agent_id' => $assigned,
                'created_by' => 'customer',
                'sla_deadline' => now()->addHours(fake()->numberBetween(2, 48)),
                'escalated' => $status === 'pending' && fake()->boolean(30) ? ['to' => 'admin', 'reason' => 'Needs manager review', 'at' => now()->toISOString()] : null,
                'created_at' => now()->subDays(fake()->numberBetween(0, 20)),
                'updated_at' => now()->subHours(fake()->numberBetween(0, 20)),
            ]);

            TicketMessage::create([
                'id' => "tktmsg-{$i}-0",
                'ticket_id' => $ticketId,
                'author_id' => $customer->id,
                'author_name' => $customer->name,
                'author_role' => 'customer',
                'body' => 'I need help with my recent order.',
                'is_internal_note' => false,
                'created_at' => now()->subDays(fake()->numberBetween(0, 20)),
            ]);

            if ($status !== 'new') {
                TicketMessage::create([
                    'id' => "tktmsg-{$i}-1",
                    'ticket_id' => $ticketId,
                    'author_id' => $assigned,
                    'author_name' => 'Support Team',
                    'author_role' => 'support',
                    'body' => 'Thanks for reaching out — we are looking into this for you.',
                    'is_internal_note' => false,
                    'created_at' => now()->subDays(fake()->numberBetween(0, 19)),
                ]);
            }
        }
    }

    /* ================================================================
     * Promotions, banners, knowledge base
     * ================================================================ */

    private function seedPromotionsAndCms(): void
    {
        $coupons = [
            ['cpm-01', 'WELCOME10', 'Welcome 10% off', 'percent', 10, 0, null, true],
            ['cpm-02', 'APD50', 'BDT 50 off your order', 'fixed', 50, 0, null, true],
            ['cpm-03', 'FREESHIP', 'Free shipping', 'fixed', 60, 499, null, true],
            ['cpm-04', 'EIDMEGA', 'Eid Mega Sale', 'percent', 25, 2000, 500, true],
            ['cpm-05', 'FLASH15', 'Flash Sale 15%', 'percent', 15, 1000, 300, true],
        ];

        foreach ($coupons as [$id, $code, $title, $type, $value, $min, $max, $active]) {
            Coupon::create([
                'id' => $id, 'code' => $code, 'title' => $title, 'discount_type' => $type,
                'discount_value' => $value, 'min_order' => $min, 'max_discount' => $max,
                'starts_at' => now()->subDays(10), 'ends_at' => now()->addDays(20),
                'usage_limit' => 500, 'used_count' => fake()->numberBetween(20, 400),
                'active' => $active,
            ]);
        }

        FlashSale::create([
            'id' => 'fls-01',
            'title' => 'Mega Flash Sale',
            'starts_at' => now()->subHours(2),
            'ends_at' => now()->addHours(34),
            'discount_percent' => 25,
            'active' => true,
        ]);

        $banners = [
            ['bnr-01', 'Eid Mega Sale', 'Up to 50% off everything', 'bg-lime', 'Shop Now', '/flash-sale'],
            ['bnr-02', 'Tech Week', 'Flagship deals on Apple & Samsung', 'bg-ink', 'Browse', '/category/electronics'],
            ['bnr-03', 'Fresh Groceries', 'Farm to door in 24 hours', 'bg-smoke', 'Order', '/category/grocery'],
        ];

        foreach ($banners as [$id, $title, $subtitle, $bg, $cta, $href]) {
            CmsBanner::create([
                'id' => $id, 'title' => $title, 'subtitle' => $subtitle,
                'image' => "https://picsum.photos/seed/banner-{$id}/1600/500",
                'cta_label' => $cta, 'cta_href' => $href, 'bg_class' => $bg, 'active' => true,
            ]);
        }

        $articles = [
            ['art-01', 'How to track your order', 'Orders', 'Go to My Orders and select the order to see live status.', 1204],
            ['art-02', 'Return & refund policy', 'Returns', 'Items can be returned within 7 days of delivery.', 893],
            ['art-03', 'How COD works', 'Payments', 'Pay in cash when your delivery arrives.', 1560],
            ['art-04', 'Seller onboarding guide', 'Sellers', 'Complete your documents and get approved in 24h.', 342],
        ];

        foreach ($articles as [$id, $title, $category, $body, $views]) {
            KnowledgeArticle::create([
                'id' => $id, 'title' => $title, 'category' => $category,
                'body' => $body, 'views' => $views, 'updated_at' => now()->subDays(fake()->numberBetween(1, 30)),
            ]);
        }
    }

    /* ================================================================
     * Payouts, settings, audit logs
     * ================================================================ */

    private function seedPayoutsAndSettings(): void
    {
        foreach (SellerProfile::where('status', 'active')->get() as $seller) {
            Payout::create([
                'id' => 'pout-'.$seller->id,
                'seller_id' => $seller->id,
                'amount' => fake()->numberBetween(10000, 200000),
                'method' => 'bkash',
                'account_summary' => 'bKash ••••'.fake()->numberBetween(1000, 9999),
                'status' => fake()->randomElement(['pending', 'processing', 'paid']),
                'period_start' => now()->subDays(14),
                'period_end' => now(),
                'paid_at' => fake()->boolean(50) ? now()->subDays(fake()->numberBetween(1, 10)) : null,
                'created_at' => now()->subDays(fake()->numberBetween(1, 14)),
            ]);
        }

        AdminSetting::create(['key' => 'commission_rate', 'value' => ['default' => 4.0]]);
        AdminSetting::create(['key' => 'free_delivery_threshold', 'value' => ['amount' => 499]]);
        AdminSetting::create(['key' => 'shipping_zones', 'value' => ['dhaka' => 60, 'outside' => 120]]);
        AdminSetting::create(['key' => 'tax_rate', 'value' => ['percent' => 5]]);

        AuditLog::create([
            'id' => 'audit-01', 'admin_id' => 'usr-adm-01', 'admin_name' => 'Ashraful Islam',
            'action' => 'seeded_database', 'target' => 'system', 'detail' => 'Initial mock-equivalent data load', 'at' => now(),
        ]);
    }
}
