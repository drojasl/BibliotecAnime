<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\VideoReview;
use App\Models\Video;
use App\Models\PlaylistVideo;
use App\Models\PlayingSong;
use App\Models\Playlists;
use Illuminate\Support\Facades\Log;

class VideoController extends Controller
{
    public function getCurrentVideo($userId)
    {
        $user_Id = $userId ? intval($userId) : null;
        Log::info('User parameter:', ['userId' => $userId]);

        $playingCurrent = PlayingSong::first();

        if ($playingCurrent) {
            $secondsElapsed = now()->diffInSeconds($playingCurrent->created_at);
    
            if ($secondsElapsed > 260) {
                PlayingSong::where('id', $playingCurrent->id)->delete();
                $secondsElapsed = 0;
                $nextPlaying = PlayingSong::first();
                if ($nextPlaying) {
                    $nextSecondsElapsed = now()->diffInSeconds($nextPlaying->created_at);
    
                    if ($nextSecondsElapsed > 260) {
                        PlayingSong::where('id', $nextPlaying->id)->delete();
                        $video = Video::inRandomOrder()->first();
    
                        if (!$video) {
                            Log::error('No videos found in the database.');
                            return response()->json(['success' => false, 'message' => 'No videos found'], 404);
                        }
    
                        PlayingSong::create([
                            'song_id' => $video->id,
                            'playing' => 1,
                        ]);
                    } else {
                        $nextPlaying->playing = 1;
                        $nextPlaying->save();
                        $video = Video::find($nextPlaying->song_id);
                    }
                } else {
                    $video = Video::inRandomOrder()->first();
    
                    if (!$video) {
                        Log::error('No videos found in the database.');
                        return response()->json(['success' => false, 'message' => 'No videos found'], 404);
                    }
    
                    PlayingSong::create([
                        'song_id' => $video->id,
                        'playing' => 1,
                    ]);
                }
            } else {
                $video = Video::find($playingCurrent->song_id);
            }
        } else {
            $video = Video::inRandomOrder()->first();
            
            if (!$video) {
                Log::error('No videos found in the database.');
                return response()->json(['success' => false, 'message' => 'No videos found'], 404);
            }
            PlayingSong::create([
                'song_id' => $video->id,
                'playing' => 1,
            ]);

            $secondsElapsed = 0;
        }

        $rating = 0;

        if ($user_Id !== null) {
            $videoReview = VideoReview::where('user_id', $user_Id)
                ->where('video_id', $video->id)
                ->first();
            
            $rating = $videoReview ? $videoReview->rating : 0;
        }

        $video->rating = $rating;

        return response()->json([
            'success' => true,
            'video' => $video,
            'seconds_elapsed' => $secondsElapsed
        ]);
    }

    public function getNextVideo($userId)
    {
        $user_Id = $userId ? intval($userId) : null;
        Log::info('User parameter:', ['userId' => $userId]);
    
        $playingCurrent = PlayingSong::get();
        if ($playingCurrent->count() > 1) {
            $nextSongId = $playingCurrent[1]->song_id;
            $video = Video::find($nextSongId);
        } else {
            $video = Video::where('id', '!=', $playingCurrent->first()->song_id ?? null)->inRandomOrder()->first();
            
            PlayingSong::create([
                'song_id' => $video->id,
                'playing' => 0,
            ]);

            if (!$video) {
                Log::error('No videos found in the database.');
                return response()->json(['success' => false, 'message' => 'No videos found'], 404);
            }
        }
    
        $rating = 0;
    
        if ($user_Id !== null) {
            $videoReview = VideoReview::where('user_id', $user_Id)
                ->where('video_id', $video->id)
                ->first();
            
            $rating = $videoReview ? $videoReview->rating : 0;
        }
    
        $video->rating = $rating;
    
        return response()->json([
            'success' => true,
            'video' => $video,
        ]);
    }

    public function currentVideoEnded()
    {
        $playingSongs = PlayingSong::orderBy('created_at', 'asc')->get();

        if ($playingSongs->count() >= 2) {
            $firstPlayingSong = $playingSongs->first();

            $secondPlayingSong = $playingSongs->skip(1)->first();
            $secondsElapsed = now()->diffInSeconds($firstPlayingSong->created_at);

            if ($secondsElapsed <= 15) {
                $this->updateSecondPlayingSong($secondPlayingSong);
            } else {
                $firstPlayingSong->delete();
                $this->updateSecondPlayingSong($secondPlayingSong);
            }
        }
    }

    /**
     * Método para actualizar el campo 'playing' del segundo registro.
     *
     * @param $secondPlayingSong
     */
    private function updateSecondPlayingSong($secondPlayingSong)
    {
        if ($secondPlayingSong) {
            $secondPlayingSong->playing = 1;
            $secondPlayingSong->save();
        }
    }


