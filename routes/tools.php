<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Utils\CategoryController;
use App\Http\Controllers\Utils\ProductController;
use App\Http\Controllers\Utils\ProductVariantController;
use App\Http\Controllers\Utils\AdminController;
use App\Http\Controllers\Utils\OrderController;

Route::prefix('tools')->middleware(['auth', 'verified'])->group(function () {
    Route::get('categories/trashed', [CategoryController::class, 'trashed']);
    Route::resource('categories', CategoryController::class);
    Route::post('categories/{id}/restore', [CategoryController::class, 'restore']);
    Route::delete('categories/{id}/force-delete', [CategoryController::class, 'forceDelete']);

    Route::get('products/trashed', [ProductController::class, 'trashed']);
    Route::resource('products', ProductController::class);
    Route::post('products/{id}/restore', [ProductController::class, 'restore']);
    Route::delete('products/{id}/force-delete', [ProductController::class, 'forceDelete']);

    Route::get('variants/trashed', [ProductVariantController::class, 'trashed']);
    Route::resource('variants', ProductVariantController::class);
    Route::post('variants/{id}/restore', [ProductVariantController::class, 'restore']);
    Route::delete('variants/{id}/force-delete', [ProductVariantController::class, 'forceDelete']);

    Route::resource('admins', AdminController::class);

    Route::get('orders/trashed', [OrderController::class, 'trashed']);
    Route::resource('orders', OrderController::class);
    Route::post('orders/{id}/restore', [OrderController::class, 'restore']);
    Route::delete('orders/{id}/force-delete', [OrderController::class, 'forceDelete']);
});


