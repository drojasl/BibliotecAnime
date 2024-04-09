<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\VideoReview;

class videoController extends Controller
{
    public function getVideoList(Request $request)
    {
        $videoCount = DB::table('videos')->count();        
        $randomVideoIndex = rand(1, $videoCount);
        
        // Obtener un video aleatorio
        $randomVideo = DB::table('videos')->skip($randomVideoIndex - 1)->take(1)->first();

        // Obtener el rating del video
        $videoRating = 0;
        $videoReview = VideoReview::where('video_id', $randomVideo->id)
            ->where('user_id', $request->input('user_id'))
            ->first();

        if ($videoReview) {
            $videoRating = $videoReview->rating;
        }

        // Devolver el video y su rating
        return response()->json([
            'video' => $randomVideo,
            'rating' => $videoRating,
        ]);
    }
    
    public function setRatingVideo(Request $request)
    {
        $request->validate([
            'data.id_user' => 'required|integer',
            'data.id_video' => 'required|integer',
            'data.video_rating' => 'required|integer|min:1|max:5',
        ]);

        // Buscar o crear una instancia de VideoReview basada en las claves user_id y video_id
        $videoReview = VideoReview::firstOrNew([
            'user_id' => $request->input('data.id_user'),
            'video_id' => $request->input('data.id_video'),
        ]);

        // Actualizar el rating si ya existe un registro
        if ($videoReview->exists) {
            $videoReview->rating = $request->input('data.video_rating');
        } else {
            // Si no existe un registro, establecer el rating y guardar el nuevo registro
            $videoReview->rating = $request->input('data.video_rating');
        }

        // Guardar el registro
        $videoReview->save();

        // Respuesta exitosa
        return response()->json(['success' => true, 'message' => 'Video rating saved successfully']);
    }

    public function getVideoRating(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'video_id' => 'required|integer',
        ]);

        $videoReview = 
        VideoReview::where('user_id', $request->input('user_id'))
            ->where('video_id', $request->input('video_id'))
            ->first();

        if ($videoReview) {
            return response()->json(['success' => true, 'rating' => $videoReview->rating]);
        } else {
            return response()->json(['success' => false, 'message' => 'El usuario aún no ha calificado este video.']);
        }
    }
    
    public function addSongToPlaylist(Request $request)
    {
        $request->validate([
            'id_video' => 'required|integer',
            'id_playlist' => 'required|integer',
        ]);
    }
    
    public function getVideos(Request $request)
    {
        // header('Access-Control-Allow-Origin: *');
        // header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');

        $user_id = $request->input('user_id');
        $playlists = DB::table('playlists')
        ->select('id', 'name')
        ->where('user_id', $user_id)
        ->get();

        $playlistVideos = [];

        foreach ($playlists as $playlist) {
        $videos = DB::table('playlist_video')
            ->join('videos', 'playlist_video.video_id', '=', 'videos.id')
            ->where('playlist_video.playlist_id', $playlist->id)
            ->select('videos.*')
            ->get();

        $playlistVideos[] = [
            'playlist' => [
            'id' => $playlist->id,
            'playlist_name' => $playlist->name,
        ],
        'videos' => $videos,
        ];
        }

        $videos = DB::table('videos')->get();

        return response()->json(['video' => $videos, 'playlists' => $playlistVideos]);
    }
}
