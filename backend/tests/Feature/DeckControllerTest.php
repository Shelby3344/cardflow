<?php

namespace Tests\Feature;

use App\Models\Card;
use App\Models\Deck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class DeckControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can list their own decks
     */
    public function test_user_can_list_their_own_decks(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $decks = Deck::factory()->count(3)->for($user)->create();

        $response = $this->withHeaders($headers)->getJson('/api/decks');

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonCount(3, 'data');
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'description',
                    'is_public',
                    'cards_count',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    /**
     * Test user cannot see other users' private decks
     */
    public function test_user_cannot_see_other_users_private_decks(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $privateDeck = Deck::factory()->for($otherUser)->create(['is_public' => false]);

        $response = $this->withHeaders($headers)->getJson('/api/decks');

        $response->assertStatus(200);
        $response->assertJsonMissing(['id' => $privateDeck->id]);
    }

    /**
     * Test user can view a specific deck they own
     */
    public function test_user_can_view_specific_deck_they_own(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        Card::factory()->count(5)->for($deck)->create();

        $response = $this->withHeaders($headers)->getJson("/api/decks/{$deck->id}");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'name',
                'description',
                'is_public',
                'cards_count',
                'cards' => [
                    '*' => [
                        'id',
                        'front',
                        'back',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'created_at',
                'updated_at',
            ],
        ]);
    }

    /**
     * Test user cannot view another user's private deck
     */
    public function test_user_cannot_view_another_users_private_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $privateDeck = Deck::factory()->for($otherUser)->create(['is_public' => false]);

        $response = $this->withHeaders($headers)->getJson("/api/decks/{$privateDeck->id}");

        $response->assertStatus(403);
    }

    /**
     * Test user can view another user's public deck
     */
    public function test_user_can_view_another_users_public_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $publicDeck = Deck::factory()->for($otherUser)->create(['is_public' => true]);

        $response = $this->withHeaders($headers)->getJson("/api/decks/{$publicDeck->id}");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
    }

    /**
     * Test user can create a deck with valid data
     */
    public function test_user_can_create_deck_with_valid_data(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deckData = [
            'name' => 'Test Deck',
            'description' => 'Test Description',
            'is_public' => true,
        ];

        $response = $this->withHeaders($headers)->postJson('/api/decks', $deckData);

        $response->assertStatus(201);
        $this->assertJsonSuccess($response);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id',
                'name',
                'description',
                'is_public',
                'cards_count',
                'created_at',
                'updated_at',
            ],
        ]);

        $this->assertDatabaseHas('decks', [
            'user_id' => $user->id,
            'name' => 'Test Deck',
            'description' => 'Test Description',
            'is_public' => true,
        ]);
    }

    /**
     * Test deck creation fails with missing required fields
     */
    public function test_deck_creation_fails_with_missing_fields(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $response = $this->withHeaders($headers)->postJson('/api/decks', []);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['name']);
    }

    /**
     * Test deck creation fails with name too long
     */
    public function test_deck_creation_fails_with_name_too_long(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $deckData = [
            'name' => str_repeat('a', 256), // 256 characters
            'description' => 'Test Description',
        ];

        $response = $this->withHeaders($headers)->postJson('/api/decks', $deckData);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['name']);
    }

    /**
     * Test user can update their own deck
     */
    public function test_user_can_update_their_own_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create([
            'name' => 'Original Name',
            'is_public' => false,
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'description' => 'Updated Description',
            'is_public' => true,
        ];

        $response = $this->withHeaders($headers)->putJson("/api/decks/{$deck->id}", $updateData);

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);

        $this->assertDatabaseHas('decks', [
            'id' => $deck->id,
            'name' => 'Updated Name',
            'description' => 'Updated Description',
            'is_public' => true,
        ]);
    }

    /**
     * Test user cannot update another user's deck
     */
    public function test_user_cannot_update_another_users_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $deck = Deck::factory()->for($otherUser)->create();

        $response = $this->withHeaders($headers)->putJson("/api/decks/{$deck->id}", [
            'name' => 'Hacked Name',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test user can delete their own deck
     */
    public function test_user_can_delete_their_own_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();

        $response = $this->withHeaders($headers)->deleteJson("/api/decks/{$deck->id}");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);

        $this->assertSoftDeleted('decks', [
            'id' => $deck->id,
        ]);
    }

    /**
     * Test user cannot delete another user's deck
     */
    public function test_user_cannot_delete_another_users_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $deck = Deck::factory()->for($otherUser)->create();

        $response = $this->withHeaders($headers)->deleteJson("/api/decks/{$deck->id}");

        $response->assertStatus(403);
    }

    /**
     * Test deleting a deck also deletes associated cards
     */
    public function test_deleting_deck_deletes_associated_cards(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        $cards = Card::factory()->count(3)->for($deck)->create();

        $response = $this->withHeaders($headers)->deleteJson("/api/decks/{$deck->id}");

        $response->assertStatus(200);

        foreach ($cards as $card) {
            $this->assertSoftDeleted('cards', ['id' => $card->id]);
        }
    }

    /**
     * Test user can duplicate their own deck
     */
    public function test_user_can_duplicate_their_own_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create(['name' => 'Original Deck']);
        Card::factory()->count(3)->for($deck)->create();

        $response = $this->withHeaders($headers)->postJson("/api/decks/{$deck->id}/duplicate");

        $response->assertStatus(201);
        $this->assertJsonSuccess($response);

        $this->assertDatabaseHas('decks', [
            'user_id' => $user->id,
            'name' => 'Original Deck (Copy)',
        ]);

        // Verify cards were duplicated
        $duplicatedDeck = Deck::where('name', 'Original Deck (Copy)')->first();
        $this->assertEquals(3, $duplicatedDeck->cards()->count());
    }

    /**
     * Test user can duplicate another user's public deck
     */
    public function test_user_can_duplicate_another_users_public_deck(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $publicDeck = Deck::factory()->for($otherUser)->create([
            'name' => 'Public Deck',
            'is_public' => true,
        ]);
        Card::factory()->count(2)->for($publicDeck)->create();

        $response = $this->withHeaders($headers)->postJson("/api/decks/{$publicDeck->id}/duplicate");

        $response->assertStatus(201);
        $this->assertJsonSuccess($response);

        $this->assertDatabaseHas('decks', [
            'user_id' => $user->id,
            'name' => 'Public Deck (Copy)',
        ]);
    }

    /**
     * Test user cannot duplicate another user's private deck
     */
    public function test_user_cannot_duplicate_another_users_private_deck(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $otherUser = User::factory()->create();
        $privateDeck = Deck::factory()->for($otherUser)->create(['is_public' => false]);

        $response = $this->withHeaders($headers)->postJson("/api/decks/{$privateDeck->id}/duplicate");

        $response->assertStatus(403);
    }

    /**
     * Test deck statistics are calculated correctly
     */
    public function test_deck_statistics_are_calculated_correctly(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create();
        Card::factory()->count(10)->for($deck)->create();

        $response = $this->withHeaders($headers)->getJson("/api/decks/{$deck->id}/statistics");

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'total_cards',
                'mastery_distribution',
                'average_mastery',
                'cards_due_for_review',
            ],
        ]);
    }

    /**
     * Test deck cache is invalidated on update
     */
    public function test_deck_cache_is_invalidated_on_update(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $deck = Deck::factory()->for($user)->create(['name' => 'Original']);

        // Cache the deck
        $cacheKey = "deck:{$deck->id}";
        Cache::put($cacheKey, $deck, 3600);
        $this->assertTrue(Cache::has($cacheKey));

        // Update the deck
        $response = $this->withHeaders($headers)->putJson("/api/decks/{$deck->id}", [
            'name' => 'Updated',
        ]);

        $response->assertStatus(200);

        // Cache should be invalidated
        $this->assertFalse(Cache::has($cacheKey));
    }

    /**
     * Test unauthenticated user cannot access deck endpoints
     */
    public function test_unauthenticated_user_cannot_access_deck_endpoints(): void
    {
        $deck = Deck::factory()->create();

        $response = $this->getJson('/api/decks');
        $response->assertStatus(401);

        $response = $this->getJson("/api/decks/{$deck->id}");
        $response->assertStatus(401);

        $response = $this->postJson('/api/decks', ['name' => 'Test']);
        $response->assertStatus(401);

        $response = $this->putJson("/api/decks/{$deck->id}", ['name' => 'Test']);
        $response->assertStatus(401);

        $response = $this->deleteJson("/api/decks/{$deck->id}");
        $response->assertStatus(401);
    }
}
