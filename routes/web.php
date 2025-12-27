<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Http\Controllers\CartController;
use App\Models\Cart;
use Symfony\Component\HttpFoundation\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CheckoutController;

Route::post('/checkout', [CheckoutController::class, 'checkout'])->name('checkout');

// Route::get('/', function () {
//     return Inertia::render('welcome', [
//         'canRegister' => Features::enabled(Features::registration()),
//     ]);
// })->name('home');

Route::get('/', function () {
    $products = Product::with('variants')->get();
    $categories = Category::all();
    // $cart_count = Cart::where('session_id', session()->getId())->count();

    return Inertia::render('menu', [
        'products' => $products,
        'categories' => $categories,
        // 'cart_count' => $cart_count,
    ]);
})->name('mhome');

Route::get('/pesanan', function (Illuminate\Http\Request $request) {
    $token = $request->cart_token;
    $orders = Order::where('session_token', $token)->with('orderItems.product', 'orderItems.variant', 'payments')->orderBy('created_at', 'desc')->get();
    $cart = Cart::with('items.product', 'items.variant')
    ->where('session_token', $token)
    ->where('status', 'active')
    ->first();

    // dd($orders);
    // $cart ? $cart->items()->sum('qty') : 0,
    return Inertia::render('pesanan', [
        'orders' => $orders,
        'cartCount' => $cart ? $cart->items()->sum('qty') : 0,
    ]);
})->name('pesanan');

Route::get('/menu', function () {
    $products = Product::with('variants')->get();
    $categories = Category::all();
    // $cart_count = Cart::where('session_id', session()->getId())->count();

    return Inertia::render('menu', [
        'products' => $products,
        'categories' => $categories,
        // 'cart_count' => $cart_count,
    ]);
})->name('menu');

Route::get('/menu/{id}', function ($id) {
    $product = Product::with('variants')->find($id);

    return Inertia::render('detailMenu', [
        'product' => $product,
    ]);
})->name('menu.detail');

Route::post('/cart/add', [CartController::class, 'add']);
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart/update', [CartController::class, 'updateQty']);
Route::post('/cart/delete', [CartController::class, 'deleteItem']);

Route::get('/edit-order/{id}', function ($id) {
    return inertia('editOrder', [
        'order' => \App\Models\CartItem::with(['product', 'variant'])->findOrFail($id),
    ]);
})->name('edit-order');

Route::get('/cart/count', function (Illuminate\Http\Request $request) {
    $token = $request->cart_token;

    $cart = Cart::where('session_token', $token)
        ->where('status', 'active')
        ->first();
    $count = $cart ? $cart->items()->sum('qty') : 0;

    return ['count' => $count];
});







Route::post('/webhook/xendit/qris', [PaymentController::class, 'qrisCallback'])->name('xendit.qris.callback');

Route::post('/xendit/callback', [PaymentController::class, 'handleCallback']);


Route::get('/invoice', function (Illuminate\Http\Request $request) {
    $token = $request->cart_token ?? $request->session()->get('cart_token');
    $cart = \App\Models\Cart::with('items.product', 'items.variant')
        ->where('session_token', $token)
        ->where('status', 'active')
        ->firstOrFail();

    return Inertia::render('invoiceOrder', [
        'cart' => $cart,
    ]);
})->name('invoice');



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('category', function () {
        return Inertia::render('category');
    })->name('categories');

    Route::get('product', function () {
        return Inertia::render('product');
    })->name('products');

    Route::get('product/add', function () {
        $categories = Category::all();

        return Inertia::render('addProduct', [
            'categories' => $categories,
        ]);
    })->name('products.add');

    Route::get('product/edit/{id}', function ($id) {
        $categories = Category::all();
        $product = Product::find($id);
        $variants = ProductVariant::where('product_id', $id)->get();

        return Inertia::render('editProduct', [
            'categories' => $categories,
            'product' => $product,
            'variant' => $variants,
        ]);
    })->name('products.edit');

    Route::get('casshier', function () {
        $products = Product::with('variants')->get();
        $categories = Category::all();

        return Inertia::render('casshier', [
            'products' => $products,
            'categories' => $categories,
        ]);

    })->name('casshier');

    Route::get('admin', function () {
        return Inertia::render('admin');
    })->name('admin');


    Route::get('order', function () {
        return Inertia::render('order');
    })->name('order');

});


require __DIR__.'/tools.php';
require __DIR__.'/settings.php';
