<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\VideoReview;
use App\Models\Video;
use App\Models\PlaylistVideo;
use App\Models\PlayingSong;
use App\Models\Playlist;
use App\Models\SharedPlaylist;
use Illuminate\Support\Str;

class VideoController extends Controller
{
    public function getCurrentVideo($userId)
    {
        $playingCurrent = PlayingSong::first();
        $ratingCurrent = 0;
        $ratingNext = 0;
        $secondsElapsed = 0;

        if (isset($playingCurrent)) {
            $video = Video::where('id', $playingCurrent->song_id)->first();
            $secondsElapsed = now()->diffInSeconds($playingCurrent->updated_at);
            $nextVideoResponse = $this->getNextVideo();
            $nextVideo = $nextVideoResponse->getData()->video;
        } else {
            $video = Video::inRandomOrder()->first();

            PlayingSong::create([
                'song_id' => $video->id,
                'playing' => 1,
            ]);

            $nextVideoResponse = $this->getNextVideo();
            $nextVideo = $nextVideoResponse->getData()->video;
        }

        if ($userId !== null) {
            $videoReviewCurrent = VideoReview::where('user_id', $userId)
                ->where('video_id', $video->id)
                ->first();
            $ratingCurrent = $videoReviewCurrent ? $videoReviewCurrent->rating : 0;

            $videoReviewNext = VideoReview::where('user_id', $userId)
                ->where('video_id', $nextVideo->id)
                ->first();
            $ratingNext = $videoReviewNext ? $videoReviewNext->rating : 0;
        }

        $response = [
            'success' => true,
            'currentVideo' => $video,
            'seconds_elapsed' => $secondsElapsed,
            'ratingCurrent' => $ratingCurrent,
            'nextVideo' => $nextVideo,
            'ratingNext' => $ratingNext,
        ];

        return response()->json($response);
    }

    public function getNextVideo()
    {
        $getVideosPlaying = PlayingSong::get();

        if (count($getVideosPlaying) === 1) {
            $video = Video::where('id', '!=', $getVideosPlaying->first()->song_id ?? null)->inRandomOrder()->first();

            var_dump($video);
            PlayingSong::create([
                'song_id' => $video->id,
                'playing' => 0,
            ]);
        } else {
            $nextVideo = $getVideosPlaying->where('playing', 0)->first();
            $video = Video::where('id', $nextVideo->song_id)->first();
        }
        return response()->json([
            'success' => true,
            'video' => $video,
        ]);
    }

