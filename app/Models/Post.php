<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Post extends Model
{
       use HasFactory;

    protected $fillable = [
        'title','content','category_id', 'published_at', 'image',
    ];

    public function category():BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    public function comments():HasMany
    {
        return $this->hasmany(Comment::class);
    }

        protected $appends = ['image_url'];
        public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}
