<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::create([
            'name' => 'admin',
            'email' => 'admin@example.com',
            'role' => 'super_admin',
            'password' => bcrypt('password'), // Password di-hash
        ]);

        // Membuat data admin user
        User::create([
            'name' => 'Aji Setiawan',
            'email' => 'ajiisetiawan09@gmail.com',
            'role' => 'super_admin',
            'password' => bcrypt('password'), // Password di-hash
        ]);

        // Membuat data regular user
        User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'role' => 'user',
            'password' => bcrypt('password'), // Password di-hash
        ]);

        // Menambahkan lebih banyak data jika diperlukan
        User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'role' => 'admin',
            'password' => bcrypt('password'), // Password di-hash
        ]);

         User::create([
            'name' => 'Budi',
            'email' => 'budi@example.com',
            'role' => 'user',
            'password' => bcrypt('password'), // Password di-hash
        ]);
        User::create([
            'name' => 'Doni',
            'email' => 'doni@example.com',
            'role' => 'user',
            'password' => bcrypt('password'), // Password di-hash
        ]);
    }
}