    public function currentVideoEnded($videoId)
    {
        DB::beginTransaction();

        try {
            $currentVideo = PlayingSong::where('song_id', $videoId)
                ->where('playing', 1)
                ->first();

            if ($currentVideo /*&& now()->diffInSeconds($currentVideo->updated_at) > 10*/) {
                $currentVideo->delete();

                $nextSong = PlayingSong::where('playing', 0)
                    ->lockForUpdate()
                    ->first();

                if ($nextSong) {
                    $nextSong->playing = 1;
                    $nextSong->save();
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

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

    public function getVideosWithRatings(Request $request)
    {
        $userId = $request->input('user_id');

        // Recupera todos los videos
        $videos = Video::all();

        // Asigna el rating si user_id está presente
        if ($userId) {
            foreach ($videos as $video) {
                $rating = VideoReview::where('user_id', $userId)
                    ->where('video_id', $video->id)
                    ->first();

                // Asigna el rating al video
                $video->rating = $rating ? $rating->rating : 0;
            }
        } else {
            // Si no hay user_id, asigna un rating predeterminado de 0
            foreach ($videos as $video) {
                $video->rating = 0;
            }
        }

        // Convertir la colección a un array para una respuesta JSON
        $videosArray = $videos->map(function ($video) {
            return $video->toArray();
        });

        return response()->json([
            'videos' => $videosArray,
        ]);
    }

    public function getUserPosts(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
        ]);

        $userId = $request->input('user_id');

        $videos = Video::where('user_id', $userId)->get();

        return response()->json([
            'videos' => $videos,
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
        // Obtener el ID del video y del playlist
        $videoId = $request->input('id_videos');
        $playlistId = $request->input('id_playlist');

        // Verificar si el video ya está en la lista
        $exists = PlaylistVideo::where('video_id', $videoId)
            ->where('playlist_id', $playlistId)
            ->exists();

        // Si el video no está en la lista, agregarlo
        if (!$exists) {
            $playlistVideo = new PlaylistVideo();
            $playlistVideo->video_id = $videoId;
            $playlistVideo->playlist_id = $playlistId;

            try {
                $playlistVideo->save();
                return response()->json([
                    'success' => true,
                    'added_video' => $videoId,
                    'message' => 'Video added to playlist successfully'
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to add video to playlist',
                    'error' => $e->getMessage()
                ], 500);
            }
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Video already exists in the playlist'
            ], 400);
        }
    }


    public function deleteVideoFromPlaylist($playlistId, $videoId)
    {
        try {
            $playlist = Playlist::findOrFail($playlistId);

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

    public function updatePlaylist(Request $request, $token)
    {
        try {
            $playlist = Playlist::where('token', $token)->firstOrFail();

            $playlist->name = $request->input('name');
            $playlist->cover = $request->input('cover');

            $playlist->save();

            return response()->json([
                'success' => true,
                'message' => 'Playlist updated successfully',
                'playlist' => $playlist,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update playlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deletePlaylist($token)
    {
        try {
            $playlist = Playlist::where('token', $token)->firstOrFail();

            PlaylistVideo::where('playlist_id', $playlist->id)->delete();

            $playlist->delete();

            return response()->json([
                'success' => true,
                'message' => 'Playlist deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete playlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function sharePlaylist($token)
    {
        try {
            $playlist = Playlist::where('token', $token)->firstOrFail();

            $sharedPlaylist = SharedPlaylist::where('playlist_token', $playlist->token)->first();

            if ($sharedPlaylist) {
                $shareToken = $sharedPlaylist->token;
            } else {
                $shareToken = Str::random(64);
                SharedPlaylist::create([
                    'playlist_token' => $playlist->token,
                    'token' => $shareToken,
                    'used' => 0,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Playlist shared successfully',
                'link' => url("/playlist/{$shareToken}"),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to share playlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getUserPlaylists(Request $request)
    {
        // header("Access-Control-Allow-Origin: *");
        // header("Access-Control-Allow-Methods: *");
        // header("Access-Control-Allow-Headers: *");

        $userId = $request->query('user_id');

        if (!$userId) {
            return response()->json(['error' => 'El ID de usuario es requerido.'], 400);
        }

        $playlists = Playlist::where('user_id', $userId)->get();

        $playlistsWithVideoCount = $playlists->map(function ($playlist) {
            return [
                'id' => $playlist->id,
                'cover' => $playlist->cover,
                'token' => $playlist->token,
                'name' => $playlist->name,
                'video_count' => $playlist->playlistVideos()->count(),
            ];
        });

        return response()->json($playlistsWithVideoCount);
    }

    public function getPlaylist($token)
    {
        $playlist = Playlist::where('token', $token)->first();

        if (!$playlist) {
            return response()->json(['error' => 'Playlist not found'], 404);
        }

        $videoIds = $playlist->playlistVideos()->orderBy('order')->pluck('video_id')->toArray();

        if (empty($videoIds)) {
            $videos = collect();
        } else {
            $videos = Video::whereIn('id', $videoIds)
                ->orderByRaw('FIELD(id, ' . implode(',', $videoIds) . ')')
                ->get();
        }

        return response()->json([
            'id' => $playlist->id,
            'name' => $playlist->name,
            'cover' => $playlist->cover,
            'video_count' => $videos->count(),
            'videos' => $videos
        ]);
    }


    public function updatePlaylistOrder($token)
    {
        $playlist = Playlist::where('token', $token)->first();

        if (!$playlist) {
            return response()->json(['error' => 'Playlist not found'], 404);
        }

        $videoIds = request()->input('videos');

        if (!is_array($videoIds) || empty($videoIds)) {
            return response()->json(['error' => 'Invalid video IDs'], 400);
        }
        $playlistVideos = PlaylistVideo::where('playlist_id', $playlist->id)->get();

        $orderMap = array_flip($videoIds);

        foreach ($playlistVideos as $playlistVideo) {
            if (isset($orderMap[$playlistVideo->video_id])) {
                $playlistVideo->order = $orderMap[$playlistVideo->video_id];
                $playlistVideo->save();
            }
        }

        return response()->json(['message' => 'Playlist order updated successfully']);
    }

    public function createNewPlaylist(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'playlist_name' => 'required|string|max:255',
            'cover' => 'nullable|string',
        ]);

        $userId = $request->input('user_id');
        $playlistName = $request->input('playlist_name');
        $cover = $request->input('cover');

        try {
            $playlist = new Playlist();
            $playlist->user_id = $userId;
            $playlist->name = $playlistName;
            $playlist->cover = $cover;
            $playlist->token = Str::random(64);
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
}