    public function setRatingVideo(Request $request)
    {
        $request->validate([
            'data.id_user' => 'required|integer',
            'data.id_video' => 'required|integer',
            'data.video_rating' => 'required|integer|min:1|max:5',
        ]);

        $videoReview = VideoReview::firstOrNew([
            'user_id' => $request->input('data.id_user'),
            'video_id' => $request->input('data.id_video'),
        ]);

        if ($videoReview->exists) {
            $videoReview->rating = $request->input('data.video_rating');
        } else {
            $videoReview->rating = $request->input('data.video_rating');
        }

        $videoReview->save();

        return response()->json(['success' => true, 'message' => 'Video rating saved successfully']);
    }

    public function getVideosQueue(Request $request)
    {
        $userId = $request->input('user_id');
    
        // Obtener todos los videos excepto los subidos por el usuario con el ID proporcionado
        $videos = Video::where('user_id', '!=', $userId)->get();
    
        // Obtener las listas de reproducción del usuario
        $playlists = DB::table('playlists')
            ->where('user_id', $userId)
            ->get();
    
        // Para cada lista de reproducción, obtener los videos asociados
        foreach ($playlists as $playlist) {
            $playlistVideos = DB::table('playlist_video')
                ->join('videos', 'playlist_video.video_id', '=', 'videos.id')
                ->where('playlist_video.playlist_id', $playlist->id)
                ->select('videos.*')
                ->get();
    
            $playlist->videos = $playlistVideos;
        }
    
        // Devolver la lista de videos y listas de reproducción en formato JSON
        return response()->json([
            'videos' => $videos,
            'playlists' => $playlists,
        ]);
    }

    public function getVideoRating(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'video_id' => 'required|integer',
        ]);
    
        $userId = $request->input('user_id');
        $videoId = $request->input('video_id');
    
        $rating = VideoReview::where('user_id', $userId)
                             ->where('video_id', $videoId)
                             ->first();
    
        return response()->json([
            'success' => true,
            'rating' => $rating ? $rating->rating : 0,
        ]);
    }

    public function addVideoToPlaylist(Request $request)
    {
        $videoIds = $request->input('data.id_videos');
        
        $playlistId = $request->input('data.id_playlist');
        
        $addedVideos = [];
        foreach ($videoIds as $videoId) {
            $exists = PlaylistVideo::where('video_id', $videoId)
                ->where('playlist_id', $playlistId)
                ->exists();
            
            if (!$exists) {
                $playlistVideo = new PlaylistVideo();
                $playlistVideo->video_id = $videoId;
                $playlistVideo->playlist_id = $playlistId;
                try {
                    $playlistVideo->save();
                    $addedVideos[] = $videoId;
                } catch (\Exception $e) {
                    return response()->json(['success' => false, 'message' => 'Failed to add video(s) to playlist', 'error' => $e->getMessage()], 500);
                }
            }
        }
        return response()->json(['success' => true, 'added_videos' => $addedVideos, 'message' => 'Video(s) added to playlist successfully']);
    }

    public function createNewPlaylist(Request $request)
    {
        // header("Access-Control-Allow-Origin: *");
        // header("Access-Control-Allow-Methods: *");
        // header("Access-Control-Allow-Headers: *");
        
        $request->validate([
            'user_id' => 'required|integer',
            'playlist_name' => 'required|string|max:255',
        ]);

        $userId = $request->input('user_id');
        $playlistName = $request->input('playlist_name');

        try {
            $playlist = new Playlists();
            $playlist->user_id = $userId;
            $playlist->name = $playlistName;
            $playlist->save();

            return response()->json([
                'success' => true,
                'playlist' => $playlist,
                'message' => 'Playlist created successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create playlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteVideoFromPlaylist($playlistId, $videoId)
    {
        try {
            $playlist = Playlists::findOrFail($playlistId);

            $playlistVideo = PlaylistVideo::where('playlist_id', $playlistId)
                ->where('video_id', $videoId)
                ->first();

            if ($playlistVideo) {
                $playlistVideo->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'Video deleted from playlist successfully',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Video not found in the playlist',
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete video from playlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updatePlaylistName(Request $request, $playlistId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        try {
            $playlist = Playlists::findOrFail($playlistId);
            $playlist->name = $request->input('name');
            $playlist->save();

            return response()->json([
                'success' => true,
                'message' => 'Playlist name updated successfully',
                'playlist' => $playlist,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update playlist name',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deletePlaylist($playlistId)
    {
        // Encuentra la playlist por ID
        $playlist = Playlists::find($playlistId);

        if (!$playlist) {
            return response()->json(['success' => false, 'message' => 'Playlist not found'], 404);
        }

        // Elimina las relaciones entre videos y la playlist si es necesario
        PlaylistVideo::where('playlist_id', $playlistId)->delete();

        // Elimina la playlist
        $playlist->delete();

        return response()->json(['success' => true, 'message' => 'Playlist deleted successfully']);
    }
}
