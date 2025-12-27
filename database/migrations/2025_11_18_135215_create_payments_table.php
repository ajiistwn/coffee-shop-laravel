<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('payment_channel'); // qris, ovo, dana, va_bca, etc
            $table->string('reference_id'); // Xendit external_id/invoice_id
            $table->string('status'); // pending, paid, failed
            $table->integer('amount');
            $table->json('raw_callback')->nullable(); // data callback dari Xendit
            $table->string('payment_link')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
