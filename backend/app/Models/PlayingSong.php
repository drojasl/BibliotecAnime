<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayingSong extends Model
{
    use HasFactory;

    protected $table = 'playing_songs'; // Nombre de la tabla asociada

    protected $fillable = [
        'song_id',
        'playing',
    ];
}
