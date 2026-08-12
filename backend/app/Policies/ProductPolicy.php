<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Product $product): bool
    {
        return $product->isPublished || $user->role === 'admin' || $this->owns($user, $product);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['seller', 'admin'], true);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->role === 'admin' || $this->owns($user, $product);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->role === 'admin' || $this->owns($user, $product);
    }

    public function moderate(User $user): bool
    {
        return $user->role === 'admin';
    }

    private function owns(User $user, Product $product): bool
    {
        return $user->role === 'seller'
            && $user->sellerProfile?->id === $product->seller_id;
    }
}
