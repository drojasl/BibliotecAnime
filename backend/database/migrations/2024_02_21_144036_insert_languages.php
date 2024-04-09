<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class InsertLanguages extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::table('languages')->insert([
            ['language' => 'Japonés'],
            ['language' => 'Inglés'],
            ['language' => 'Español(latinoamerica)'],
            ['language' => 'Español(España)'],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('languages')->whereIn('language', ['Japonés', 'Inglés', 'Español(latinoamerica)', 'Español(España)'])->delete();
    }
}
