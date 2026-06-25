<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Str;

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
            $isGuest = random_int(1, 100) <= 70; // 70% kemungkinan guest (tanpa login)

            // Generate session token jika guest
            $sessionToken = $isGuest ? $this->generateSessionToken() : null;

            // Pilih user_id atau NULL (jika guest atau admin)
            $userId = $isGuest ? null : ($users->random()?->id ?? null);

            // Generate data order
            Order::create([
                'user_id' => $userId,
                'session_token' => $sessionToken,
                'name' => $this->randomCustomerName(),
                'receipt_number' => $this->generateUniqueReceiptNumber(),
                'total' => rand(100000, 1000000), // Total antara 100.000 - 1.000.000
                'payment_method' => $this->randomElement(['cash', 'qris', 'ewallet', 'va']),
                'payment_status' => $this->randomElement(['pending', 'paid', 'failed']),
                'status' => $this->randomElement(['pending', 'preparing', 'completed', 'cancelled']),
                'xendit_invoice_id' => random_int(1, 100) <= 50 ? (string) Str::uuid() : null,
            ]);
        }
    }

     private function generateUniqueReceiptNumber(): string
    {
        do {
            $receiptNumber = 'ORD-' . str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (Order::where('receipt_number', $receiptNumber)->exists());

        return $receiptNumber;
    }

    /**
     * Generate session token using crypto.randomUUID().
     */
    private function generateSessionToken(): string
    {
        return (string) Str::uuid(); // Simulasi crypto.randomUUID()
    }

    private function randomCustomerName(): string
    {
        return $this->randomElement([
            'Andi Saputra',
            'Budi Santoso',
            'Citra Lestari',
            'Dewi Anggraini',
            'Eko Prasetyo',
            'Fitri Rahma',
            'Gilang Ramadhan',
            'Hana Putri',
        ]);
    }

    /**
     * @param array<int, string> $items
     */
    private function randomElement(array $items): string
    {
        return $items[array_rand($items)];
    }
}
