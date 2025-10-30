<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Indicates whether the default seeder should run before each test.
     */
    protected bool $seed = false;

    /**
     * Create a user and authenticate for testing.
     */
    protected function actingAsUser(array $attributes = []): \App\Models\User
    {
        $user = \App\Models\User::factory()->create($attributes);
        $this->actingAs($user);

        return $user;
    }

    /**
     * Create authenticated user with token for API testing.
     */
    protected function actingAsUserWithToken(array $attributes = []): array
    {
        $user = \App\Models\User::factory()->create($attributes);
        $token = $user->createToken('test-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'headers' => [
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ],
        ];
    }

    /**
     * Assert JSON response has success structure.
     */
    protected function assertJsonSuccess($response, int $expectedStatus = 200, string $dataKey = 'data'): void
    {
        $response->assertStatus($expectedStatus)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['success', $dataKey]);
    }

    /**
     * Assert JSON response has error structure.
     */
    protected function assertJsonError($response, int $status = 422): void
    {
        $response->assertStatus($status)
            ->assertJson(['success' => false]);
    }
}
