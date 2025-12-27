<?php

namespace App\Http\Controllers\Utils;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $deleted = $request->query('trashed');
        // Ambil semua produk termasuk yang sudah dihapus (soft deleted)
        $products = Product::with('category', 'variants');
        if ($search) {
            $products->where('name', 'like', '%' . $search . '%');
        }
        if ($status && in_array($status, ['available', 'unavailable', 'sold'])) {
            $products->where('status', $status);
        } else {
            // default all statuses
        }
        if ($deleted === 'only') {
            $products->onlyTrashed();
        } elseif ($deleted === 'with') {
            $products->withTrashed();
        } else {
            // default not deleted only
            $products->whereNull('deleted_at');
        }

        $products = $products->orderByDesc('updated_at')->get();


        return response()->json($products);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:available,unavailable,sold',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'variants' => 'required|array',
            'variants.*.name' => 'required|string|max:255',
            'variants.*.status' => 'required|in:available,unavailable,sold',
            'variants.*.price' => 'required|integer|min:0',
        ]);

        // Inisialisasi variabel untuk path gambar
        $imagePath = null;

        if ($request->hasFile('image')) {
            $uploadedFile = $request->file('image');

            // Dapatkan ekstensi file
            $extension = $uploadedFile->getClientOriginalExtension();

            // Dapatkan nama asli file (tanpa ekstensi)
            $originalName = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);

            // Buat nama file baru: uuid_nama-gambar_timestamp.ext
            $newFileName = Str::uuid() . '_' . Str::slug($originalName) . '_' . time() . '.' . $extension;

            // Simpan file ke storage/uploads/product dengan nama baru
            $imagePath = $uploadedFile->storeAs('uploads/product', $newFileName, 'public');
        }

        // Buat product
        $product = Product::create([
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'status' => $validated['status'],
            'description' => $validated['description'],
            // Simpan URL absolut ke database
            'image' => $imagePath ? asset('storage/' . $imagePath) : null,
        ]);

        // Create variants
        foreach ($validated['variants'] as $variantData) {
            $product->variants()->create([
                'name' => $variantData['name'],
                'status' => $variantData['status'],
                'price' => $variantData['price'],
            ]);
        }

        return response()->json(['message' => 'Product created successfully']);
    }

    /**
     * Display the specified product.
     */
    public function show(string $id)
    {
        // Cari produk berdasarkan ID, termasuk yang soft deleted
        $product = Product::withTrashed()->with('category')->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    /**
     * Update the specified product in storage.
     */
    // app/Http/Controllers/Api/ProductController.php (atau controller Anda)
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'nullable|in:available,unavailable,sold',
            'description' => 'nullable|string',
            // HAPUS validasi 'variants' dari sini
        ]);

        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->update([
            'category_id' => $validated['category_id'] ?? $product->category_id,
            'name' => $validated['name'] ?? $product->name,
            'status' => $validated['status'] ?? $product->status,
            'description' => $validated['description'] ?? $product->description,
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $product->image = $request->file('image')->store('products', 'public');
            $product->save();
        }

        // JANGAN lakukan apa-apa dengan $validated['variants'] di sini
        // Karena tidak ada lagi.

        return response()->json(['message' => 'Product updated successfully']);
    }

    /**
     * Remove the specified product from storage (soft delete).
     */
    public function destroy(string $id)
    {
        // Cari produk berdasarkan ID
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Soft delete produk
        $product->delete();

        return response()->json(['message' => 'Product soft deleted successfully']);
    }

    /**
     * Restore a soft-deleted product.
     */
    public function restore(string $id)
    {
        // Cari produk yang sudah dihapus (soft deleted)
        $product = Product::onlyTrashed()->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found or not deleted'], 404);
        }

        // Restore produk
        $product->restore();

        return response()->json(['message' => 'Product restored successfully']);
    }

    /**
     * Permanently delete a product (hard delete).
     */
    public function forceDelete(string $id)
    {
        // Cari produk berdasarkan ID, termasuk yang soft deleted
        $product = Product::withTrashed()->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Hard delete produk
        $product->forceDelete();

        return response()->json(['message' => 'Product permanently deleted']);
    }
}
