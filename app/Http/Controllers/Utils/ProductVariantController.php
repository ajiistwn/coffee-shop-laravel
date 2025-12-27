<?php

namespace App\Http\Controllers\Utils;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ProductVariantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $product_id = $request->query('product_id');
        $search = $request->query('search');
        $status = $request->query('status');
        $deleted = $request->query('trashed');
        $query = ProductVariant::query();

        // Filter by product_id if provided
        if ($product_id) {
            $query->where('product_id', $product_id);
        }

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }
        if ($status && in_array($status, ['available', 'unavailable', 'sold'])) {
            $query->where('status', $status);
        } else {
            // default all statuses
        }
        if ($deleted === 'only') {
            $query->onlyTrashed();
        } elseif ($deleted === 'with') {
            $query->withTrashed();
        } else {
            // default not deleted only
            $query->whereNull('deleted_at');
        }

        $variants = $query->get();

        return response()->json($variants);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'name' => 'required|string|max:255',
                'status' => 'required|in:available,unavailable,sold',
                'price' => 'required|integer|min:0',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        $variant = ProductVariant::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Product variant created successfully',
            'data' => $variant,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        $variant = ProductVariant::with('product')->find($id);

        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Product variant not found',
            ], 404);
        }

        // Check if the record is soft deleted
        if ($variant->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Product variant has been deleted',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $variant,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $variant = ProductVariant::find($id);

        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Product variant not found',
            ], 404);
        }

        // Check if the record is soft deleted
        if ($variant->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update a deleted product variant',
            ], 400);
        }

        try {
            $request->validate([
                'product_id' => 'sometimes|required|exists:products,id',
                'name' => 'sometimes|required|string|max:255',
                'status' => 'sometimes|required|in:available,unavailable,sold',
                'price' => 'sometimes|required|integer|min:0',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        $variant->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Product variant updated successfully',
            'data' => $variant,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * This performs a soft delete.
     */
    public function destroy(int $id): JsonResponse
    {
        $variant = ProductVariant::find($id);

        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Product variant not found',
            ], 404);
        }

        // Check if the record is already soft deleted
        if ($variant->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Product variant is already deleted',
            ], 400);
        }

        $variant->status = 'unavailable';
        $variant->save();

        $variant->delete(); // This will perform a soft delete

        return response()->json([
            'success' => true,
            'message' => 'Product variant deleted successfully',
        ]);
    }

    /**
     * Restore a soft deleted resource.
     */
    public function restore(int $id): JsonResponse
    {
        $variant = ProductVariant::withTrashed()->find($id);

        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Product variant not found',
            ], 404);
        }

        if (!$variant->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Product variant is not deleted',
            ], 400);
        }

        $variant->status = 'available';
        $variant->save();
        $variant->restore();

        return response()->json([
            'success' => true,
            'message' => 'Product variant restored successfully',
            'data' => $variant,
        ]);
    }

    /**
     * Force delete a resource (permanent deletion).
     */
    public function forceDelete(int $id): JsonResponse
    {
        $variant = ProductVariant::withTrashed()->find($id);

        if (!$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Product variant not found',
            ], 404);
        }

        $variant->forceDelete();

        $message = $variant->trashed() ? 'Product variant permanently deleted' : 'Product variant deleted';

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }
}
