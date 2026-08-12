<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = \App\Models\User::class;

    public function definition(): array
    {
        return [
            'id' => 'usr-'.Str::random(8),
            'role' => 'customer',
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+8801'.fake()->numberBetween(300000000, 999999999),
            'avatar' => 'https://picsum.photos/seed/'.Str::random(6).'/120/120',
            'password' => 'demo1234',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }
}
