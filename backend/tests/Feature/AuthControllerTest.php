<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can register with valid data
     */
    public function test_user_can_register_with_valid_data(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201);
        $this->assertJsonSuccess($response, 201);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => [
                    'id',
                    'name',
                    'email',
                    'created_at',
                    'updated_at',
                ],
                'token',
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);
    }

    /**
     * Test registration fails with missing required fields
     */
    public function test_registration_fails_with_missing_fields(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    /**
     * Test registration fails with invalid email
     */
    public function test_registration_fails_with_invalid_email(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registration fails with duplicate email
     */
    public function test_registration_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $userData = [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['email']);
    }

    /**
     * Test registration fails with weak password
     */
    public function test_registration_fails_with_weak_password(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => '12345',
            'password_confirmation' => '12345',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['password']);
    }

    /**
     * Test registration fails when passwords don't match
     */
    public function test_registration_fails_when_passwords_dont_match(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword123!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['password']);
    }

    /**
     * Test user can login with valid credentials
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200);
        $this->assertJsonSuccess($response);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => [
                    'id',
                    'name',
                    'email',
                    'created_at',
                    'updated_at',
                ],
                'token',
            ],
        ]);
    }

    /**
     * Test login fails with invalid credentials
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword123!',
        ]);

        $response->assertStatus(401);
        $this->assertJsonError($response, 401);
    }

    /**
     * Test login fails with non-existent user
     */
    public function test_login_fails_with_non_existent_user(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(401);
        $this->assertJsonError($response, 401);
    }

    /**
     * Test login fails with missing credentials
     */
    public function test_login_fails_with_missing_credentials(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422);
        $this->assertJsonError($response);
        $response->assertJsonValidationErrors(['email', 'password']);
    }

    /**
     * Test authenticated user can logout
     */
    public function test_authenticated_user_can_logout(): void
    {
        ['user' => $user, 'headers' => $headers] = $this->actingAsUserWithToken();

        $response = $this->withHeaders($headers)->postJson('/api/logout');

        $response->assertStatus(200);
        $this->assertJsonSuccess($response, 201);

        // Token should be revoked
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }

    /**
     * Test unauthenticated user cannot logout
     */
    public function test_unauthenticated_user_cannot_logout(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    /**
     * Test authenticated user can access protected routes
     */
    public function test_authenticated_user_can_access_protected_routes(): void
    {
        ['headers' => $headers] = $this->actingAsUserWithToken();

        $response = $this->withHeaders($headers)->getJson('/api/user');

        $response->assertStatus(200);
    }

    /**
     * Test token is valid after creation
     */
    public function test_token_is_valid_after_creation(): void
    {
        ['user' => $user, 'token' => $token, 'headers' => $headers] = $this->actingAsUserWithToken();

        $this->assertNotEmpty($token);
        $this->assertIsString($token);

        // Verify token works for authentication
        $response = $this->withHeaders($headers)->getJson('/api/user');
        $response->assertStatus(200);
        $response->assertJson([
            'id' => $user->id,
            'email' => $user->email,
        ]);
    }

    /**
     * Test user can have multiple active tokens
     */
    public function test_user_can_have_multiple_active_tokens(): void
    {
        $user = User::factory()->create();

        $token1 = $user->createToken('device-1')->plainTextToken;
        $token2 = $user->createToken('device-2')->plainTextToken;

        $this->assertNotEquals($token1, $token2);

        // Both tokens should work
        $response1 = $this->withHeader('Authorization', "Bearer {$token1}")->getJson('/api/user');
        $response1->assertStatus(200);

        $response2 = $this->withHeader('Authorization', "Bearer {$token2}")->getJson('/api/user');
        $response2->assertStatus(200);
    }

    /**
     * Test revoked token cannot access protected routes
     */
    public function test_revoked_token_cannot_access_protected_routes(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-device')->plainTextToken;

        // Revoke all tokens
        $user->tokens()->delete();

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/user');

        $response->assertStatus(401);
    }

    /**
     * Test login throttling after multiple failed attempts
     */
    public function test_login_throttling_after_failed_attempts(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        // Make multiple failed login attempts
        for ($i = 0; $i < 6; $i++) {
            $response = $this->postJson('/api/login', [
                'email' => 'test@example.com',
                'password' => 'WrongPassword',
            ]);
        }

        // Next attempt should be throttled
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(429); // Too Many Requests
    }
}

