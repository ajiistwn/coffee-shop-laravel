<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Str;

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
                'status' => $this->randomElement(['pending', 'paid', 'failed']),
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
        return $this->randomElement(['qris', 'ovo', 'dana', 'va_bca', 'va_mandiri', 'gopay']);
    }

    /**
     * Generate unique reference ID.
     */
    private function generateReferenceId(): string
    {
        return 'REF-' . random_int(10000000, 99999999);
    }

    /**
     * Generate raw callback data (JSON format).
     */
    private function generateRawCallback(): ?string
    {
        // Simulasi data callback dari Xendit dalam format JSON
        $callbackData = [
            'external_id' => 'ext-' . Str::lower((string) Str::uuid()),
            'payment_method' => $this->randomElement(['QRIS', 'OVO', 'DANA', 'VA']),
            'transaction_status' => $this->randomElement(['PENDING', 'SETTLED', 'FAILED']),
            'amount' => rand(100000, 1000000),
            'timestamp' => now()->toIso8601String(),
        ];

        // Return sebagai JSON atau NULL (opsional)
        return random_int(1, 100) <= 70 ? json_encode($callbackData) : null;
    }

    /**
     * @param array<int, string> $items
     */
    private function randomElement(array $items): string
    {
        return $items[array_rand($items)];
    }
}
