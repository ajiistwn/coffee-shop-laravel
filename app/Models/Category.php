<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    protected $dates = ['deleted_at'];

}
