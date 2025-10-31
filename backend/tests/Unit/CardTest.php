<?php

namespace Tests\Unit;

use App\Models\Card;
use App\Models\Deck;
use App\Models\StudySession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test card can be created with factory
     */
    public function test_card_can_be_created_with_factory(): void
    {
        $deck = Deck::factory()->create();
        $card = Card::factory()->for($deck)->create([
            'front' => 'Test Question',
            'back' => 'Test Answer',
        ]);

        $this->assertInstanceOf(Card::class, $card);
        $this->assertEquals('Test Question', $card->front);
        $this->assertEquals('Test Answer', $card->back);
        $this->assertDatabaseHas('cards', [
            'id' => $card->id,
            'front' => 'Test Question',
        ]);
    }

    /**
     * Test card belongs to deck
     */
    public function test_card_belongs_to_deck(): void
    {
        $deck = Deck::factory()->create();
        $card = Card::factory()->for($deck)->create();

        $this->assertInstanceOf(Deck::class, $card->deck);
        $this->assertEquals($deck->id, $card->deck->id);
    }

    /**
     * Test card has many study sessions
     */
    public function test_card_has_many_study_sessions(): void
    {
        $user = User::factory()->create();
        $deck = Deck::factory()->create();
        $card = Card::factory()->for($deck)->create();

        StudySession::factory()->count(3)->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
        ]);

        $this->assertCount(3, $card->studySessions);
        $this->assertInstanceOf(StudySession::class, $card->studySessions->first());
    }

    /**
     * Test card has default mastery level of 0
     */
    public function test_card_has_default_mastery_level_of_zero(): void
    {
        $deck = Deck::factory()->create();
        $card = Card::factory()->for($deck)->create();

        $this->assertEquals(0, $card->mastery_level);
    }

    /**
     * Test card mastery level can be updated
     */
    public function test_card_mastery_level_can_be_updated(): void
    {
        $card = Card::factory()->create(['mastery_level' => 0]);

        $card->mastery_level = 5;
        $card->save();

        $this->assertEquals(5, $card->fresh()->mastery_level);
    }

    /**
     * Test card has next review date
     */
    public function test_card_has_next_review_date(): void
    {
        $card = Card::factory()->create([
            'next_review_at' => now()->addDay(),
        ]);

        $this->assertNotNull($card->next_review_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $card->next_review_at);
    }

    /**
     * Test card next review date can be null
     */
    public function test_card_next_review_date_can_be_null(): void
    {
        $card = Card::factory()->create(['next_review_at' => null]);

        $this->assertNull($card->next_review_at);
    }

    /**
     * Test card has timestamps
     */
    public function test_card_has_timestamps(): void
    {
        $card = Card::factory()->create();

        $this->assertNotNull($card->created_at);
        $this->assertNotNull($card->updated_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $card->created_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $card->updated_at);
    }

    /**
     * Test card uses soft deletes
     */
    public function test_card_uses_soft_deletes(): void
    {
        $card = Card::factory()->create();
        $cardId = $card->id;

        $card->delete();

        $this->assertSoftDeleted('cards', ['id' => $cardId]);
        $this->assertNotNull($card->deleted_at);
    }

    /**
     * Test card fillable attributes
     */
    public function test_card_fillable_attributes(): void
    {
        $deck = Deck::factory()->create();
        $card = Card::factory()->for($deck)->make([
            'front' => 'Fillable Front',
            'back' => 'Fillable Back',
            'mastery_level' => 3,
        ]);

        $this->assertEquals('Fillable Front', $card->front);
        $this->assertEquals('Fillable Back', $card->back);
        $this->assertEquals(3, $card->mastery_level);
    }

    /**
     * Test card casts attributes correctly
     */
    public function test_card_casts_attributes_correctly(): void
    {
        $card = Card::factory()->create([
            'mastery_level' => '5',
            'next_review_at' => '2025-01-01 12:00:00',
        ]);

        $this->assertIsInt($card->mastery_level);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $card->next_review_at);
    }

    /**
     * Test card front content is required
     */
    public function test_card_front_content_is_required(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Card::factory()->create(['front' => null]);
    }

    /**
     * Test card back content is required
     */
    public function test_card_back_content_is_required(): void
    {
        $this->expectException(\Illuminate\Database\QueryException::class);

        Card::factory()->create(['back' => null]);
    }

    /**
     * Test card can have HTML content
     */
    public function test_card_can_have_html_content(): void
    {
        $card = Card::factory()->create([
            'front' => '<strong>Bold Question</strong>',
            'back' => '<em>Italic Answer</em>',
        ]);

        $this->assertEquals('<strong>Bold Question</strong>', $card->front);
        $this->assertEquals('<em>Italic Answer</em>', $card->back);
    }

    /**
     * Test card can be due for review
     */
    public function test_card_can_be_due_for_review(): void
    {
        $dueCard = Card::factory()->create([
            'next_review_at' => now()->subDay(),
        ]);

        $notDueCard = Card::factory()->create([
            'next_review_at' => now()->addDay(),
        ]);

        $this->assertTrue($dueCard->next_review_at->isPast());
        $this->assertTrue($notDueCard->next_review_at->isFuture());
    }

    /**
     * Test card scope for due cards
     */
    public function test_card_scope_for_due_cards(): void
    {
        $deck = Deck::factory()->create();

        Card::factory()->count(3)->for($deck)->create([
            'next_review_at' => now()->subDay(),
        ]);

        Card::factory()->count(2)->for($deck)->create([
            'next_review_at' => now()->addDay(),
        ]);

        $dueCards = Card::where('next_review_at', '<=', now())->get();

        $this->assertCount(3, $dueCards);
    }

    /**
     * Test card scope for specific mastery level
     */
    public function test_card_scope_for_specific_mastery_level(): void
    {
        $deck = Deck::factory()->create();

        Card::factory()->count(4)->for($deck)->create(['mastery_level' => 0]);
        Card::factory()->count(2)->for($deck)->create(['mastery_level' => 5]);

        $beginnerCards = Card::where('mastery_level', 0)->get();

        $this->assertCount(4, $beginnerCards);
    }

    /**
     * Test card belongs to user through deck
     */
    public function test_card_belongs_to_user_through_deck(): void
    {
        $user = User::factory()->create();
        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create();

        $this->assertEquals($user->id, $card->deck->user->id);
    }

    /**
     * Test card can calculate next review interval
     */
    public function test_card_can_calculate_next_review_interval(): void
    {
        $card = Card::factory()->create([
            'mastery_level' => 3,
            'next_review_at' => now(),
        ]);

        // Simulate spaced repetition algorithm
        $intervals = [1, 3, 7, 14, 30, 60, 90];
        $nextInterval = $intervals[$card->mastery_level] ?? 90;

        $expectedReviewDate = now()->addDays($nextInterval);
        $card->next_review_at = $expectedReviewDate;
        $card->save();

        $this->assertEquals(
            $expectedReviewDate->format('Y-m-d'),
            $card->next_review_at->format('Y-m-d')
        );
    }

    /**
     * Test card can track study history
     */
    public function test_card_can_track_study_history(): void
    {
        $user = User::factory()->create();
        $card = Card::factory()->create();

        StudySession::factory()->count(5)->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
        ]);

        $this->assertEquals(5, $card->studySessions()->count());
    }

    /**
     * Test card can calculate average quality score
     */
    public function test_card_can_calculate_average_quality_score(): void
    {
        $user = User::factory()->create();
        $card = Card::factory()->create();

        StudySession::factory()->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'quality' => 3,
        ]);

        StudySession::factory()->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'quality' => 5,
        ]);

        $averageQuality = $card->studySessions()->avg('quality');

        $this->assertEquals(4, $averageQuality);
    }

    /**
     * Test card can be replicated for duplication
     */
    public function test_card_can_be_replicated_for_duplication(): void
    {
        $originalCard = Card::factory()->create([
            'front' => 'Original Front',
            'back' => 'Original Back',
        ]);

        $newDeck = Deck::factory()->create();

        $duplicatedCard = $originalCard->replicate();
        $duplicatedCard->deck_id = $newDeck->id;
        $duplicatedCard->save();

        $this->assertEquals($originalCard->front, $duplicatedCard->front);
        $this->assertEquals($originalCard->back, $duplicatedCard->back);
        $this->assertNotEquals($originalCard->id, $duplicatedCard->id);
        $this->assertEquals($newDeck->id, $duplicatedCard->deck_id);
    }

    /**
     * Test card has unique identifier
     */
    public function test_card_has_unique_identifier(): void
    {
        $card1 = Card::factory()->create();
        $card2 = Card::factory()->create();

        $this->assertNotEquals($card1->id, $card2->id);
    }
}
