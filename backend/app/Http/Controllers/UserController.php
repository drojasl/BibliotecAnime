<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;

class userController extends Controller
{
    public function logIn(Request $request) {

        // header('Access-Control-Allow-Origin: *');
        // header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');

        // Validate the form data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'required' => 'Todos los campos son obligatorios.',
            'email.email' => 'El correo electrónico debe ser válido.',
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
    
    public function signUp(Request $request) {
        // Validate the form data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'username' => 'required',
        ], [
            'required' => 'Todos los campos son obligatorios.',
            'email.email' => 'El correo electrónico debe ser válido.',
        ]);
    
        // Get form data
        $email = $request->input('email');
        $password = $request->input('password');
        $username = $request->input('username');
    
        // Check if a user with the provided email already exists
        $existingUserWithEmail = User::where('email', $email)->first();
        $existingUserWithUsername = User::where('nick_name', $username)->first();

        // If user already exists with the email or username, return an error
        if ($existingUserWithEmail) {
            return response()->json(['message' => 'El correo electrónico ya está registrado'], 400);
        }
        
        // If user already exists with the username, return an error
        if ($existingUserWithUsername) {
            return response()->json(['message' => 'El nombre de usuario ya está en uso'], 400);
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
        return response()->json(['message' => 'Usuario registrado exitosamente', 'user' => $user], 200);
    }
    
}
