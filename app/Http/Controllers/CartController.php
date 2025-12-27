<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Cart;
use App\Models\CartItem;

class CartController extends Controller
{
    // GET /cart
    public function index(Request $request)
    {
        $token = $request->cart_token ?? $request->session()->get('cart_token');

        $cart = Cart::with(['items.product', 'items.variant'])
            ->where('session_token', $token)
            ->where('status', 'active')
            ->first();

        return Inertia::render('cart', [
            'cart' => $cart
        ]);
    }

    // POST /cart/add
    public function add(Request $request)
    {
        $request->validate([
            'session_token' => 'required',
            'product_id' => 'required',
            'variant_id' => 'nullable',
            'price' => 'required|numeric',
            'notes' => 'nullable|string'
        ]);

        // Get or create cart
        $cart = Cart::firstOrCreate(
            [
                'session_token' => $request->session_token,
                'status' => 'active'
            ],
            [
                'total' => 0
            ]
        );

        // Add or update item
        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->where('variant_id', $request->variant_id)
            ->where('notes', $request->notes)
            ->first();

        if ($item) {
            // update
            $item->qty += 1;
            $item->subtotal = $item->qty * $item->price;
            $item->save();
        } else {
            // create
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
                'variant_id' => $request->variant_id,
                'qty' => 1,
                'price' => $request->price,
                'subtotal' => $request->price,
                'notes' => $request->notes
            ]);
        }

        // update cart total
        $cart->total = $cart->items()->sum('subtotal');
        $cart->save();

        return response()->json(['success' => true]);
    }

    // POST /cart/update
    public function updateQty(Request $request)
    {
        $item = CartItem::findOrFail($request->id);
        $item->qty = $request->qty;
        $item->subtotal = $item->qty * $item->price;
        $item->save();

        $cart = $item->cart;
        $cart->total = $cart->items()->sum('subtotal');
        $cart->save();

        return response()->json(['success' => true]);
    }

    // POST /cart/delete
    public function deleteItem(Request $request)
    {
        $item = CartItem::findOrFail($request->id);
        $cart = $item->cart;

        $item->delete();

        $cart->total = $cart->items()->sum('subtotal');
        $cart->save();

        return response()->json(['success' => true]);
    }
}
