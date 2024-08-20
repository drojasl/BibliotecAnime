<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use App\Models\Language;
use App\Models\Video;

class DataController extends Controller
{
    public function getLanguages(Request $request)
    {
        try {
            $languages = Language::pluck('language')->toArray();

            return response()->json([
                'success' => true,
                'response' => $languages,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'response' => 'Error al obtener los lenguajes: ' . $e->getMessage(),
            ]);
        }
    }

    public function setVideoDataUpload(Request $request)
    {
        DB::beginTransaction();

        try {
            $userId = $request->input('userId');
            $userExists = DB::table('users')->where('id', $userId)->exists();

            if (!$userExists) {
                DB::rollBack();
                return response()->json(['error' => 'Invalid user ID.'], 400);
            }

            $artistName = ucwords(strtolower($request->input('artistName')));
            $artist = DB::table('artists')->where('artist', $artistName)->first();

            if (!$artist) {
                $artistId = DB::table('artists')->insertGetId(['artist' => $artistName]);
            } else {
                $artistId = $artist->id;
            }

            $file = $request->file('file');
            $timestamp = time();
            $fileName = $timestamp . '.' . $file->getClientOriginalExtension();

            $videoId = DB::table('videos')->insertGetId([
                'file_name' => $fileName,
                'artist' => $artistId,
                'language' => $request->input('selectedLanguage'),
                'user_id' => $userId,
                'anime' => $request->input('animeName'),
                'anime_alt' => $request->input('alternativeAnimeName'),
                'anime_parent' => $request->input('fatherAnimeName'),
                'type' => $request->input('type'),
                'format' => $request->input('animeFormat'),
                'title' => $request->input('songName'),
                'year' => $request->input('releaseYear'),
                'number' => $request->input('animeNumber'),
                'version' => $request->input('artistVersion'),
                'cover' => $request->input('cover'),
            ]);

            $destinationPath = base_path('public_html/videos/anime');
            $file->move($destinationPath, $fileName);

            DB::commit();
            return response()->json(['message' => 'File uploaded successfully', 'videoId' => $videoId]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Exception in setVideoDataUpload: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while saving video data. ' . $e->getMessage()], 500);
        }
    }

    public function updateVideoData(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:videos,id',
            'songName' => 'nullable|string',
            'animeName' => 'nullable|string',
            'fatherAnimeName' => 'nullable|string',
            'alternativeAnimeName' => 'nullable|string',
            'type' => 'nullable|string',
            'animeFormat' => 'nullable|string',
            'artistName' => 'nullable|string',
            'selectedLanguage' => 'nullable|string',
            'releaseYear' => 'nullable|integer',
            'animeNumber' => 'nullable|integer',
            'artistVersion' => 'nullable|string',
        ]);

        try {
            $video = Video::find($request->input('id'));

            if (!$video) {
                return response()->json(['success' => false, 'message' => 'Video not found'], 404);
            }

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $originalFile = $request->input('originalFile');
                $timestamp = time();
                $fileName = $timestamp . '.' . $file->getClientOriginalExtension();
                $rootPath = realpath(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..\..\..\..');

                $destinationPath = "{$rootPath}/front/public/anime/{$fileName}";

                $file->move(public_path('media/videos/anime'), $fileName);
                File::copy(public_path("media/videos/anime/{$fileName}"), $destinationPath);
                $video->file_name = $fileName;

                if ($originalFile) {
                    $originalFilePath = public_path('media/videos/anime') . '/' . $originalFile;
                    if (file_exists($originalFilePath)) {
                        unlink($originalFilePath);
                    }
                }

                if ($originalFile) {
                    $originalFilePathFront = "{$rootPath}/front/public/anime/{$originalFile}";
                    if (file_exists($originalFilePathFront)) {
                        unlink($originalFilePathFront);
                    } else {
                        Log::error("Archivo no encontrado en frontend: {$originalFilePathFront}");
                    }
                }
            }

            $video->title = $request->input('songName') ?: null;
            $video->anime = $request->input('animeName') ?: null;
            $video->anime_parent = $request->input('fatherAnimeName') ?: null;
            $video->anime_alt = $request->input('alternativeAnimeName') ?: null;
            $video->type = $request->input('type') ?: null;
            $video->format = $request->input('animeFormat') ?: null;
            $video->artist = $request->input('artistName') ?: null;
            $video->language = $request->input('selectedLanguage') ?: null;
            $video->year = $request->input('releaseYear') ?: null;
            $video->number = $request->input('animeNumber') ?: null;
            $video->version = $request->input('artistVersion') ?: null;

            $video->save();

            return response()->json(['success' => true, 'message' => 'Video data updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating video data: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error updating video data', 'error' => $e->getMessage()], 500);
        }
    }
}
