<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SharedPlaylist extends Model
{
    use HasFactory;

    protected $fillable = [
        'playlist_token',
        'token',
        'used',
    ];

    /**
     * Relación con el modelo Playlist.
     * 
     * Una `SharedPlaylist` pertenece a una `Playlist`.
     */
    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }

    /**
     * Incrementar el contador `used`.
     * 
     * Este método incrementa la cantidad de veces que el enlace ha sido utilizado.
     */
    public function incrementUsage()
    {
        $this->increment('used');
    }
}
