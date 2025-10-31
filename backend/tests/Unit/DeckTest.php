<?php

namespace Tests\Unit;

use App\Models\Card;
use App\Models\Deck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeckTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test deck can be created with factory
     */
    public function test_deck_can_be_created_with_factory(): void
    {
        $user = User::factory()->create();
        $deck = Deck::factory()->for($user)->create([
            'name' => 'Test Deck',
            'description' => 'Test Description',
        ]);

        $this->assertInstanceOf(Deck::class, $deck);
        $this->assertEquals('Test Deck', $deck->name);
        $this->assertEquals('Test Description', $deck->description);
        $this->assertDatabaseHas('decks', [
            'id' => $deck->id,
            'name' => 'Test Deck',
        ]);
    }

    /**
     * Test deck belongs to user
     */
    public function test_deck_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $deck = Deck::factory()->for($user)->create();

        $this->assertInstanceOf(User::class, $deck->user);
        $this->assertEquals($user->id, $deck->user->id);
    }

    /**
     * Test deck has many cards
     */
    public function test_deck_has_many_cards(): void
    {
        $deck = Deck::factory()->create();
        $cards = Card::factory()->count(5)->for($deck)->create();

        $this->assertCount(5, $deck->cards);
        $this->assertInstanceOf(Card::class, $deck->cards->first());
    }

    /**
     * Test deck can be public or private
     */
    public function test_deck_can_be_public_or_private(): void
    {
        $publicDeck = Deck::factory()->create(['is_public' => true]);
        $privateDeck = Deck::factory()->create(['is_public' => false]);

        $this->assertTrue($publicDeck->is_public);
        $this->assertFalse($privateDeck->is_public);
    }

    /**
     * Test deck is private by default
     */
    public function test_deck_is_private_by_default(): void
    {
        $deck = Deck::factory()->create();

        $this->assertFalse($deck->is_public);
    }

    /**
     * Test deck has timestamps
     */
    public function test_deck_has_timestamps(): void
    {
        $deck = Deck::factory()->create();

        $this->assertNotNull($deck->created_at);
        $this->assertNotNull($deck->updated_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $deck->created_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $deck->updated_at);
    }

    /**
     * Test deck uses soft deletes
     */
    public function test_deck_uses_soft_deletes(): void
    {
        $deck = Deck::factory()->create();
        $deckId = $deck->id;

        $deck->delete();

        $this->assertSoftDeleted('decks', ['id' => $deckId]);
        $this->assertNotNull($deck->deleted_at);
    }

    /**
     * Test deleting deck soft deletes associated cards
     */
    public function test_deleting_deck_soft_deletes_associated_cards(): void
    {
        $deck = Deck::factory()->create();
        $card = Card::factory()->for($deck)->create();

        $deck->delete();

        $this->assertSoftDeleted('cards', ['id' => $card->id]);
    }

    /**
     * Test deck fillable attributes
     */
    public function test_deck_fillable_attributes(): void
    {
        $user = User::factory()->create();
        $deck = Deck::factory()->for($user)->make([
            'name' => 'Fillable Name',
            'description' => 'Fillable Description',
            'is_public' => true,
        ]);

        $this->assertEquals('Fillable Name', $deck->name);
        $this->assertEquals('Fillable Description', $deck->description);
        $this->assertTrue($deck->is_public);
    }

    /**
     * Test deck casts attributes correctly
     */
    public function test_deck_casts_attributes_correctly(): void
    {
        $deck = Deck::factory()->create([
            'is_public' => 1,
            'created_at' => '2025-01-01 12:00:00',
        ]);

        $this->assertIsBool($deck->is_public);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $deck->created_at);
    }

    /**
     * Test deck has cards count accessor
     */
    public function test_deck_has_cards_count_accessor(): void
    {
        $deck = Deck::factory()->create();
        Card::factory()->count(7)->for($deck)->create();

        $deck = Deck::withCount('cards')->find($deck->id);

        $this->assertEquals(7, $deck->cards_count);
    }

    /**
     * Test deck scope for public decks
     */
    public function test_deck_scope_for_public_decks(): void
    {
        Deck::factory()->count(3)->create(['is_public' => true]);
        Deck::factory()->count(2)->create(['is_public' => false]);

        $publicDecks = Deck::where('is_public', true)->get();

        $this->assertCount(3, $publicDecks);
    }

    /**
     * Test deck scope for user decks
     */
    public function test_deck_scope_for_user_decks(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Deck::factory()->count(3)->for($user1)->create();
        Deck::factory()->count(2)->for($user2)->create();

        $user1Decks = Deck::where('user_id', $user1->id)->get();

        $this->assertCount(3, $user1Decks);
    }

    /**
     * Test deck can calculate average mastery level
     */
    public function test_deck_can_calculate_average_mastery_level(): void
    {
        $deck = Deck::factory()->create();

        Card::factory()->for($deck)->create(['mastery_level' => 2]);
        Card::factory()->for($deck)->create(['mastery_level' => 4]);
        Card::factory()->for($deck)->create(['mastery_level' => 6]);

        $averageMastery = $deck->cards()->avg('mastery_level');

        $this->assertEquals(4, $averageMastery);
    }

    /**
     * Test deck can get cards due for review
     */
    public function test_deck_can_get_cards_due_for_review(): void
    {
        $deck = Deck::factory()->create();

        Card::factory()->count(3)->for($deck)->create([
            'next_review_at' => now()->subDay(),
        ]);

        Card::factory()->count(2)->for($deck)->create([
            'next_review_at' => now()->addDay(),
        ]);

        $dueCards = $deck->cards()
            ->where('next_review_at', '<=', now())
            ->get();

        $this->assertCount(3, $dueCards);
    }

    /**
     * Test deck name is required
     */
    public function test_deck_name_is_required(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Deck::factory()->create(['name' => null]);
    }

    /**
     * Test deck description can be null
     */
    public function test_deck_description_can_be_null(): void
    {
        $deck = Deck::factory()->create(['description' => null]);

        $this->assertNull($deck->description);
    }

    /**
     * Test deck has unique identifier
     */
    public function test_deck_has_unique_identifier(): void
    {
        $deck1 = Deck::factory()->create();
        $deck2 = Deck::factory()->create();

        $this->assertNotEquals($deck1->id, $deck2->id);
    }

    /**
     * Test deck can be duplicated
     */
    public function test_deck_can_be_duplicated(): void
    {
        $originalDeck = Deck::factory()->create(['name' => 'Original']);
        Card::factory()->count(3)->for($originalDeck)->create();

        $user = User::factory()->create();

        $duplicatedDeck = $originalDeck->replicate();
        $duplicatedDeck->user_id = $user->id;
        $duplicatedDeck->name = $originalDeck->name . ' (Copy)';
        $duplicatedDeck->save();

        // Duplicate cards
        foreach ($originalDeck->cards as $card) {
            $newCard = $card->replicate();
            $newCard->deck_id = $duplicatedDeck->id;
            $newCard->save();
        }

        $this->assertEquals('Original (Copy)', $duplicatedDeck->name);
        $this->assertEquals($user->id, $duplicatedDeck->user_id);
        $this->assertEquals(3, $duplicatedDeck->cards()->count());
    }

    /**
     * Test deck mastery distribution
     */
    public function test_deck_mastery_distribution(): void
    {
        $deck = Deck::factory()->create();

        Card::factory()->count(2)->for($deck)->create(['mastery_level' => 0]);
        Card::factory()->count(3)->for($deck)->create(['mastery_level' => 3]);
        Card::factory()->count(1)->for($deck)->create(['mastery_level' => 5]);

        $distribution = $deck->cards()
            ->selectRaw('mastery_level, COUNT(*) as count')
            ->groupBy('mastery_level')
            ->get();

        $this->assertCount(3, $distribution);
    }
}
