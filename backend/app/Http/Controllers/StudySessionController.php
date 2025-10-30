<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\Deck;
use App\Models\StudySession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudySessionController extends Controller
{
    /**
     * Registrar uma resposta de estudo
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'deck_id' => 'required|exists:decks,id',
            'card_id' => 'required|exists:cards,id',
            'response' => 'required|in:know_it,kinda_know,dont_know',
            'time_spent_seconds' => 'integer|min:0',
        ]);

        // Verificar se o usuário tem acesso ao deck
        $deck = Deck::findOrFail($validated['deck_id']);
        if ($deck->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        // Verificar se o card pertence ao deck
        $card = Card::findOrFail($validated['card_id']);
        if ($card->deck_id !== $validated['deck_id']) {
            return response()->json(['error' => 'Card não pertence a este deck'], 400);
        }

        $studySession = StudySession::create([
            'user_id' => $request->user()->id,
            'deck_id' => $validated['deck_id'],
            'card_id' => $validated['card_id'],
            'response' => $validated['response'],
            'time_spent_seconds' => $validated['time_spent_seconds'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Resposta registrada com sucesso',
            'study_session' => $studySession,
        ], 201);
    }

    /**
     * Obter estatísticas de um deck
     */
    public function getDeckStats(string $deckId): JsonResponse
    {
        $deck = Deck::findOrFail($deckId);

        // Verificar permissão
        if ($deck->user_id !== auth()->id()) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $userId = auth()->id();

        // Total de cards no deck
        $totalCards = Card::where('deck_id', $deckId)->count();

        // Cards estudados (pelo menos uma vez)
        $studiedCards = StudySession::byDeck($deckId)
            ->byUser($userId)
            ->distinct('card_id')
            ->count('card_id');

        // Total de sessões de estudo
        $totalSessions = StudySession::byDeck($deckId)
            ->byUser($userId)
            ->count();

        // Distribuição de respostas
        $responseDistribution = StudySession::byDeck($deckId)
            ->byUser($userId)
            ->select('response', DB::raw('count(*) as count'))
            ->groupBy('response')
            ->get()
            ->pluck('count', 'response');

        // Calcular mastery (baseado na última resposta de cada card)
        $lastResponses = StudySession::byDeck($deckId)
            ->byUser($userId)
            ->select('card_id', 'response', DB::raw('MAX(created_at) as last_study'))
            ->groupBy('card_id', 'response')
            ->get();

        $masteryScore = 0;
        if ($studiedCards > 0) {
            $knowItCount = $lastResponses->where('response', 'know_it')->count();
            $kindaKnowCount = $lastResponses->where('response', 'kinda_know')->count();

            // know_it = 100%, kinda_know = 50%, dont_know = 0%
            $masteryScore = (($knowItCount * 100) + ($kindaKnowCount * 50)) / $studiedCards;
        }

        // Tempo total de estudo (em minutos)
        $totalTimeSpent = StudySession::byDeck($deckId)
            ->byUser($userId)
            ->sum('time_spent_seconds') / 60;

        // Última sessão de estudo
        $lastSession = StudySession::byDeck($deckId)
            ->byUser($userId)
            ->latest()
            ->first();

        return response()->json([
            'deck_id' => $deckId,
            'total_cards' => $totalCards,
            'studied_cards' => $studiedCards,
            'total_sessions' => $totalSessions,
            'mastery_percentage' => round($masteryScore, 1),
            'response_distribution' => [
                'know_it' => $responseDistribution['know_it'] ?? 0,
                'kinda_know' => $responseDistribution['kinda_know'] ?? 0,
                'dont_know' => $responseDistribution['dont_know'] ?? 0,
            ],
            'total_time_spent_minutes' => round($totalTimeSpent, 1),
            'last_session' => $lastSession ? [
                'date' => $lastSession->created_at,
                'response' => $lastSession->response,
            ] : null,
        ]);
    }

    /**
     * Obter histórico de estudo de um deck
     */
    public function getDeckHistory(string $deckId): JsonResponse
    {
        $deck = Deck::findOrFail($deckId);

        // Verificar permissão
        if ($deck->user_id !== auth()->id()) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $history = StudySession::byDeck($deckId)
            ->byUser(auth()->id())
            ->with('card:id,front')
            ->latest()
            ->paginate(50);

        return response()->json($history);
    }

    /**
     * Obter cards para estudar (priorizando não estudados ou com respostas ruins)
     */
    public function getCardsToStudy(string $deckId): JsonResponse
    {
        $deck = Deck::findOrFail($deckId);

        // Verificar permissão
        if ($deck->user_id !== auth()->id()) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $userId = auth()->id();

        // Buscar todos os cards do deck
        $allCards = Card::where('deck_id', $deckId)->pluck('id');

        if ($allCards->isEmpty()) {
            return response()->json([
                'cards' => [],
                'message' => 'Este deck não possui cards',
            ]);
        }

        // Cards nunca estudados
        $studiedCardIds = StudySession::byDeck($deckId)
            ->byUser($userId)
            ->distinct()
            ->pluck('card_id');

        $unstudiedCards = $allCards->diff($studiedCardIds);

        // Se houver cards não estudados, priorizar eles
        if ($unstudiedCards->isNotEmpty()) {
            $cards = Card::whereIn('id', $unstudiedCards)
                ->inRandomOrder()
                ->get();
        } else {
            // Caso contrário, pegar cards com última resposta "dont_know" ou "kinda_know"
            $cardsNeedingReview = StudySession::byDeck($deckId)
                ->byUser($userId)
                ->whereIn('response', ['dont_know', 'kinda_know'])
                ->select('card_id', DB::raw('MAX(created_at) as last_study'))
                ->groupBy('card_id')
                ->orderBy('last_study', 'asc')
                ->limit(20)
                ->pluck('card_id');

            if ($cardsNeedingReview->isNotEmpty()) {
                $cards = Card::whereIn('id', $cardsNeedingReview)->get();
            } else {
                // Se todos os cards estão dominados, revisar todos em ordem aleatória
                $cards = Card::where('deck_id', $deckId)
                    ->inRandomOrder()
                    ->get();
            }
        }

        return response()->json([
            'cards' => $cards,
            'total_cards' => $allCards->count(),
            'studied_cards' => $studiedCardIds->count(),
        ]);
    }
}
