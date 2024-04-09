<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\dataController;
use App\Http\Controllers\videoController;
use App\Http\Controllers\userController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/languages', [dataController::class, 'getLanguages']);
Route::post('/uploadVideo', [dataController::class, 'setVideoDataUpload']);
Route::get('/videos', [videoController::class, 'getVideoList']);
Route::post('/getVideos', [videoController::class, 'getVideos']);
Route::post('/setRatingVideo', [videoController::class, 'setRatingVideo']);
Route::post('/getVideoRating', [videoController::class, 'getVideoRating']);
Route::post('/addSongToPlaylist', [videoController::class, 'addSongToPlaylist']);
Route::post('/login', [userController::class, 'logIn']);
Route::post('/signup', [userController::class, 'signUp']);