<?php

namespace App\Models;

use Database\Factories\StudySessionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudySession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'deck_id',
        'card_id',
        'response',
        'quality',
        'response_time_ms',
        'time_spent',
    ];

    protected $casts = [
        'quality' => 'integer',
        'response_time_ms' => 'integer',
        'time_spent' => 'integer',
    ];

    /**
     * Relacionamento com o usuário
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relacionamento com o deck
     */
    public function deck(): BelongsTo
    {
        return $this->belongsTo(Deck::class);
    }

    /**
     * Relacionamento com o card
     */
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    /**
     * Scope para filtrar por deck
     */
    public function scopeByDeck($query, $deckId)
    {
        return $query->where('deck_id', $deckId);
    }

    /**
     * Scope para filtrar por usuário
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para respostas "know_it"
     */
    public function scopeKnowIt($query)
    {
        return $query->where('response', 'know_it');
    }
}
