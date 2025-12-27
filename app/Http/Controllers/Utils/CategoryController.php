<?php

namespace App\Http\Controllers\Utils;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $deleted = $request->input('trashed');
        // Ambil semua kategori termasuk yang sudah dihapus (soft deleted)
        $query = Category::query();
        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }
        if ($status && in_array($status, ['active', 'inactive'])) {
            $query->where('status', $status);
        } else {

        }

        if ($deleted === 'only') {
            $query->onlyTrashed();
        } elseif ($deleted === 'with') {
            $query->withTrashed();
        } else {
            // default not deleted only
            $query->whereNull('deleted_at');
        }

        $categories = $query->get();

        return response()->json($categories);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Buat kategori baru
        $category = Category::create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? 'active', // Default ke 'active' jika tidak disediakan
        ]);

        return response()->json($category, 201); // Kode 201 untuk resource created
    }

    /**
     * Display the specified category.
     */
    public function show(string $id)
    {
        // Cari kategori berdasarkan ID, termasuk yang soft deleted
        $category = Category::withTrashed()->find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        return response()->json($category);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validasi input
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Cari kategori berdasarkan ID
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        // Update data kategori
        $category->update([
            'name' => $validated['name'] ?? $category->name,
            'status' => $validated['status'] ?? $category->status,
        ]);

        return response()->json($category);
    }

    /**
     * Remove the specified category from storage (soft delete).
     */
    public function destroy(string $id)
    {
        // Cari kategori berdasarkan ID
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->status = 'inactive';
        $category->save();
        // Soft delete kategori
        $category->delete();

        return response()->json(['message' => 'Category soft deleted successfully']);
    }

    public function trashed()
    {
        $categories = Category::onlyTrashed()->get();
        return response()->json($categories);
    }

    public function restore(string $id)
    {
        $category = Category::onlyTrashed()->find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found or not deleted'], 404);
        }

        $category->status = 'active';
        $category->save();

        $category->restore();

        return response()->json(['message' => 'Category restored successfully']);
    }

    public function forceDelete(string $id)
    {
        $category = Category::withTrashed()->find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        if ($category->deleted_at === null) {
            return response()->json(['message' => 'Category must be soft deleted first'], 400);
        }

        $category->forceDelete();
        return response()->json(['message' => 'Category permanently deleted']);
    }

}
