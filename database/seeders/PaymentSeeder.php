<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Payment;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua order dari database
        $orders = Order::all();

        // Loop untuk membuat data dummy
        foreach ($orders as $order) {
            // Generate data payment
            Payment::create([
                'order_id' => $order->id,
                'payment_channel' => $this->getRandomPaymentChannel(),
                'reference_id' => $this->generateReferenceId(),
                'status' => fake()->randomElement(['pending', 'paid', 'failed']),
                'amount' => $order->total, // Jumlah pembayaran sama dengan total order
                'raw_callback' => $this->generateRawCallback(), // Simulasi callback JSON
            ]);
        }
    }

    /**
     * Generate random payment channel.
     */
    private function getRandomPaymentChannel(): string
    {
        return fake()->randomElement(['qris', 'ovo', 'dana', 'va_bca', 'va_mandiri', 'gopay']);
    }

    /**
     * Generate unique reference ID.
     */
    private function generateReferenceId(): string
    {
        return 'REF-' . fake()->unique()->numerify('########');
    }

    /**
     * Generate raw callback data (JSON format).
     */
    private function generateRawCallback(): ?string
    {
        // Simulasi data callback dari Xendit dalam format JSON
        $callbackData = [
            'external_id' => 'ext-' . fake()->unique()->numerify('######'),
            'payment_method' => fake()->randomElement(['QRIS', 'OVO', 'DANA', 'VA']),
            'transaction_status' => fake()->randomElement(['PENDING', 'SETTLED', 'FAILED']),
            'amount' => rand(100000, 1000000),
            'timestamp' => now()->toIso8601String(),
        ];

        // Return sebagai JSON atau NULL (opsional)
        return fake()->optional()->passthrough(json_encode($callbackData));
    }
}
