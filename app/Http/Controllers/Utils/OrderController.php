<?php

namespace App\Http\Controllers\Utils;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;


class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Ambil parameter query dari request
        $search = $request->input('search');
        $status = $request->input('status');
        $trashed = $request->input('trashed');
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        // Query dasar
        $query = Order::with(['user', 'orderItems.product', 'orderItems.variant', 'payments'])
            ->latest();

        // Filter berdasarkan search
        if ($search) {
            $query->where('name', 'LIKE', "%{$search}%");
        }

        // Filter berdasarkan status payment
        if ($status && $status !== 'null') {
            $query->where('payment_status', $status);
        }

        // Filter berdasarkan trashed
        if ($trashed === 'only') {
            $query->onlyTrashed();
        } elseif ($trashed === 'with') {
            $query->withTrashed();
        } elseif ($trashed === 'null') {
            $query->withoutTrashed();
        }

        // Paginate hasil query
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'session_token' => 'nullable|string',
            'name' => 'required|string|max:255',
            'receipt_number' => 'required|string|unique:orders,receipt_number',
            'total' => 'required|integer',
            'payment_method' => 'required|string|in:cash,qris,ewallet,va',
            'payment_status' => 'required|string|in:pending,paid,failed',
            'status' => 'required|string|in:pending,preparing,completed,cancelled',
            'xendit_invoice_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Simpan data baru
        $order = Order::create($validator->validated());

        return response()->json($order, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        // Cek apakah order ada dan belum dihapus secara soft delete
        if ($order->trashed()) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order->load('user')); // Load relasi user
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        // Cek apakah order ada dan belum dihapus secara soft delete
        if ($order->trashed()) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Validasi input
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|exists:users,id',
            'session_token' => 'nullable|string',
            'name' => 'sometimes|required|string|max:255',
            'receipt_number' => 'sometimes|required|string|unique:orders,receipt_number,' . $order->id,
            'total' => 'sometimes|required|integer',
            'payment_method' => 'sometimes|required|string|in:cash,qris,ewallet,va',
            'payment_status' => 'sometimes|required|string|in:pending,paid,failed',
            'status' => 'sometimes|required|string|in:pending,preparing,completed,cancelled',
            'xendit_invoice_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update data
        $order->update($validator->validated());

        return response()->json($order);
    }

    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(Order $order)
    {
        // Cek apakah order ada dan belum dihapus secara soft delete
        if ($order->trashed()) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Soft delete order
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    /**
     * Restore a soft-deleted resource.
     */
    public function restore($id)
    {
        // Cari order yang telah dihapus secara soft delete
        $order = Order::withTrashed()->find($id);

        if (!$order || !$order->trashed()) {
            return response()->json(['message' => 'Order not found or not deleted'], 404);
        }

        // Restore order
        $order->restore();

        return response()->json(['message' => 'Order restored successfully']);
    }

    /**
     * Permanently delete a resource.
     */
    public function forceDelete($id)
    {
        // Cari order yang telah dihapus secara soft delete
        $order = Order::withTrashed()->find($id);

        if (!$order || !$order->trashed()) {
            return response()->json(['message' => 'Order not found or not deleted'], 404);
        }

        // Hapus permanen
        $order->forceDelete();

        return response()->json(['message' => 'Order permanently deleted']);
    }
}
