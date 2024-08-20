<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('languages', function (Blueprint $table) {
            $table->id();
            $table->string('language');
            $table->timestamps();
        });

        DB::table('languages')->insert([
            ['language' => 'Japonés'],
            ['language' => 'Inglés'],
            ['language' => 'Español (Latinoamérica)'],
            ['language' => 'Español (España)'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('languages');
    }
};
