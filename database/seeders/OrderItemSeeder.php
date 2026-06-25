<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OrderItem;

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua order dan product dari database
        $orders = Order::all();
        $products = Product::all();
        $variants = ProductVariant::inRandomOrder()->limit(5)->get();

        // Loop untuk membuat data dummy
        foreach ($orders as $order) {
            // Pilih random produk (antara 1 hingga 5 produk per order)
            $selectedProducts = $products->random(rand(1, 5));

            foreach ($selectedProducts as $product) {
                // Pilih random variant atau null
                $variant = $variants->random() ?? null;

                // Hitung qty, price, dan subtotal
                $qty = rand(1, 5); // Jumlah item antara 1-5
                $price = rand(10000, 100000); // Harga antara 10.000 - 100.000
                $subtotal = $qty * $price;

                // Buat data order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'variant_id' => $variant?->id,
                    'qty' => $qty,
                    'price' => $price,
                    'subtotal' => $subtotal,
                    'notes' => random_int(1, 100) <= 40 ? $this->randomNote() : null,
                ]);
            }
        }
    }

    private function randomNote(): string
    {
        $notes = [
            'Tanpa gula',
            'Es sedikit',
            'Tambah topping',
            'Tidak terlalu panas',
            'Bungkus terpisah',
        ];

        return $notes[array_rand($notes)];
    }
}
