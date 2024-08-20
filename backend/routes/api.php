<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\dataController;
use App\Http\Controllers\userController;
use App\Http\Controllers\videoController;

//? UPLOAD VIDEOS DATA
Route::get('/languages', [DataController::class, 'getLanguages']);
Route::post('/uploadVideo', [dataController::class, 'setVideoDataUpload']);
Route::post('/updateVideo', [dataController::class, 'updateVideoData']);

//? VIDEOS DATA
Route::get('/current/{userId}', [videoController::class, 'getCurrentVideo']);
Route::get('/next/{userId}', [videoController::class, 'getNextVideo']);
Route::get('/currentEnded/{videoId}', [videoController::class, 'currentVideoEnded']);
Route::post('/setRatingVideo', [videoController::class, 'setRatingVideo']);
Route::get('/getVideosWithRatings', [videoController::class, 'getVideosWithRatings']);
Route::get('/getUserPosts',  [videoController::class, 'getUserPosts']);
Route::post('/getVideoRating', [videoController::class, 'getVideoRating']);
Route::get('/videos/anime/{filename}', function ($filename) {
    $path = base_path('public_html/videos/anime/' . $filename);

    if (!file_exists($path)) {
        abort(404);
    }

    return response()->file($path);
});

//? PLAYLIST DATA
Route::get('/getUserPlaylists', [VideoController::class, 'getUserPlaylists']);
Route::get('/getPlaylist/{token}', [VideoController::class, 'getPlaylist']);
Route::post('/addSongToPlaylist', [videoController::class, 'addVideoToPlaylist']);
Route::post('/updatePlaylistOrder/{token}', [videoController::class, 'updatePlaylistOrder']);
Route::post('/playlists/create', [videoController::class, 'createNewPlaylist']);
Route::delete('/playlists/{playlistId}/delete/{videoId}', [VideoController::class, 'deleteVideoFromPlaylist']);
Route::put('/playlists/update/{token}', [VideoController::class, 'updatePlaylist']);
Route::delete('/playlists/deletePlaylist/{token}', [VideoController::class, 'deletePlaylist']);
Route::get('/playlists/share/{token}', [VideoController::class, 'sharePlaylist']);

//? USER
Route::post('/login', [userController::class, 'logIn']);
Route::post('/signup', [userController::class, 'signUp']);
Route::get('/users/{username}', [userController::class, 'getUserByUsername']);
Route::put('/profile/update/{token}', [userController::class, 'updateProfile']);
Route::post('/profile/validateUsername', [UserController::class, 'validateUsername']);
Route::put('/users/update/{id}', [UserController::class, 'updateUser']);
