<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil ID kategori
        $coffeeId = Category::where('name', 'Coffee')->first()->id;
        $nonCoffeeId = Category::where('name', 'Non-Coffee')->first()->id;
        $teaId = Category::where('name', 'Tea')->first()->id;
        $snackId = Category::where('name', 'Snack')->first()->id;

        // Data produk berdasarkan menu gambar
        $products = [
            // COFFEE
            [
                'category_id' => $coffeeId,
                'name' => 'Diet Coffee',
                'image' => null,
                'status' => 'available',
                'description' => 'Coffee with zero sugar, perfect for diet lovers.'
            ],
            [
                'category_id' => $coffeeId,
                'name' => 'Butter Scotch',
                'image' => null,
                'status' => 'available',
                'description' => 'Rich butter scotch flavor in your coffee.'
            ],
            [
                'category_id' => $coffeeId,
                'name' => 'Salted Caramel',
                'image' => null,
                'status' => 'available',
                'description' => 'Sweet and salty caramel infused coffee.'
            ],
            [
                'category_id' => $coffeeId,
                'name' => 'Caramel Machiato',
                'image' => null,
                'status' => 'available',
                'description' => 'Espresso with steamed milk and caramel drizzle.'
            ],
            [
                'category_id' => $coffeeId,
                'name' => 'Almond',
                'image' => null,
                'status' => 'available',
                'description' => 'Nutty almond flavored coffee.'
            ],

            // NON-COFFEE
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Chocolate',
                'image' => null,
                'status' => 'available',
                'description' => 'Creamy chocolate drink.'
            ],
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Red Velvet',
                'image' => null,
                'status' => 'available',
                'description' => 'Velvety red velvet flavored drink.'
            ],
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Matcha',
                'image' => null,
                'status' => 'available',
                'description' => 'Japanese green tea powder blended with milk.'
            ],
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Taro',
                'image' => null,
                'status' => 'available',
                'description' => 'Purple taro flavored sweet drink.'
            ],
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Vanilla',
                'image' => null,
                'status' => 'available',
                'description' => 'Classic vanilla flavored milk drink.'
            ],
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Thai Tea',
                'image' => null,
                'status' => 'available',
                'description' => 'Spiced Thai tea with condensed milk.'
            ],
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Green Tea',
                'image' => null,
                'status' => 'available',
                'description' => 'Refreshing green tea beverage.'
            ],
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Cookies n Cream',
                'image' => null,
                'status' => 'available',
                'description' => 'Creamy cookies and cream milkshake.'
            ],
            [
                'category_id' => $nonCoffeeId,
                'name' => 'Mineral Water',
                'image' => null,
                'status' => 'available',
                'description' => 'Pure mineral water for hydration.'
            ],

            // TEA
            [
                'category_id' => $teaId,
                'name' => 'Green Tea',
                'image' => null,
                'status' => 'available',
                'description' => 'Freshly brewed green tea.'
            ],
            [
                'category_id' => $teaId,
                'name' => 'Lychee Tea',
                'image' => null,
                'status' => 'available',
                'description' => 'Fruity lychee flavored tea.'
            ],
            [
                'category_id' => $teaId,
                'name' => 'Lemon Tea',
                'image' => null,
                'status' => 'available',
                'description' => 'Zesty lemon tea with a hint of sweetness.'
            ],

            // SNACK
            [
                'category_id' => $snackId,
                'name' => 'Stomay Ayam',
                'image' => null,
                'status' => 'available',
                'description' => 'Spicy chicken snack.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Dimsum',
                'image' => null,
                'status' => 'available',
                'description' => 'Steamed dumplings with savory filling.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Tahu Bakso',
                'image' => null,
                'status' => 'available',
                'description' => 'Tofu filled with meatballs.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Cheng Rujak',
                'image' => null,
                'status' => 'available',
                'description' => 'Spicy fruit salad with peanut sauce.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Pisang Goreng',
                'image' => null,
                'status' => 'available',
                'description' => 'Crispy fried banana.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Eslerman',
                'image' => null,
                'status' => 'available',
                'description' => 'Frozen dessert with various flavors.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Mini Pao',
                'image' => null,
                'status' => 'available',
                'description' => 'Small steamed buns with sweet or savory fillings.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Donut Lili',
                'image' => null,
                'status' => 'available',
                'description' => 'Soft donuts with sweet glaze.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Pisces Lemon',
                'image' => null,
                'status' => 'available',
                'description' => 'Lemon-flavored fish-shaped snack.'
            ],
            [
                'category_id' => $snackId,
                'name' => 'Sosis',
                'image' => null,
                'status' => 'available',
                'description' => 'Grilled sausage snack.'
            ],
        ];

        foreach ($products as $productData) {
            Product::create($productData);
        }
    }
}
