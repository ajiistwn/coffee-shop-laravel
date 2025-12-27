<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\User;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil beberapa users dari database (untuk simulasi admin)
        $users = User::inRandomOrder()->limit(5)->get();

        // Loop untuk membuat data dummy
        for ($i = 0; $i < 20; $i++) {
            // Simulasi pembelian oleh user tanpa login
            $isGuest = fake()->boolean(70); // 70% kemungkinan guest (tanpa login)

            // Generate session token jika guest
            $sessionToken = $isGuest ? $this->generateSessionToken() : null;

            // Pilih user_id atau NULL (jika guest atau admin)
            $userId = $isGuest ? null : ($users->random()?->id ?? null);

            // Generate data order
            Order::create([
                'user_id' => $userId,
                'session_token' => $sessionToken,
                'name' => fake()->name(),
                'receipt_number' => $this->generateUniqueReceiptNumber(),
                'total' => rand(100000, 1000000), // Total antara 100.000 - 1.000.000
                'payment_method' => fake()->randomElement(['cash', 'qris', 'ewallet', 'va']),
                'payment_status' => fake()->randomElement(['pending', 'paid', 'failed']),
                'status' => fake()->randomElement(['pending', 'preparing', 'completed', 'cancelled']),
                'xendit_invoice_id' => fake()->optional()->uuid(), // Invoice ID opsional
            ]);
        }
    }

     private function generateUniqueReceiptNumber(): string
    {
        do {
            $receiptNumber = 'ORD-' . fake()->unique()->numerify('######');
        } while (Order::where('receipt_number', $receiptNumber)->exists());

        return $receiptNumber;
    }

    /**
     * Generate session token using crypto.randomUUID().
     */
    private function generateSessionToken(): string
    {
        return \Illuminate\Support\Str::uuid(); // Simulasi crypto.randomUUID()
    }
}
