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

//? UPLOAD VIDEOS DATA
Route::post('/languages', [dataController::class, 'getLanguages']);
Route::post('/uploadVideo', [dataController::class, 'setVideoDataUpload']);
Route::post('/updateVideo', [dataController::class, 'updateVideoData']);

//? VIDEOS DATA
Route::get('/current/{userId}', [videoController::class, 'getCurrentVideo']);
Route::get('/next/{userId}', [videoController::class, 'getNextVideo']);
Route::get('/currentEnded/{videoId}',[videoController::class, 'currentVideoEnded']);
Route::post('/setRatingVideo', [videoController::class, 'setRatingVideo']);
Route::post('/getVideosQueue',  [videoController::class, 'getVideosQueue']);
Route::post('/getVideoRating', [videoController::class, 'getVideoRating']);
Route::post('/addSongToPlaylist', [videoController::class, 'addVideoToPlaylist']);
Route::post('/createNewPlaylist', [videoController::class, 'createNewPlaylist']);
Route::delete('/playlists/{playlistId}/delete/{videoId}', [VideoController::class, 'deleteVideoFromPlaylist']);
Route::put('/playlists/update/{playlistId}', [VideoController::class, 'updatePlaylistName']);
Route::delete('/deltePlaylist/{playlistId}', [VideoController::class, 'deletePlaylist']);

//? USER AUTHENTICATION
Route::post('/login', [userController::class, 'logIn']);
Route::post('/login/google', [userController::class, 'authGoogle']);
Route::post('/signup', [userController::class, 'signUp']);
Route::get('/users/{username}', [userController::class, 'getUserByUsername']);
Route::post('/validate-username', [UserController::class, 'validateUsername']);
Route::put('/users/update/{id}', [UserController::class, 'updateUser']);