<?php

namespace Tests\Feature;

use App\Models\Card;
use App\Models\Deck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CardControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can list cards from their own deck
     */
    public function test_user_can_list_cards_from_their_own_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        Card::factory()->count(5)->for($deck)->create();

        $response = $this->withHeaders($headers)->getJson("/api/decks/{$deck->id}/cards");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonCount(5, 'data');
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => [
                    'id',
                    'front',
                    'back',
                    'mastery_level',
                    'next_review_at',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    /**
     * Test user cannot list cards from another user's private deck
     */
    public function test_user_cannot_list_cards_from_another_users_private_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $privateDeck = Deck::factory()->for($otherUser)->create(['is_public' => false]);
        Card::factory()->count(3)->for($privateDeck)->create();

        $response = $this->withHeaders($headers)->getJson("/api/decks/{$privateDeck->id}/cards");

        $response->assertStatus(403);
    }

    /**
     * Test user can view a specific card from their deck
     */
    public function test_user_can_view_specific_card_from_their_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create();

        $response = $this->withHeaders($headers)->getJson("/api/decks/{$deck->id}/cards/{$card->id}");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'front',
                'back',
                'mastery_level',
                'next_review_at',
                'created_at',
                'updated_at',
            ],
        ]);
    }

    /**
     * Test user can create a card in their own deck
     */
    public function test_user_can_create_card_in_their_own_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $cardData = [
            'front' => 'What is Laravel?',
            'back' => 'A PHP framework for web applications.',
        ];

        $response = $this->withHeaders($headers)->postJson("/api/decks/{$deck->id}/cards", $cardData);

        $response->assertStatus(201);
        $this->assertJsonSuccess($response);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'front',
                'back',
                'mastery_level',
                'created_at',
                'updated_at',
            ],
        ]);

        $this->assertDatabaseHas('cards', [
            'deck_id' => $deck->id,
            'front' => 'What is Laravel?',
            'back' => 'A PHP framework for web applications.',
            'mastery_level' => 0,
        ]);
    }

    /**
     * Test card creation fails with missing required fields
     */
    public function test_card_creation_fails_with_missing_fields(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $response = $this->withHeaders($headers)->postJson("/api/decks/{$deck->id}/cards", []);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['front', 'back']);
    }

    /**
     * Test card creation fails with empty front or back
     */
    public function test_card_creation_fails_with_empty_content(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $response = $this->withHeaders($headers)->postJson("/api/decks/{$deck->id}/cards", [
            'front' => '',
            'back' => '',
        ]);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['front', 'back']);
    }

    /**
     * Test user cannot create card in another user's deck
     */
    public function test_user_cannot_create_card_in_another_users_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $deck = Deck::factory()->for($otherUser)->create();

        $response = $this->withHeaders($headers)->postJson("/api/decks/{$deck->id}/cards", [
            'front' => 'Test Front',
            'back' => 'Test Back',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test user can update a card in their own deck
     */
    public function test_user_can_update_card_in_their_own_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create([
            'front' => 'Original Front',
            'back' => 'Original Back',
        ]);

        $updateData = [
            'front' => 'Updated Front',
            'back' => 'Updated Back',
        ];

        $response = $this->withHeaders($headers)
            ->putJson("/api/decks/{$deck->id}/cards/{$card->id}", $updateData);

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);

        $this->assertDatabaseHas('cards', [
            'id' => $card->id,
            'front' => 'Updated Front',
            'back' => 'Updated Back',
        ]);
    }

    /**
     * Test user cannot update card in another user's deck
     */
    public function test_user_cannot_update_card_in_another_users_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $deck = Deck::factory()->for($otherUser)->create();
        $card = Card::factory()->for($deck)->create();

        $response = $this->withHeaders($headers)
            ->putJson("/api/decks/{$deck->id}/cards/{$card->id}", [
                'front' => 'Hacked Front',
                'back' => 'Hacked Back',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test user can delete a card from their own deck
     */
    public function test_user_can_delete_card_from_their_own_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $card = Card::factory()->for($deck)->create();

        $response = $this->withHeaders($headers)
            ->deleteJson("/api/decks/{$deck->id}/cards/{$card->id}");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);

        $this->assertSoftDeleted('cards', [
            'id' => $card->id,
        ]);
    }

    /**
     * Test user cannot delete card from another user's deck
     */
    public function test_user_cannot_delete_card_from_another_users_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $deck = Deck::factory()->for($otherUser)->create();
        $card = Card::factory()->for($deck)->create();

        $response = $this->withHeaders($headers)
            ->deleteJson("/api/decks/{$deck->id}/cards/{$card->id}");

        $response->assertStatus(403);
    }

    /**
     * Test user can bulk create cards
     */
    public function test_user_can_bulk_create_cards(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $cardsData = [
            'cards' => [
                ['front' => 'Question 1', 'back' => 'Answer 1'],
                ['front' => 'Question 2', 'back' => 'Answer 2'],
                ['front' => 'Question 3', 'back' => 'Answer 3'],
            ],
        ];

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/cards/bulk", $cardsData);

        $response->assertStatus(201);
        $this->assertJsonSuccess($response);

        $this->assertDatabaseHas('cards', [
            'deck_id' => $deck->id,
            'front' => 'Question 1',
            'back' => 'Answer 1',
        ]);

        $this->assertDatabaseHas('cards', [
            'deck_id' => $deck->id,
            'front' => 'Question 2',
            'back' => 'Answer 2',
        ]);

        $this->assertDatabaseHas('cards', [
            'deck_id' => $deck->id,
            'front' => 'Question 3',
            'back' => 'Answer 3',
        ]);
    }

    /**
     * Test bulk create fails with invalid card data
     */
    public function test_bulk_create_fails_with_invalid_card_data(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $cardsData = [
            'cards' => [
                ['front' => 'Question 1', 'back' => 'Answer 1'],
                ['front' => '', 'back' => ''], // Invalid
                ['front' => 'Question 3', 'back' => 'Answer 3'],
            ],
        ];

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/cards/bulk", $cardsData);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['cards.1.front', 'cards.1.back']);
    }

    /**
     * Test bulk create fails with empty cards array
     */
    public function test_bulk_create_fails_with_empty_cards_array(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/cards/bulk", ['cards' => []]);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['cards']);
    }

    /**
     * Test cards are paginated correctly
     */
    public function test_cards_are_paginated_correctly(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        Card::factory()->count(25)->for($deck)->create();

        $response = $this->withHeaders($headers)->getJson("/api/decks/{$deck->id}/cards?per_page=10");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonCount(10, 'data');
        $response->assertJsonStructure([
            'success',
            'message',
            'data',
            'meta' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
            ],
        ]);
    }

    /**
     * Test cards can be filtered by mastery level
     */
    public function test_cards_can_be_filtered_by_mastery_level(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        Card::factory()->count(3)->for($deck)->create(['mastery_level' => 0]);
        Card::factory()->count(2)->for($deck)->create(['mastery_level' => 5]);

        $response = $this->withHeaders($headers)
            ->getJson("/api/decks/{$deck->id}/cards?mastery_level=0");

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    /**
     * Test cards due for review can be filtered
     */
    public function test_cards_due_for_review_can_be_filtered(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        Card::factory()->count(3)->for($deck)->create([
            'next_review_at' => now()->subDay(),
        ]);
        Card::factory()->count(2)->for($deck)->create([
            'next_review_at' => now()->addDay(),
        ]);

        $response = $this->withHeaders($headers)
            ->getJson("/api/decks/{$deck->id}/cards?due_for_review=true");

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    /**
     * Test card front and back support HTML content
     */
    public function test_card_supports_html_content(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $cardData = [
            'front' => '<strong>Bold Question</strong>',
            'back' => '<em>Italic Answer</em>',
        ];

        $response = $this->withHeaders($headers)
            ->postJson("/api/decks/{$deck->id}/cards", $cardData);

        $response->assertStatus(201);
        $this->assertJsonSuccess($response);

        $this->assertDatabaseHas('cards', [
            'deck_id' => $deck->id,
            'front' => '<strong>Bold Question</strong>',
            'back' => '<em>Italic Answer</em>',
        ]);
    }

    /**
     * Test unauthenticated user cannot access card endpoints
     */
    public function test_unauthenticated_user_cannot_access_card_endpoints(): void
    {
        $deck = Deck::factory()->create();
        $card = Card::factory()->for($deck)->create();

        $response = $this->getJson("/api/decks/{$deck->id}/cards");
        $response->assertStatus(401);

        $response = $this->getJson("/api/decks/{$deck->id}/cards/{$card->id}");
        $response->assertStatus(401);

        $response = $this->postJson("/api/decks/{$deck->id}/cards", [
            'front' => 'Test',
            'back' => 'Test',
        ]);
        $response->assertStatus(401);

        $response = $this->putJson("/api/decks/{$deck->id}/cards/{$card->id}", [
            'front' => 'Test',
            'back' => 'Test',
        ]);
        $response->assertStatus(401);

        $response = $this->deleteJson("/api/decks/{$deck->id}/cards/{$card->id}");
        $response->assertStatus(401);
    }
}
