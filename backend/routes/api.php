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

Route::get('/current', [videoController::class, 'getCurrentVideo']);
Route::get('/next', [videoController::class, 'getNextVideo']);
Route::get('/currentEnded',[videoController::class, 'currentVideoEnded']);
Route::post('/setRatingVideo', [videoController::class, 'setRatingVideo']);

Route::controller(VideoController::class)->prefix('videos')->group(function () {
    Route::get('/', 'getVideoList');
    Route::post('/getVideos', 'getVideos');
    Route::get('/cleanPlaying', 'cleanPlaying');
    Route::post('/getVideoRating', 'getVideoRating');
    Route::post('/addSongToPlaylist', 'addSongToPlaylist');
    
    Route::controller(VideoController::class)->prefix('live')->group(function () {
    });
});


/*
Route::get('/videos', [videoController::class, 'getVideoList']);
Route::post('/getVideos', [videoController::class, 'getVideos']);
Route::get('/cleanPlaying', [videoController::class, 'cleanPlaying']);
Route::post('/setRatingVideo', [videoController::class, 'setRatingVideo']);
Route::post('/getVideoRating', [videoController::class, 'getVideoRating']);
Route::post('/addSongToPlaylist', [videoController::class, 'addSongToPlaylist']);
*/
Route::post('/login', [userController::class, 'logIn']);
Route::post('/login/google', [userController::class, 'authGoogle']);
Route::post('/signup', [userController::class, 'signUp']);