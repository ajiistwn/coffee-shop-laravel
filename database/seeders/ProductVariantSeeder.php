<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductVariant;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
     public function run(): void
    {
        // Daftar produk beserta varian Ice & Hot + harganya (dalam Rupiah)
        $variantData = [
            // COFFEE
            'Diet Coffee' => [
                ['name' => 'Ice', 'price' => 22000],
                ['name' => 'Hot', 'price' => 129000],
            ],
            'Butter Scotch' => [
                ['name' => 'Ice', 'price' => 22000],
                ['name' => 'Hot', 'price' => 129000],
            ],
            'Salted Caramel' => [
                ['name' => 'Ice', 'price' => 22000],
                ['name' => 'Hot', 'price' => 129000],
            ],
            'Caramel Machiato' => [
                ['name' => 'Ice', 'price' => 22000],
                ['name' => 'Hot', 'price' => 129000],
            ],
            'Almond' => [
                ['name' => 'Ice', 'price' => 22000],
                ['name' => 'Hot', 'price' => 129000],
            ],

            // NON-COFFEE
            'Chocolate' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Red Velvet' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Matcha' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Taro' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Vanilla' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Thai Tea' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Green Tea' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Cookies n Cream' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Mineral Water' => [
                ['name' => 'Regular', 'price' => 8000], // hanya satu varian
            ],

            // TEA
            'Green Tea' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Lychee Tea' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],
            'Lemon Tea' => [
                ['name' => 'Ice', 'price' => 18000],
                ['name' => 'Hot', 'price' => 18000],
            ],

            // SNACK — Semua snack hanya punya satu varian (tanpa Ice/Hot)
            'Stomay Ayam' => [
                ['name' => 'Regular', 'price' => 26000],
            ],
            'Dimsum' => [
                ['name' => 'Regular', 'price' => 15000],
            ],
            'Tahu Bakso' => [
                ['name' => 'Regular', 'price' => 15000],
            ],
            'Cheng Rujak' => [
                ['name' => 'Regular', 'price' => 15000],
            ],
            'Pisang Goreng' => [
                ['name' => 'Regular', 'price' => 10000],
            ],
            'Eslerman' => [
                ['name' => 'Regular', 'price' => 15000],
            ],
            'Mini Pao' => [
                ['name' => 'Regular', 'price' => 15000],
            ],
            'Donut Lili' => [
                ['name' => 'Regular', 'price' => 15000],
            ],
            'Pisces Lemon' => [
                ['name' => 'Regular', 'price' => 15000],
            ],
            'Sosis' => [
                ['name' => 'Regular', 'price' => 10000],
            ],
        ];

        foreach ($variantData as $productName => $variants) {
            $product = Product::where('name', $productName)->first();

            if (!$product) {
                continue; // Lewati jika produk tidak ditemukan
            }

            foreach ($variants as $variant) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => $variant['name'],
                    'status' => 'available',
                    'price' => $variant['price'],
                ]);
            }
        }
    }
}
