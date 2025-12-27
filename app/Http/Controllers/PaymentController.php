<?php

namespace App\Http\Controllers;

use App\Services\XenditService;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Models\Payment;

class PaymentController extends Controller
{
    protected $xendit;

    public function __construct(XenditService $xendit)
    {
        $this->xendit = $xendit;
    }

    public function createPayment(Order $order)
    {
        $invoice = $this->xendit->createInvoice([
            'external_id' => 'order-' . $order->id,
            'amount' => $order->total,
            'description' => 'Payment Order #' . $order->id,
            'success_redirect_url' => url('/payment-success'),
            'failure_redirect_url' => url('/payment-failed'),
        ]);

        // save invoice ID
        $order->update([
            'xendit_invoice_id' => $invoice['id'],
            'payment_status' => 'pending',
        ]);

        return response()->json([
            'payment_url' => $invoice['invoice_url'],
        ]);
    }

    public function handleCallback(Request $request)
    {
        $callbackData = $request->all();
        $invoiceId = $callbackData['id'];
        $status = $callbackData['status'];

        // Cari pembayaran berdasarkan reference_id (invoice ID)
        $payment = Payment::where('reference_id', $invoiceId)->first();

        if ($payment) {
            $payment->update([
                'status' => $status,
                'raw_callback' => json_encode($callbackData),
            ]);

            // Perbarui status order jika pembayaran berhasil
            if ($status === 'PAID') {
                $payment->order->update(['payment_status' => 'paid']);
            }
        }

        return response()->json(['success' => true]);
    }

    public function handleInvoiceCallback(Request $request)
    {
        // Validasi request dari Xendit
        $data = $request->all();
        // \Log::info('Xendit Invoice Callback:', $data);

        // Ambil ID invoice dari Xendit
        $externalId = $data['external_id'] ?? null;
        $status = $data['status'] ?? null;

        if (!$externalId || !$status) {
            return response()->json(['error' => 'Invalid callback data'], 400);
        }

        // Cari pembayaran berdasarkan reference_id (external_id)
        $payment = Payment::where('reference_id', $externalId)->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        // Update status pembayaran
        $payment->update([
            'status' => $status,
        ]);

        // Temukan order terkait
        $order = Order::find($payment->order_id);

        if ($order) {
            // Update status order jika pembayaran berhasil
            if ($status === 'PAID') {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'preparing', // Atau sesuaikan status berikutnya
                ]);
            } elseif ($status === 'FAILED') {
                $order->update([
                    'payment_status' => 'failed',
                    'status' => 'cancelled',
                ]);
            }
        }

        return response()->json(['success' => true]);
    }


    public function qrisCallback(Request $request)
    {
        $data = $request->all();

        Payment::where('reference_id', $data['external_id'])
            ->update([
                'status' => 'paid',
                'raw_callback' => json_encode($data),
            ]);

        return response()->json(['success' => true]);
    }

}
