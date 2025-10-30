<?php

namespace Tests\Unit;

use App\Models\Deck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can be created with factory
     */
    public function test_user_can_be_created_with_factory(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Test User', $user->name);
        $this->assertEquals('test@example.com', $user->email);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'test@example.com',
        ]);
    }

    /**
     * Test user has decks relationship
     */
    public function test_user_has_decks_relationship(): void
    {
        $user = User::factory()->create();
        $decks = Deck::factory()->count(3)->for($user)->create();

        $this->assertCount(3, $user->decks);
        $this->assertInstanceOf(Deck::class, $user->decks->first());
    }

    /**
     * Test user can have multiple decks
     */
    public function test_user_can_have_multiple_decks(): void
    {
        $user = User::factory()->create();

        $deck1 = Deck::factory()->for($user)->create(['name' => 'Deck 1']);
        $deck2 = Deck::factory()->for($user)->create(['name' => 'Deck 2']);
        $deck3 = Deck::factory()->for($user)->create(['name' => 'Deck 3']);

        $user->refresh();

        $this->assertEquals(3, $user->decks()->count());
        $this->assertTrue($user->decks->contains($deck1));
        $this->assertTrue($user->decks->contains($deck2));
        $this->assertTrue($user->decks->contains($deck3));
    }

    /**
     * Test deleting user soft deletes their decks
     */
    public function test_deleting_user_soft_deletes_their_decks(): void
    {
        $user = User::factory()->create();
        $deck = Deck::factory()->for($user)->create();

        $user->delete();

        $this->assertSoftDeleted('users', ['id' => $user->id]);
        $this->assertSoftDeleted('decks', ['id' => $deck->id]);
    }

    /**
     * Test user password is hashed
     */
    public function test_user_password_is_hashed(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $this->assertNotEquals('password123', $user->password);
        $this->assertTrue(\Hash::check('password123', $user->password));
    }

    /**
     * Test user has email verified at timestamp
     */
    public function test_user_has_email_verified_at_timestamp(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->assertNotNull($user->email_verified_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->email_verified_at);
    }

    /**
     * Test user can be unverified
     */
    public function test_user_can_be_unverified(): void
    {
        $user = User::factory()->unverified()->create();

        $this->assertNull($user->email_verified_at);
    }

    /**
     * Test user has remember token
     */
    public function test_user_has_remember_token(): void
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->remember_token);
    }

    /**
     * Test user has timestamps
     */
    public function test_user_has_timestamps(): void
    {
        $user = User::factory()->create();

        $this->assertNotNull($user->created_at);
        $this->assertNotNull($user->updated_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->created_at);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->updated_at);
    }

    /**
     * Test user email must be unique
     */
    public function test_user_email_must_be_unique(): void
    {
        User::factory()->create(['email' => 'duplicate@example.com']);

        $this->expectException(\Illuminate\Database\UniqueConstraintViolationException::class);

        User::factory()->create(['email' => 'duplicate@example.com']);
    }

    /**
     * Test user can create API tokens
     */
    public function test_user_can_create_api_tokens(): void
    {
        $user = User::factory()->create();

        $token = $user->createToken('test-device');

        $this->assertNotNull($token);
        $this->assertNotNull($token->plainTextToken);
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
            'name' => 'test-device',
        ]);
    }

    /**
     * Test user can have multiple API tokens
     */
    public function test_user_can_have_multiple_api_tokens(): void
    {
        $user = User::factory()->create();

        $token1 = $user->createToken('device-1');
        $token2 = $user->createToken('device-2');

        $this->assertEquals(2, $user->tokens()->count());
        $this->assertNotEquals($token1->plainTextToken, $token2->plainTextToken);
    }

    /**
     * Test user can revoke all tokens
     */
    public function test_user_can_revoke_all_tokens(): void
    {
        $user = User::factory()->create();

        $user->createToken('device-1');
        $user->createToken('device-2');

        $this->assertEquals(2, $user->tokens()->count());

        $user->tokens()->delete();

        $this->assertEquals(0, $user->tokens()->count());
    }

    /**
     * Test user fillable attributes
     */
    public function test_user_fillable_attributes(): void
    {
        $user = User::factory()->make([
            'name' => 'Fillable Test',
            'email' => 'fillable@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->assertEquals('Fillable Test', $user->name);
        $this->assertEquals('fillable@example.com', $user->email);
        $this->assertNotNull($user->password);
    }

    /**
     * Test user hidden attributes
     */
    public function test_user_hidden_attributes(): void
    {
        $user = User::factory()->create();

        $array = $user->toArray();

        $this->assertArrayNotHasKey('password', $array);
        $this->assertArrayNotHasKey('remember_token', $array);
    }

    /**
     * Test user casts attributes correctly
     */
    public function test_user_casts_attributes_correctly(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => '2025-01-01 12:00:00',
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->email_verified_at);
    }

    /**
     * Test user has study sessions relationship
     */
    public function test_user_has_study_sessions_relationship(): void
    {
        $user = User::factory()->create();
        $deck = Deck::factory()->for($user)->create();
        $card = \App\Models\Card::factory()->for($deck)->create();

        \App\Models\StudySession::factory()->count(3)->create([
            'user_id' => $user->id,
            'card_id' => $card->id,
        ]);

        $this->assertCount(3, $user->studySessions);
        $this->assertInstanceOf(\App\Models\StudySession::class, $user->studySessions->first());
    }
}
