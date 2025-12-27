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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('session_token')->nullable();
            $table->string('name');
            $table->string('receipt_number')->unique();
            $table->integer('total');
            $table->string('payment_method'); // cash, qris, ewallet, va
            $table->string('payment_status'); // pending, paid, failed
            $table->string('status'); // pending, preparing, completed, cancelled
            $table->string('xendit_invoice_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
