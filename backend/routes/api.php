<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;

// Autenticação
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/auth/social', [SocialAuthController::class, 'socialAuth']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

use App\Http\Controllers\CardController;
use App\Http\Controllers\DeckController;
use App\Http\Controllers\StudySessionController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\UserStatsController;

// Rotas RESTful protegidas para decks e cards
Route::middleware('auth:sanctum')->group(function () {
    // User Stats (Sidebar)
    Route::get('/user/sidebar-stats', [UserStatsController::class, 'getSidebarStats']);

    // User Profile
    Route::post('/user/profile-photo', [UserProfileController::class, 'uploadPhoto']);
    Route::delete('/user/profile-photo', [UserProfileController::class, 'deletePhoto']);
    Route::put('/user/profile', [UserProfileController::class, 'updateProfile']);

    // Decks
    Route::get('/decks', [DeckController::class, 'index']);
    Route::post('/decks', [DeckController::class, 'store']);
    Route::get('/decks/public', [DeckController::class, 'public']);
    Route::get('/decks/{id}', [DeckController::class, 'show']);
    Route::put('/decks/{id}', [DeckController::class, 'update']);
    Route::post('/decks/{id}', [DeckController::class, 'update']); // Para suportar multipart/form-data
    Route::delete('/decks/{id}', [DeckController::class, 'destroy']);
    Route::post('/decks/{id}/reorder', [DeckController::class, 'reorder']);
    Route::post('/decks/{id}/duplicate', [DeckController::class, 'duplicate']);

    // Cards
    Route::apiResource('cards', CardController::class);
    Route::post('/cards/bulk', [CardController::class, 'bulkStore']);
    Route::get('/decks/{deckId}/cards', [CardController::class, 'byDeck']);

    // Study Sessions
    Route::post('/study/sessions', [StudySessionController::class, 'store']);
    Route::get('/study/decks/{deckId}/stats', [StudySessionController::class, 'getDeckStats']);
    Route::get('/study/decks/{deckId}/history', [StudySessionController::class, 'getDeckHistory']);
    Route::get('/study/decks/{deckId}/cards', [StudySessionController::class, 'getCardsToStudy']);

    // Exemplo de rota protegida para Swagger
    /**
     * @OA\Get(
     *     path="/api/ping",
     *     summary="Ping protegido",
     *     security={{"sanctum":{}}},
     *
     *     @OA\Response(response=200, description="OK")
     * )
     */
    Route::get('/ping', function () {
        return response()->json(['message' => 'OK']);
    });
});
