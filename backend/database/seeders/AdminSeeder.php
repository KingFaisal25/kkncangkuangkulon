<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['nim' => 'admin'],
            [
                'nama' => 'Admin KKN',
                'jurusan' => 'Admin',
                'password' => Hash::make(env('ADMIN_PASSWORD', 'change-me-before-deploy')),
                'role' => 'admin',
            ]
        );
    }
}

