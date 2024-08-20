<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_data',
        'anime',
        'anime_alt',
        'anime_parent',
        'type',
        'format',
        'title',
        'title_alt',
        'artist',
        'language',
        'year',
        'number',
        'version',
        'cover',
        'lyrics',
    ];
}
