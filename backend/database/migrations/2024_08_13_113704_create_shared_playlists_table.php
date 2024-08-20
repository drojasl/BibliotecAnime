<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSharedPlaylistsTable extends Migration
{
    /**
     * Ejecutar las migraciones.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shared_playlists', function (Blueprint $table) {
            $table->id();
            $table->string('playlist_token', 64);
            $table->string('token', 64)->unique();
            $table->integer('used')->default(0);
            $table->timestamps();

            $table->foreign('playlist_token')->references('token')->on('playlists')->onDelete('cascade');
        });
    }

    /**
     * Revertir las migraciones.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('shared_playlists');
    }
}
