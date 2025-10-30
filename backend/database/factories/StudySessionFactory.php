<?php

namespace Database\Factories;

use App\Models\Card;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudySession>
 */
class StudySessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'card_id' => Card::factory(),
            'quality' => fake()->numberBetween(0, 5),
            'response_time_ms' => fake()->numberBetween(1000, 10000),
        ];
    }

    /**
     * Indicate that the response was perfect.
     */
    public function perfect(): static
    {
        return $this->state(fn (array $attributes) => [
            'quality' => 5,
        ]);
    }

    /**
     * Indicate that the response was good.
     */
    public function good(): static
    {
        return $this->state(fn (array $attributes) => [
            'quality' => 4,
        ]);
    }

    /**
     * Indicate that the response was hesitant.
     */
    public function hesitant(): static
    {
        return $this->state(fn (array $attributes) => [
            'quality' => 3,
        ]);
    }

    /**
     * Indicate that the response was difficult.
     */
    public function difficult(): static
    {
        return $this->state(fn (array $attributes) => [
            'quality' => 2,
        ]);
    }

    /**
     * Indicate that the response was wrong.
     */
    public function wrong(): static
    {
        return $this->state(fn (array $attributes) => [
            'quality' => fake()->numberBetween(0, 1),
        ]);
    }

    /**
     * Indicate a fast response time.
     */
    public function fast(): static
    {
        return $this->state(fn (array $attributes) => [
            'response_time_ms' => fake()->numberBetween(500, 2000),
        ]);
    }

    /**
     * Indicate a slow response time.
     */
    public function slow(): static
    {
        return $this->state(fn (array $attributes) => [
            'response_time_ms' => fake()->numberBetween(10000, 30000),
        ]);
    }
}
