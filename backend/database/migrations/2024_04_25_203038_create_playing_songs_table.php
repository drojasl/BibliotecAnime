<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlayingSongsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('playing_songs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('song_id');
            $table->foreign('song_id')->references('id')->on('videos')->onDelete('cascade');
            $table->boolean('playing')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('playing_songs');
    }
}
