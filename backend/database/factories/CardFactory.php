<?php

namespace Database\Factories;

use App\Models\Deck;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Card>
 */
class CardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'deck_id' => Deck::factory(),
            'front' => fake()->sentence() . '?',
            'back' => fake()->paragraph(),
            'mastery_level' => 0,
            'next_review_at' => null,
        ];
    }

    /**
     * Indicate that the card is new (mastery level 0).
     */
    public function newCard(): static
    {
        return $this->state(fn (array $attributes) => [
            'mastery_level' => 0,
            'next_review_at' => null,
        ]);
    }

    /**
     * Indicate that the card has been studied (mastery level > 0).
     */
    public function studied(): static
    {
        return $this->state(fn (array $attributes) => [
            'mastery_level' => fake()->numberBetween(1, 5),
            'next_review_at' => fake()->dateTimeBetween('now', '+30 days'),
        ]);
    }

    /**
     * Indicate that the card is due for review.
     */
    public function dueForReview(): static
    {
        return $this->state(fn (array $attributes) => [
            'mastery_level' => fake()->numberBetween(1, 5),
            'next_review_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Indicate that the card has mastered status.
     */
    public function mastered(): static
    {
        return $this->state(fn (array $attributes) => [
            'mastery_level' => fake()->numberBetween(6, 10),
            'next_review_at' => fake()->dateTimeBetween('+30 days', '+90 days'),
        ]);
    }
}
