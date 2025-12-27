<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Services\XenditService;

class CheckoutController extends Controller
{
    protected $xendit;

    public function __construct(XenditService $xendit)
    {
        $this->xendit = $xendit;
    }

    public function checkout(Request $request)
    {
        // Validasi input
        $request->validate([
            'cart_id' => 'required|exists:carts,id',
            'name' => 'required|string|max:255',
            'payment_method' => 'required|',
        ]);

        // Ambil data keranjang
        $cart = Cart::with('items')->findOrFail($request->cart_id);

        // Buat order baru
        $order = Order::create([
            // 'cart_id' => $cart->id,
            'session_token' => $cart->session_token,
            'name' => $request->name,
            'receipt_number' => uniqid('RCPT-', true),
            'total' => $cart->total,
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
            'status' => 'pending',
        ]);

        // Simpan item-item ke tabel order_items
        foreach ($cart->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'qty' => $item->qty,
                'price' => $item->price,
                'subtotal' => $item->subtotal,
                'notes' => $item->notes,
            ]);
        }

        // Ubah status cart menjadi "checkout"
        $cart->update(['status' => 'checkout']);

        $payment = Payment::create([
            'order_id' => $order->id,
            'payment_channel' => 'invoice',
            'reference_id' => 'order-' . $order->id,
            'status' => 'pending',
            'amount' => $cart->total,
        ]);

        $invoice = $this->xendit->createInvoice([
            'external_id' => $payment->reference_id,
            'amount' => $payment->amount,
            'description' => 'Pembayaran Order #' . $order->id,
            'customer' => [
                'given_names' => $order->name,
            ],
            'success_redirect_url' => url('/pesanan?cart_token=' . $cart->session_token),
            'failure_redirect_url' => url('/invoice?cart_token=' . $cart->session_token),
        ]);


        // Update order dengan ID invoice Xendit
        $order->update([
            'xendit_invoice_id' => $invoice['id'],
        ]);

        // Simpan juga invoice_url di Payment
        $payment->update([
            'payment_link' => $invoice['invoice_url'],
        ]);

        return response()->json([
            'invoice_url' => $invoice['invoice_url'],
        ]);
    }
}


