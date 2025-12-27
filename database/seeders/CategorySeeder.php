<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
      public function run(): void
    {
        $categories = [
            ['name' => 'Coffee', 'status' => 'active'],
            ['name' => 'Non-Coffee', 'status' => 'active'],
            ['name' => 'Tea', 'status' => 'active'],
            ['name' => 'Snack', 'status' => 'active'],
            ['name' => 'Dessert', 'status' => 'inactive'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
