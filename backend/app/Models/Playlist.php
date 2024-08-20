<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'cover',
        'token',
    ];

    public function playlistVideos()
    {
        return $this->hasMany(PlaylistVideo::class)->orderBy('order');
    }
}
