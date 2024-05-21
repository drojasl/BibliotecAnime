<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlaylistVideo extends Model
{
    use HasFactory;

    const LIVE_PLAYLIST_ID = 1;

    protected $table = 'playlist_video';

    protected $fillable = [
        'playlist_id',
        'video_id',
    ];
}
