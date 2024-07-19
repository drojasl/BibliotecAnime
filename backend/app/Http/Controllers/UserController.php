<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class userController extends Controller
{
    public function logIn(Request $request)
    {
        // Validate the form data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'required' => 'All fields are required.',
            'email.email' => 'The email must be valid.',
        ]);

        // Get form data
        $email = $request->input('email');
        $password = $request->input('password');

        // Find the user by email
        $user = User::where('email', $email)->first();

        // Check if a user with the provided email was found
        if ($user) {
            // Check if the password matches
            if (password_verify($password, $user->password)) {
                // User authenticated successfully
                return response()->json(['message' => 'Login successful', 'user' => $user], 200);
            } else {
                // Incorrect password
                return response()->json(['message' => 'Incorrect password'], 401);
            }
        } else {
            // User not found
            return response()->json(['message' => 'User not found'], 404);
        }
    }

    public function authGoogle(Request $request)
    {
        // Validate the form data
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.email' => 'The email must be valid.',
        ]);

        // Get form data
        $email = $request->input('email');

        // Find the user by email
        $user = User::where('email', $email)->first();

        // Check if a user with the provided email was found
        if ($user) {
            return response()->json(['message' => 'Login successful', 'user' => $user], 200);
        } else {
            // User not found
            return response()->json(['message' => 'User not found'], 404);
        }
    }

    public function signUp(Request $request)
    {
        // Validate the form data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'username' => 'required',
        ], [
            'required' => 'All fields are required.',
            'email.email' => 'The email must be valid.',
        ]);

        // Get form data
        $email = $request->input('email');
        $password = $request->input('password');
        $username = $request->input('username');

        // Check if a user with the provided email already exists
        $existingUserWithEmail = User::where('email', $email)->first();
        $existingUserWithUsername = User::where('nick_name', $username)->first();

        // If user already exists with the email, return an error
        if ($existingUserWithEmail) {
            return response()->json(['message' => 'The email is already registered'], 400);
        }

        // If user already exists with the username, return an error
        if ($existingUserWithUsername) {
            return response()->json(['message' => 'The username is already in use'], 400);
        }

        // Create new user
        $user = new User();
        $user->email = $email;
        $user->nick_name = $username;
        $user->password = bcrypt($password);
        $user->roles = 'new_user';
        $user->remember_token = Str::random(10);
        $user->save();

        // Return success message
        return response()->json(['message' => 'User registered successfully', 'user' => $user], 200);
    }

    public function getUserByUsername($username)
    {
        // Find user by username (nick_name)
        $user = User::where('nick_name', $username)->first();

        // If the user is found, get their playlists and videos
        if ($user) {
            $playlists = DB::table('playlists')
                ->where('user_id', $user->id)
                ->get();

            // For each playlist, get the associated videos
            foreach ($playlists as $playlist) {
                $playlistVideos = DB::table('playlist_video')
                    ->join('videos', 'playlist_video.video_id', '=', 'videos.id')
                    ->where('playlist_video.playlist_id', $playlist->id)
                    ->select('videos.*')
                    ->get();

                $playlist->videos = $playlistVideos;
            }

            return response()->json([
                'message' => 'User found',
                'user' => [
                    'id' => $user->id,
                    'profile_pic' => $user->profile_pic,
                    'nick_name' => $user->nick_name,
                    'playlists' => $playlists,
                ]
            ], 200);
        }

        // If the user is not found, return error 404
        return response()->json(['message' => 'User not found'], 404);
    }

    /**
     * Validate if a username is available.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateUsername(Request $request)
    {
        $request->validate([
            'username' => [
                'required',
                'string',
                'max:255',
                'unique:users,nick_name',
            ],
        ], [
            'username.unique' => 'Sorry, this username is already taken.',
        ]);

        return response()->json(['available' => true]);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->nick_name = $request->input('nick_name');
        $user->profile_pic = $request->input('profile_pic');

        $user->save();

        return response()->json(['message' => 'Successfully updated user', 'user' => $user]);
    }

    
}