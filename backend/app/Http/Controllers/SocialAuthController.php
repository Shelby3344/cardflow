<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    /**
     * Autenticação via provedores sociais (Google, Apple)
     */
    public function socialAuth(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|in:google,apple',
            'provider_id' => 'required|string',
            'email' => 'required|email',
            'name' => 'required|string',
        ]);

        // Buscar usuário por email ou provider_id
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Criar novo usuário
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make(Str::random(32)), // Senha aleatória (não será usada)
                'email_verified_at' => now(), // Email já verificado pelo provider
            ]);
        }

        // Gerar token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user,
        ]);
    }
}
