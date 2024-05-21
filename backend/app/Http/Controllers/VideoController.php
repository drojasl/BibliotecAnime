<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\VideoReview;
use App\Models\Video;
use App\Models\PlaylistVideo;

class videoController extends Controller
{
    public function getCurrentVideo() {
        // header('Access-Control-Allow-Origin: *');
        // header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');

        $playing = PlaylistVideo::where('playlist_id', PlaylistVideo::LIVE_PLAYLIST_ID)->first();
    
        if ($playing) {
            $video = Video::find($playing->video_id);
        } else {
            $video = Video::inRandomOrder()->first();
            PlaylistVideo::create([
                'playlist_id' => 1,
                'video_id' => $video->id,
            ]);
        }

        $rating = VideoReview::where('user_id', 1)
            ->where('video_id', $video->id)
            ->first();

        $video->rating = $rating ? $rating->rating : 0;

        return response()->json([
            'video' => $video,
        ]);
    }    

    public function getNextVideo() {
        $playingList = PlaylistVideo::where('playlist_id', PlaylistVideo::LIVE_PLAYLIST_ID)->get();

        if (isset($playingList[1])) {
            $queue = $playingList[1];
            $video = Video::find($queue->video_id);
        } else {
            $current = $playingList[0];
            do {
                $video = Video::inRandomOrder()->first();
            } while ($current->id == $video->id);

            PlaylistVideo::create([
                'playlist_id' => PlaylistVideo::LIVE_PLAYLIST_ID,
                'video_id' => $video->id,
            ]);
        }
        
        $rating = VideoReview::where('user_id', 1)
            ->where('video_id', $video->id)
            ->first();

        $video->rating = $rating ? $rating->rating : 0;
        return  response()->json($video);
    }

    public function currentVideoEnded() {
        PlaylistVideo::where('playlist_id', PlaylistVideo::LIVE_PLAYLIST_ID)->first()->delete();
        $this->getNextVideo();
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
/*
    public function getVideoList(Request $request)
    {
        $playingSong = PlayingSong::where('playing', 1)->first();
        $videoCount = DB::table('videos')->count();

        if (!$playingSong) {
            $randomVideoIndex = rand(1, $videoCount);
            $getVideo = DB::table('videos')->skip($randomVideoIndex - 1)->take(1)->first();

            PlayingSong::create([
                'song_id' => $getVideo->id,
                'playing' => true,
            ]);
        } else {
            $getVideo = DB::table('videos')->where('id', $playingSong->song_id)->first();

            $nextSong = PlayingSong::where('playing', 0)->first();
            if (!$nextSong) {
                $randomVideoIndex = rand(1, $videoCount);
                $nextVideo = DB::table('videos')->skip($randomVideoIndex - 1)->take(1)->first();
                PlayingSong::create([
                    'song_id' => $nextVideo->id,
                    'playing' => false,
                ]);
            } else {
                $nextVideo = DB::table('videos')->where('id', $nextSong->song_id)->first();
            }
        }

        $videoRating = 0;
        $videoReview = VideoReview::where('video_id', $getVideo->id)
            ->where('user_id', $request->input('user_id'))
            ->first();

        if ($videoReview) {
            $videoRating = $videoReview->rating;
        }

        $nextVideoRating = 0;
        if ($nextVideo) {
            $nextVideoReview = VideoReview::where('video_id', $nextVideo->id)
                ->where('user_id', $request->input('user_id'))
                ->first();

            if ($nextVideoReview) {
                $nextVideoRating = $nextVideoReview->rating;
            }
        }

        return response()->json([
            'actualVideo' => $getVideo,
            'nextVideo' => $nextVideo,
            'rating' => $videoRating,
            'nextVideoRating' => $nextVideoRating,
        ]);
    }
    
    public function cleanPlaying(Request $request)
    {
        try {
            $playingSong = PlayingSong::where('playing', 1)->first();

            if ($playingSong) {
                $playingSong->delete();
            }

            $nextSong = PlayingSong::where('playing', 0)->first();

            if ($nextSong) {
                $nextSong->update([
                    'playing' => true,
                    'updated_at' => now(),
                ]);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
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
*/
}
