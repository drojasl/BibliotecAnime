<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlaylistVideo extends Model
{
    use HasFactory;

    protected $table = 'playlist_video';

    protected $guarded = ['created_at', 'updated_at'];

    const LIVE_PLAYLIST_ID = 1;

    public function video()
    {
        return $this->belongsTo(Video::class);
    }

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }
}
