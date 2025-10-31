<?php

namespace Tests\Feature;

use App\Models\Card;
use App\Models\Deck;
use App\Models\StudySession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudySessionControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can store a study session response
     */
    public function test_user_can_store_study_session_response(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create(['mastery_level' => 0]);

        $responseData = [
            'card_id' => $card->id,
            'quality' => 4, // Good response
        ];

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/study", $responseData);

        $response->assertStatus(201);
        $this->assertJsonSuccess($response);

        $this->assertDatabaseHas('study_sessions', [
            'user_id' => $user->id,
            'card_id' => $card->id,
            'quality' => 4,
        ]);

        // Verify card mastery level was updated
        $card->refresh();
        $this->assertGreaterThan(0, $card->mastery_level);
        $this->assertNotNull($card->next_review_at);
    }

    /**
     * Test study session fails with invalid quality value
     */
    public function test_study_session_fails_with_invalid_quality(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create();

        $responseData = [
            'card_id' => $card->id,
            'quality' => 6, // Invalid: should be 0-5
        ];

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/study", $responseData);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['quality']);
    }

    /**
     * Test study session fails with missing card_id
     */
    public function test_study_session_fails_with_missing_card_id(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/study", ['quality' => 4]);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['card_id']);
    }

    /**
     * Test user cannot study card from another user's private deck
     */
    public function test_user_cannot_study_card_from_another_users_private_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $privateDeck = Deck::factory()->for($otherUser)->create(['is_public' => false]);
        $card = Card::factory()->for($privateDeck)->create();

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$privateDeck->id}/study", [
                'card_id' => $card->id,
                'quality' => 4,
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test mastery level increases with correct responses
     */
    public function test_mastery_level_increases_with_correct_responses(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create(['mastery_level' => 0]);

        $initialMastery = $card->mastery_level;

        $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/study", [
                'card_id' => $card->id,
                'quality' => 5, // Perfect response
            ]);

        $card->refresh();
        $this->assertGreaterThan($initialMastery, $card->mastery_level);
    }

    /**
     * Test mastery level decreases with incorrect responses
     */
    public function test_mastery_level_decreases_with_incorrect_responses(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create(['mastery_level' => 3]);

        $initialMastery = $card->mastery_level;

        $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/study", [
                'card_id' => $card->id,
                'quality' => 0, // Complete blackout
            ]);

        $card->refresh();
        $this->assertLessThan($initialMastery, $card->mastery_level);
    }

    /**
     * Test next review date is calculated based on mastery level
     */
    public function test_next_review_date_is_calculated_based_on_mastery(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create([
            'mastery_level' => 0,
            'next_review_at' => null,
        ]);

        $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/study", [
                'card_id' => $card->id,
                'quality' => 4,
            ]);

        $card->refresh();
        $this->assertNotNull($card->next_review_at);
        $this->assertTrue($card->next_review_at->isFuture());
    }

    /**
     * Test user can view study statistics for a deck
     */
    public function test_user_can_view_study_statistics_for_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $cards = Card::factory()->count(5)->for($deck)->create();

        // Create some study sessions
        foreach ($cards as $card) {
            StudySession::factory()->create([
                'user_id' => $user->id,
                'card_id' => $card->id,
                'quality' => fake()->numberBetween(0, 5),
            ]);
        }

        $response = $this->withHeaders($headers)
            ->getJson("/api/decks/{$deck->id}/statistics");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'total_cards',
                'cards_studied',
                'average_quality',
                'mastery_distribution',
                'cards_due_for_review',
            ],
        ]);
    }

    /**
     * Test user can view their study history
     */
    public function test_user_can_view_study_history(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create();

        StudySession::factory()->count(3)->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
        ]);

        $response = $this->withHeaders($headers)
            ->getJson("/api/study-sessions?deck_id={$deck->id}");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => [
                    'id',
                    'card_id',
                    'quality',
                    'created_at',
                ],
            ],
        ]);
    }

    /**
     * Test study history is paginated
     */
    public function test_study_history_is_paginated(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create();

        StudySession::factory()->count(25)->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
        ]);

        $response = $this->withHeaders($headers)
            ->getJson("/api/study-sessions?per_page=10");

        $response->assertStatus(200);
        $response->assertJsonCount(10, 'data');
        $response->assertJsonStructure([
            'meta' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
            ],
        ]);
    }

    /**
     * Test user can filter study history by date range
     */
    public function test_user_can_filter_study_history_by_date_range(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create();

        // Create sessions with different dates
        StudySession::factory()->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'created_at' => now()->subDays(10),
        ]);

        StudySession::factory()->count(2)->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
            'created_at' => now()->subDays(2),
        ]);

        $from = now()->subDays(3)->toDateString();
        $to = now()->toDateString();

        $response = $this->withHeaders($headers)
            ->getJson("/api/study-sessions?from={$from}&to={$to}");

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }

    /**
     * Test multiple users can study the same public deck independently
     */
    public function test_multiple_users_can_study_same_public_deck_independently(): void
    {
        $owner = User::factory()->create();
        $publicDeck = Deck::factory()->for($owner)->create(['is_public' => true]);
        $card = Card::factory()->for($publicDeck)->create(['mastery_level' => 0]);

        // User 1 studies the card
        ['user' => $user1, 'headers' => $headers1] = $this->actingAsUserWithToken();
        $this->withHeaders($headers1)
            ->postJson("/api/decks/{$publicDeck->id}/study", [
                'card_id' => $card->id,
                'quality' => 5,
            ]);

        // User 2 studies the same card
        ['user' => $user2, 'headers' => $headers2] = $this->actingAsUserWithToken();
        $this->withHeaders($headers2)
            ->postJson("/api/decks/{$publicDeck->id}/study", [
                'card_id' => $card->id,
                'quality' => 2,
            ]);

        // Verify both users have separate study sessions
        $this->assertDatabaseHas('study_sessions', [
            'user_id' => $user1->id,
            'card_id' => $card->id,
            'quality' => 5,
        ]);

        $this->assertDatabaseHas('study_sessions', [
            'user_id' => $user2->id,
            'card_id' => $card->id,
            'quality' => 2,
        ]);
    }

    /**
     * Test study session tracks response time
     */
    public function test_study_session_tracks_response_time(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create();

        $responseData = [
            'card_id' => $card->id,
            'quality' => 4,
            'response_time_ms' => 3500,
        ];

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/study", $responseData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('study_sessions', [
            'user_id' => $user->id,
            'card_id' => $card->id,
            'response_time_ms' => 3500,
        ]);
    }

    /**
     * Test unauthenticated user cannot access study endpoints
     */
    public function test_unauthenticated_user_cannot_access_study_endpoints(): void
    {
        $deck = Deck::factory()->create();
        $card = Card::factory()->for($deck)->create();

        $response = $this->postJson("/api/decks/{$deck->id}/study", [
            'card_id' => $card->id,
            'quality' => 4,
        ]);
        $response->assertStatus(401);

        $response = $this->getJson("/api/decks/{$deck->id}/statistics");
        $response->assertStatus(401);

        $response = $this->getJson('/api/study-sessions');
        $response->assertStatus(401);
    }
}
