<?php

namespace App\Http\Controllers;

use App\Models\Language;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;


class dataController extends Controller
{
    public function getLanguages(Request $request)
    {
        $headers = [
            'Access-Control-Allow-Origin' => 'http://localhost:5173',
            'Access-Control-Allow-Methods' => 'POST, GET, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers' => 'Content-Type, X-Auth-Token, Origin, Authorization',
            'Access-Control-Allow-Credentials' => 'true',
        ];

        if ($request->isMethod('options')) {
            return response('', 200)->withHeaders($headers);
        }

        try {
            $languages = Language::pluck('language')->toArray();

            return response([
                'success' => true,
                'response' => $languages,
            ])->withHeaders($headers);
        } catch (\Exception $e) {
            return response([
                'success' => false,
                'response' => 'Error al obtener los lenguajes: ' . $e->getMessage(),
            ])->withHeaders($headers);
        }
    }
    
    public function setVideoDataUpload(Request $request)
    {
        try {
            $artistName = ucwords(strtolower($request->input('artistName')));
            $artist = DB::table('artists')->where('artist', $artistName)->first();

            if (!$artist) {
                $artistId = DB::table('artists')->insertGetId(['artist' => $artistName]);
            } else {
                $artistId = $artist->id;
            }

            $languageName = ucwords(strtolower($request->input('selectedLanguage')));
            $language = DB::table('languages')->where('language', $languageName)->first();

            if (!$language) {
                $languageId = DB::table('languages')->insertGetId(['language' => $languageName]);
            } else {
                $languageId = $language->id;
            }

            $file = $request->file('file');

            $timestamp = time();
            $fileName = $timestamp . '.' . $file->getClientOriginalExtension();

            $videoId = DB::table('videos')->insertGetId([
                'file_name' => $fileName,
                'user_id' => 1, //! TODO
                'artist' => $artistId,
                'language' => $languageId,
                'user_id' => $request->input('userId'),
                'anime' => $request->input('animeName'),
                'anime_alt' => $request->input('alternativeAnimeName'),
                'anime_parent' => $request->input('fatherAnimeName'),
                'type' => $request->input('type'),
                'format' => $request->input('animeFormat'),
                'title' => $request->input('songName'),
                'title_alt' => $request->input('alternativeAnimeTitle'),
                'year' => $request->input('releaseYear'),
                'number' => $request->input('animeNumber'),
                'version' => $request->input('artistVersion'),
                'lyrics' => $request->input('lyric'),
            ]);

            Log::info('Video data saved successfully.');

            $rootPath = realpath(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..\..\..\..');

            $destinationPath = "{$rootPath}/front/public/anime/{$fileName}";
            
            $file->move(public_path('media/videos/anime'), $fileName);

            File::copy(public_path("media/videos/anime/{$fileName}"), $destinationPath);
            
            return response()->json(['message' => 'File uploaded successfully', 'videoId' => $videoId]);

        } catch (\Exception $e) {
            Log::error('Exception in setVideoDataUpload: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while saving video data.', $e], 500);
        }
    }
}
