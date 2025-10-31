<?php

namespace App\Models;

use Database\Factories\CardFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $deck_id
 * @property int $user_id
 * @property string $front
 * @property string $back
 * @property string|null $tags
 * @property string|null $category
 * @property string|null $image_url
 * @property string|null $audio_url
 * @property string $type
 * @property int $mastery_level
 * @property \Illuminate\Support\Carbon|null $next_review_at
 * @property \Illuminate\Support\Carbon|null $last_studied_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Deck $deck
 * @property-read \App\Models\User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StudySession> $studySessions
 */
class Card extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'deck_id', 'user_id', 'front', 'back', 'tags', 'category', 'image_url', 'audio_url', 'type', 'mastery_level', 'next_review_at',
    ];

    protected $casts = [
        'mastery_level' => 'integer',
        'next_review_at' => 'datetime',
        'last_studied_at' => 'datetime',
    ];

    public function deck(): BelongsTo
    {
        return $this->belongsTo(Deck::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function studySessions(): HasMany
    {
        return $this->hasMany(StudySession::class);
    }
}
