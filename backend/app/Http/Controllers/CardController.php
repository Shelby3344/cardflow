<?php

namespace App\Http\Controllers;

use App\Models\Card;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // Listar todos os cards do usuário autenticado
        $cards = Card::where('user_id', $request->user()->id)->get();

        return response()->json($cards);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): void
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'deck_id' => 'required|exists:decks,id',
            'front' => 'required|string',
            'back' => 'required|string',
            'tags' => 'nullable|string',
            'category' => 'nullable|string',
            'image_url' => 'nullable|url',
            'audio_url' => 'nullable|url',
            'type' => 'in:text,image,audio',
        ]);
        // Verifica se o deck pertence ao usuário
        $deck = \App\Models\Deck::find($validated['deck_id']);
        if ($deck->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Acesso negado ao deck.'], 403);
        }
        $validated['user_id'] = $request->user()->id;
        $card = Card::create($validated);

        return response()->json($card, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Card $card): JsonResponse
    {
        if ($card->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }

        return response()->json($card);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Card $card): void
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Card $card): JsonResponse
    {
        if ($card->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }
        $validated = $request->validate([
            'front' => 'sometimes|required|string',
            'back' => 'sometimes|required|string',
            'tags' => 'nullable|string',
            'category' => 'nullable|string',
            'image_url' => 'nullable|url',
            'audio_url' => 'nullable|url',
            'type' => 'in:text,image,audio',
        ]);
        $card->update($validated);

        return response()->json($card);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Card $card): JsonResponse
    {
        if ($card->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Acesso negado.'], 403);
        }
        $card->delete();

        return response()->json(['message' => 'Card removido com sucesso.']);
    }

    /**
     * Cria múltiplos cards de uma vez
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'deck_id' => 'required|exists:decks,id',
            'cards' => 'required|array|min:1',
            'cards.*.front' => 'required|string',
            'cards.*.back' => 'required|string',
            'cards.*.tags' => 'nullable|string',
            'cards.*.category' => 'nullable|string',
        ]);

        // Verifica se o deck pertence ao usuário
        $deck = \App\Models\Deck::find($validated['deck_id']);
        if ($deck->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado ao deck.',
            ], 403);
        }

        $createdCards = [];
        foreach ($validated['cards'] as $cardData) {
            $card = Card::create([
                'deck_id' => $validated['deck_id'],
                'user_id' => $request->user()->id,
                'front' => $cardData['front'],
                'back' => $cardData['back'],
                'tags' => $cardData['tags'] ?? null,
                'category' => $cardData['category'] ?? null,
                'type' => $cardData['type'] ?? 'text',
            ]);
            $createdCards[] = $card;
        }

        return response()->json([
            'success' => true,
            'message' => count($createdCards).' cards criados com sucesso',
            'data' => $createdCards,
        ], 201);
    }

    /**
     * Lista cards de um deck específico
     */
    public function byDeck(Request $request, string $deckId): JsonResponse
    {
        $deck = \App\Models\Deck::find($deckId);

        if (! $deck) {
            return response()->json([
                'success' => false,
                'message' => 'Deck não encontrado',
            ], 404);
        }

        if ($deck->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado ao deck.',
            ], 403);
        }

        $cards = Card::where('deck_id', $deckId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cards,
        ]);
    }
}
