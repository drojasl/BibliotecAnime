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
        // Obtén el video que se está reproduciendo actualmente
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

            if ($currentVideo && now()->diffInSeconds($currentVideo->updated_at) > 10) {
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

        $videos = Video::where('user_id', '!=', $userId)->get();

        $playlists = DB::table('playlists')
            ->where('user_id', $userId)
            ->get();

        foreach ($playlists as $playlist) {
            $playlistVideos = DB::table('playlist_video')
                ->join('videos', 'playlist_video.video_id', '=', 'videos.id')
                ->where('playlist_video.playlist_id', $playlist->id)
                ->select('videos.*')
                ->get();

            $playlist->videos = $playlistVideos;
        }

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
