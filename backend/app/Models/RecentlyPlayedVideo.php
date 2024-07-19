<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecentlyPlayedVideo extends Model
{
    protected $table = 'recently_played_videos';

    protected $fillable = ['video_id'];
}
