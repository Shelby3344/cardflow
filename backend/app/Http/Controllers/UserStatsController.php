<?php

namespace App\Http\Controllers;

use App\Models\Deck;
use App\Models\StudySession;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class UserStatsController extends Controller
{
    /**
     * Retorna estatísticas gerais do usuário para o sidebar (COM CACHE)
     */
    public function getSidebarStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        // Cache por 5 minutos (300 segundos)
        $cacheKey = "sidebar_stats_{$userId}";

        return Cache::remember($cacheKey, 300, function () use ($userId) {
            // Dias seguidos (streak) - dias consecutivos com pelo menos 1 sessão de estudo
            $daysStreak = $this->calculateStreak($userId);

            // Tempo estudado hoje
            $studiedToday = $this->getStudiedToday($userId);

            // Média de tempo estudado por dia (últimos 7 dias)
            $avgStudiedPerDay = $this->getAverageStudyTime($userId);

            // Lista de decks do usuário com progresso
            $myDecks = $this->getUserDecksWithProgress($userId);

            // Total de classes (decks)
            $totalDecks = Deck::where('user_id', $userId)->mainDecks()->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'days_streak' => $daysStreak,
                    'studied_today' => $studiedToday,
                    'avg_studied_per_day' => $avgStudiedPerDay,
                    'total_decks' => $totalDecks,
                    'my_decks' => $myDecks,
                ],
            ]);
        });
    }

    /**
     * Calcula dias consecutivos de estudo (OTIMIZADO)
     */
    private function calculateStreak(int $userId): int
    {
        // Buscar todas as datas únicas com estudo de uma vez
        $studyDates = StudySession::where('user_id', $userId)
            ->select(DB::raw('DATE(created_at) as study_date'))
            ->distinct()
            ->orderByDesc('study_date')
            ->limit(365) // Máximo 1 ano de streak
            ->pluck('study_date')
            ->map(fn ($date) => Carbon::parse($date));

        if ($studyDates->isEmpty()) {
            return 0;
        }

        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $streak = 0;

        // Se não estudou hoje nem ontem, streak é 0
        if (! $studyDates->contains(fn ($date) => $date->isSameDay($today)) &&
            ! $studyDates->contains(fn ($date) => $date->isSameDay($yesterday))) {
            return 0;
        }

        // Calcular streak
        $currentDate = $studyDates->contains(fn ($date) => $date->isSameDay($today)) ? $today : $yesterday;

        foreach ($studyDates as $studyDate) {
            if ($studyDate->isSameDay($currentDate)) {
                $streak++;
                $currentDate = $currentDate->copy()->subDay();
            } elseif ($studyDate->lt($currentDate)) {
                break;
            }
        }

        return $streak;
    }

    /**
     * Tempo estudado hoje (em minutos formatado)
     */
    private function getStudiedToday(int $userId): string
    {
        $seconds = StudySession::where('user_id', $userId)
            ->whereDate('created_at', Carbon::today())
            ->sum('time_spent_seconds');

        $minutes = $seconds / 60;

        return $this->formatTime($minutes);
    }

    /**
     * Média de tempo estudado por dia (últimos 7 dias)
     */
    private function getAverageStudyTime(int $userId): string
    {
        $last7Days = Carbon::now()->subDays(7);

        $totalSeconds = StudySession::where('user_id', $userId)
            ->where('created_at', '>=', $last7Days)
            ->sum('time_spent_seconds');

        $totalMinutes = $totalSeconds / 60;
        $avgMinutes = $totalMinutes / 7;

        return $this->formatTime($avgMinutes);
    }

    /**
     * Formata tempo em minutos para string legível
     */
    private function formatTime(float $minutes): string
    {
        $minutes = round($minutes);

        if ($minutes >= 60) {
            $hours = floor($minutes / 60);
            $mins = $minutes % 60;

            if ($mins > 0) {
                return "{$hours}h {$mins}m";
            }

            return "{$hours}h";
        }

        return "{$minutes}m";
    }

    /**
     * Retorna lista de decks do usuário com progresso
     *
     * @return array<int, array{id: int, name: string, icon: string|null, color: string|null, image_url: string|null, progress: int, cards_count: int}>
     */
    private function getUserDecksWithProgress(int $userId): array
    {
        // Buscar decks com contagem de cards e eager loading
        $decks = Deck::where('user_id', $userId)
            ->mainDecks()
            ->with(['cards' => function ($query) {
                $query->select('id', 'deck_id', 'last_studied_at');
            }])
            ->withCount('cards')
            ->latest()
            ->limit(10)
            ->get();

        if ($decks->isEmpty()) {
            return [];
        }

        $deckIds = $decks->pluck('id')->toArray();

        // Buscar todas as sessões de estudo dos decks de uma vez (otimizado)
        $allSessions = StudySession::whereIn('deck_id', $deckIds)
            ->where('user_id', $userId)
            ->select('deck_id', 'card_id', 'response', 'created_at')
            ->get()
            ->groupBy('deck_id');

        return $decks->map(function ($deck) use ($allSessions) {
            $totalCards = $deck->cards_count;

            if ($totalCards === 0) {
                return [
                    'id' => $deck->id,
                    'name' => $deck->name,
                    'icon' => $deck->icon,
                    'color' => $deck->color,
                    'image' => $deck->image_url,
                    'progress' => 0,
                    'total_cards' => 0,
                    'studied_cards' => 0,
                ];
            }

            $studySessions = $allSessions->get($deck->id, collect());
            $studiedCards = $studySessions->pluck('card_id')->unique()->count();

            // Calcular mastery baseado na última resposta de cada card
            $masteryScore = 0;
            if ($studiedCards > 0) {
                $lastResponses = $studySessions->groupBy('card_id')->map(function ($sessions) {
                    return $sessions->sortByDesc('created_at')->first();
                });

                $knowItCount = $lastResponses->where('response', 'know_it')->count();
                $kindaKnowCount = $lastResponses->where('response', 'kinda_know')->count();

                $masteryScore = (($knowItCount * 100) + ($kindaKnowCount * 50)) / $studiedCards;
            }

            return [
                'id' => $deck->id,
                'name' => $deck->name,
                'icon' => $deck->icon,
                'color' => $deck->color,
                'image' => $deck->image_url,
                'progress' => round($masteryScore, 0),
                'total_cards' => $totalCards,
                'studied_cards' => $studiedCards,
            ];
        })->values()->toArray();
    }
}
