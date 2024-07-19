<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Playlists extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
    ];

    // Relación uno a muchos con PlaylistVideo (si es necesario)
    public function playlistVideos()
    {
        return $this->hasMany(PlaylistVideo::class);
    }
}
