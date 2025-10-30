<?php

namespace App\Models;

use Database\Factories\DeckFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $parent_id
 * @property string $name
 * @property string|null $description
 * @property string|null $icon
 * @property string|null $color
 * @property string|null $image_url
 * @property bool $is_public
 * @property int|null $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read int $progress
 * @property-read int $cards_count
 * @property-read int $cards_studied
 * @property-read \App\Models\User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Card> $cards
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Deck> $subDecks
 * @property-read \App\Models\Deck|null $parentDeck
 */
class Deck extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
        'description',
        'icon',
        'color',
        'image_url',
        'is_public',
        'order',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'order' => 'integer',
    ];

    protected $appends = ['progress', 'cards_count', 'cards_studied'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cards(): HasMany
    {
        return $this->hasMany(Card::class);
    }

    public function subDecks(): HasMany
    {
        return $this->hasMany(Deck::class, 'parent_id')->orderBy('order');
    }

    public function parentDeck(): BelongsTo
    {
        return $this->belongsTo(Deck::class, 'parent_id');
    }

    // Atributos calculados
    public function getProgressAttribute(): int
    {
        $total = $this->cards()->count();
        if ($total === 0) {
            return 0;
        }

        $studied = $this->cards()->where('last_studied_at', '!=', null)->count();

        return (int) round(($studied / $total) * 100);
    }

    public function getCardsCountAttribute(): int
    {
        return $this->cards()->count();
    }

    public function getCardsStudiedAttribute(): int
    {
        return $this->cards()->where('last_studied_at', '!=', null)->count();
    }

    // Scope para decks principais (não são sub-decks)
    /**
     * @param  Builder<Deck>  $query
     * @return Builder<Deck>
     */
    public function scopeMainDecks(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    // Scope para decks públicos
    /**
     * @param  Builder<Deck>  $query
     * @return Builder<Deck>
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }
}
