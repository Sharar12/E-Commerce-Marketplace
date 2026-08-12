<?php

namespace App\Http\Requests\Api\V1\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $role = $this->input('role', 'customer');

        $rules = [
            'role' => ['sometimes', Rule::in(['customer', 'seller', 'delivery'])],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['sometimes', 'string', 'max:20'],
        ];

        if ($role === 'seller') {
            $rules['shop_name'] = ['required', 'string', 'max:120'];
            $rules['slug'] = ['sometimes', 'string', 'max:190', 'unique:seller_profiles,slug'];
            $rules['address'] = ['sometimes', 'string', 'max:255'];
        }

        if ($role === 'delivery') {
            $rules['vehicle_type'] = ['sometimes', 'string', 'max:60'];
            $rules['vehicle_reg_no'] = ['sometimes', 'string', 'max:40'];
            $rules['service_areas'] = ['sometimes', 'array'];
        }

        return $rules;
    }
}
