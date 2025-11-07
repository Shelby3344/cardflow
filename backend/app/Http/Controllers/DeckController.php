<?php

namespace App\Http\Controllers;

use App\Models\Deck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DeckController extends Controller
{
    /**
     * Lista todos os decks do usuário autenticado com estatísticas
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $filter = $request->get('filter', 'all');

        // TEMPORARIAMENTE DESABILITADO O CACHE PARA DEBUG
        // $cacheKey = "decks_index_{$user->id}_{$filter}";
        // return Cache::remember($cacheKey, 300, function () use ($user, $filter) {

        // Ativar log de SQL
        \DB::enableQueryLog();

        $query = Deck::where('user_id', $user->id)
            // Removido ->mainDecks() para incluir subdecks na listagem
            ->with(['subDecks' => function ($q) {
                $q->select('id', 'parent_id', 'name');
            }])
            ->withCount('cards')
            ->select('id', 'name', 'description', 'icon', 'color', 'image_url', 'is_public', 'parent_id', 'order', 'created_at', 'updated_at', 'user_id')
            ->latest();

        // Filtro por visibilidade
        if ($filter === 'public') {
            $query->public();
        }

        $decks = $query->get();

        // Log SQL executado
        $queries = \DB::getQueryLog();
        \Log::info('DeckController index - SQL Query:', [
            'queries' => $queries,
        ]);

        // DEBUG: Log quantos decks foram encontrados
        \Log::info('=== DeckController index - START ===', [
            'user_id' => $user->id,
            'filter' => $filter,
            'timestamp' => now()->toDateTimeString(),
        ]);

        \Log::info('DeckController index - Query result:', [
            'count' => $decks->count(),
            'deck_ids' => $decks->pluck('id')->toArray(),
            'parent_ids' => $decks->pluck('parent_id')->toArray(),
            'names' => $decks->pluck('name')->toArray(),
        ]);

        // Verificar se existem subdecks no banco
        $allUserDecks = Deck::where('user_id', $user->id)->get();
        \Log::info('DeckController index - ALL decks in DB (ignoring query):', [
            'total_count' => $allUserDecks->count(),
            'all_ids' => $allUserDecks->pluck('id')->toArray(),
            'all_parent_ids' => $allUserDecks->pluck('parent_id')->toArray(),
        ]);

            // Buscar estatísticas básicas em uma única query
            $deckIds = $decks->pluck('id');
            $studiedCards = DB::table('cards')
                ->whereIn('deck_id', $deckIds)
                ->whereNotNull('last_studied_at')
                ->select('deck_id', DB::raw('COUNT(*) as studied_count'))
                ->groupBy('deck_id')
                ->pluck('studied_count', 'deck_id');

            // Mapear decks com estatísticas
            $decksWithStats = $decks->map(function ($deck) use ($studiedCards, $user) {
                $totalCards = $deck->cards_count;
                $studied = $studiedCards->get($deck->id, 0);
                $progress = $totalCards > 0 ? round(($studied / $totalCards) * 100) : 0;

                return [
                    'id' => $deck->id,
                    'name' => $deck->name,
                    'title' => $deck->name,
                    'description' => $deck->description,
                    'icon' => $deck->icon,
                    'color' => $deck->color,
                    'image' => $deck->image_url,
                    'image_url' => $deck->image_url,
                    'is_public' => $deck->is_public,
                    'parent_id' => $deck->parent_id,
                    'order' => $deck->order,
                    'created_at' => $deck->created_at,
                    'updated_at' => $deck->updated_at,
                    'cards_count' => $totalCards,
                    'total_cards' => $totalCards,
                    'studied_cards' => $studied,
                    'progress' => $progress,
                    'total_sub_decks' => $deck->subDecks->count(),
                    'user' => [
                        'name' => $user->name,
                        'id' => $user->id,
                    ],
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $decksWithStats,
            ]);
        // }); // Comentado temporariamente - era o fechamento do Cache::remember
    }

    /**
     * Lista decks públicos (para descobrir novos decks)
     */
    public function public(Request $request): JsonResponse
    {
        $query = Deck::public()
            ->mainDecks()
            ->with(['user:id,name', 'cards'])
            ->latest();

        // Busca
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $decks = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $decks,
        ]);
    }

    /**
     * Exibe um deck específico com todas as estatísticas
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $deck = Deck::with(['subDecks.cards', 'cards', 'user:id,name'])
            ->findOrFail($id);

        // Verifica permissão
        if (! $deck->is_public && $deck->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para acessar este deck',
            ], 403);
        }

        // Buscar estatísticas de estudo
        $deckStats = $this->getDeckStatistics($deck, $user->id);

        // Formatar resposta com todas as informações do dashboard
        $response = [
            'id' => $deck->id,
            'name' => $deck->name,
            'title' => $deck->name, // Compatibilidade com frontend
            'description' => $deck->description,
            'icon' => $deck->icon,
            'color' => $deck->color,
            'image' => $deck->image_url,
            'is_public' => $deck->is_public,
            'author' => $deck->user->name,
            'user_id' => $deck->user_id,
            'parent_id' => $deck->parent_id,
            'order' => $deck->order,
            'created_at' => $deck->created_at,
            'updated_at' => $deck->updated_at,

            // Estatísticas de cards
            'totalCards' => $deckStats['total_cards'],
            'cardsStudied' => $deckStats['studied_cards'],
            'total_cards' => $deckStats['total_cards'],
            'studied_cards' => $deckStats['studied_cards'],

            // Estatísticas de estudo
            'mastery' => $deckStats['mastery_percentage'],
            'mastery_percentage' => $deckStats['mastery_percentage'],
            'total_sessions' => $deckStats['total_sessions'],
            'total_time_spent_minutes' => $deckStats['total_time_spent_minutes'],
            'estimatedTime' => $this->calculateEstimatedTime($deckStats['total_cards'], $deckStats['studied_cards']),

            // Distribuição de respostas
            'response_distribution' => $deckStats['response_distribution'],

            // Última sessão
            'last_session' => $deckStats['last_session'],

            // Sub-decks com estatísticas
            'subDecks' => $deck->subDecks->map(function ($subDeck) use ($user) {
                $subStats = $this->getDeckStatistics($subDeck, $user->id);

                return [
                    'id' => $subDeck->id,
                    'name' => $subDeck->name,
                    'totalCards' => $subStats['total_cards'],
                    'cardsStudied' => $subStats['studied_cards'],
                    'progress' => $subStats['mastery_percentage'],
                    'completed' => $subStats['mastery_percentage'] >= 80,
                ];
            }),
            'totalSubDecks' => $deck->subDecks->count(),

            // Cards do deck (se necessário)
            'cards' => $deck->cards,
        ];

        return response()->json([
            'success' => true,
            'data' => $response,
        ]);
    }

    /**
     * Calcula estatísticas de um deck para um usuário
     *
     * @return array{total_cards: int, studied_cards: int, mastery_percentage: float, total_sessions: int, total_time_spent_minutes: float, response_distribution: array{know_it: int, kinda_know: int, dont_know: int}, last_session: array{date: \Illuminate\Support\Carbon, response: string}|null}
     */
    private function getDeckStatistics(Deck $deck, int $userId): array
    {
        $totalCards = $deck->cards->count();

        if ($totalCards === 0) {
            return [
                'total_cards' => 0,
                'studied_cards' => 0,
                'mastery_percentage' => 0,
                'total_sessions' => 0,
                'total_time_spent_minutes' => 0,
                'response_distribution' => [
                    'know_it' => 0,
                    'kinda_know' => 0,
                    'dont_know' => 0,
                ],
                'last_session' => null,
            ];
        }

        // Buscar estatísticas de estudo
        $studySessions = \App\Models\StudySession::where('deck_id', $deck->id)
            ->where('user_id', $userId)
            ->get();

        $studiedCards = $studySessions->pluck('card_id')->unique()->count();
        $totalSessions = $studySessions->count();
        $totalTimeSpent = $studySessions->sum('time_spent_seconds') / 60; // converter para minutos

        // Distribuição de respostas
        $distribution = [
            'know_it' => $studySessions->where('response', 'know_it')->count(),
            'kinda_know' => $studySessions->where('response', 'kinda_know')->count(),
            'dont_know' => $studySessions->where('response', 'dont_know')->count(),
        ];

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

        // Última sessão
        $lastSession = $studySessions->sortByDesc('created_at')->first();

        return [
            'total_cards' => $totalCards,
            'studied_cards' => $studiedCards,
            'mastery_percentage' => round($masteryScore, 1),
            'total_sessions' => $totalSessions,
            'total_time_spent_minutes' => round($totalTimeSpent, 1),
            'response_distribution' => $distribution,
            'last_session' => $lastSession ? [
                'date' => $lastSession->created_at,
                'response' => $lastSession->response,
            ] : null,
        ];
    }

    /**
     * Calcula tempo estimado restante
     */
    private function calculateEstimatedTime(int $totalCards, int $studiedCards): string
    {
        if ($totalCards === 0) {
            return '0m';
        }

        $remainingCards = $totalCards - $studiedCards;
        $avgTimePerCard = 2; // 2 minutos por card (estimativa)

        $totalMinutes = $remainingCards * $avgTimePerCard;
        $hours = floor($totalMinutes / 60);
        $minutes = $totalMinutes % 60;

        if ($hours > 0) {
            return "{$hours}h, {$minutes}m";
        }

        return "{$minutes}m";
    }

    /**
     * Cria um novo deck
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:10',
            'color' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_public' => 'boolean',
            'parent_id' => 'nullable|exists:decks,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $data = $validator->validated();
        $data['user_id'] = $user->id;

        // Upload de imagem
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('decks', 'public');
            $data['image_url'] = Storage::url($path);
        }

        // Define ordem para sub-decks
        if (isset($data['parent_id'])) {
            $maxOrder = Deck::where('parent_id', $data['parent_id'])->max('order') ?? 0;
            $data['order'] = $maxOrder + 1;
        }

        $deck = Deck::create($data);
        $deck->load(['subDecks', 'cards']);

        // Invalidar TODOS os caches relacionados a decks do usuário
        Cache::forget("decks_index_{$user->id}_all");
        Cache::forget("decks_index_{$user->id}_mine");
        Cache::forget("decks_index_{$user->id}_public");
        Cache::forget("sidebar_stats_{$user->id}");

        // Limpar qualquer cache que comece com decks_index para este usuário
        Cache::tags(["user_{$user->id}_decks"])->flush();

        return response()->json([
            'success' => true,
            'message' => 'Deck criado com sucesso!',
            'data' => $deck,
        ], 201);
    }

    /**
     * Atualiza um deck existente
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $deck = Deck::findOrFail($id);

        // Verifica permissão
        if ($deck->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para editar este deck',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:10',
            'color' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_public' => 'boolean',
            'remove_image' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Remove imagem se solicitado
        if ($request->boolean('remove_image') && $deck->image_url) {
            $oldPath = str_replace('/storage/', '', $deck->image_url);
            Storage::disk('public')->delete($oldPath);
            $data['image_url'] = null;
        }

        // Upload de nova imagem
        if ($request->hasFile('image')) {
            // Remove imagem antiga
            if ($deck->image_url) {
                $oldPath = str_replace('/storage/', '', $deck->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('decks', 'public');
            $data['image_url'] = Storage::url($path);
        }

        unset($data['remove_image']);
        $deck->update($data);
        $deck->load(['subDecks', 'cards']);

        // Invalidar cache
        Cache::forget("decks_index_{$user->id}_all");
        Cache::forget("decks_index_{$user->id}_mine");
        Cache::forget("sidebar_stats_{$user->id}");

        return response()->json([
            'success' => true,
            'message' => 'Deck atualizado com sucesso!',
            'data' => $deck,
        ]);
    }

    /**
     * Remove um deck
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $deck = Deck::findOrFail($id);

        // Verifica permissão
        if ($deck->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para excluir este deck',
            ], 403);
        }

        // Remove imagem se existir
        if ($deck->image_url) {
            $oldPath = str_replace('/storage/', '', $deck->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        // Remove deck e seus sub-decks (cascade)
        $deck->delete();

        // Invalidar cache de listagem de decks
        Cache::forget("decks_index_{$user->id}_all");
        Cache::forget("decks_index_{$user->id}_mine");
        Cache::forget("decks_index_{$user->id}_public");
        Cache::forget("sidebar_stats_{$user->id}");

        return response()->json([
            'success' => true,
            'message' => 'Deck excluído com sucesso!',
        ]);
    }

    /**
     * Reordena sub-decks
     */
    public function reorder(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $deck = Deck::findOrFail($id);

        // Verifica permissão
        if ($deck->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para reordenar este deck',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'sub_decks' => 'required|array',
            'sub_decks.*.id' => 'required|exists:decks,id',
            'sub_decks.*.order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        foreach ($request->sub_decks as $subDeck) {
            Deck::where('id', $subDeck['id'])
                ->where('parent_id', $id)
                ->update(['order' => $subDeck['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ordem atualizada com sucesso!',
        ]);
    }

    /**
     * Duplica um deck público para o usuário
     */
    public function duplicate(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $originalDeck = Deck::with(['subDecks', 'cards'])->findOrFail($id);

        // Verifica se é público ou do próprio usuário
        if (! $originalDeck->is_public && $originalDeck->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Este deck não está disponível para duplicação',
            ], 403);
        }

        // Duplica o deck
        $newDeck = $originalDeck->replicate();
        $newDeck->user_id = $user->id;
        $newDeck->is_public = false;
        $newDeck->name = $originalDeck->name.' (Cópia)';
        $newDeck->save();

        // Duplica sub-decks
        foreach ($originalDeck->subDecks as $subDeck) {
            $newSubDeck = $subDeck->replicate();
            $newSubDeck->parent_id = $newDeck->id;
            $newSubDeck->user_id = $user->id;
            $newSubDeck->save();

            // Duplica cards do sub-deck
            foreach ($subDeck->cards as $card) {
                $newCard = $card->replicate();
                $newCard->deck_id = $newSubDeck->id;
                $newCard->save();
            }
        }

        // Duplica cards do deck principal
        foreach ($originalDeck->cards as $card) {
            $newCard = $card->replicate();
            $newCard->deck_id = $newDeck->id;
            $newCard->save();
        }

        $newDeck->load(['subDecks', 'cards']);

        return response()->json([
            'success' => true,
            'message' => 'Deck duplicado com sucesso!',
            'data' => $newDeck,
        ], 201);
    }
}
