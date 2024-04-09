<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('file_name');
            $table->string('anime');
            $table->string('anime_alt')->nullable();
            $table->string('anime_parent')->nullable();
            $table->string('type')->nullable();
            $table->string('format')->nullable();
            $table->string('title')->nullable();
            $table->string('title_alt')->nullable();
            $table->unsignedBigInteger('artist')->nullable();
            $table->unsignedBigInteger('language')->nullable();
            $table->string('year')->nullable();
            $table->string('number')->nullable();
            $table->string('version')->nullable();
            $table->text('lyrics')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
