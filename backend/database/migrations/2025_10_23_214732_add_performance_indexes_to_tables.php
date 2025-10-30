<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Índices para study_sessions
        Schema::table('study_sessions', function (Blueprint $table) {
            // Já existe: user_id, deck_id (composto)
            // Já existe: user_id, created_at (composto)
            // Já existe: deck_id, card_id (composto)

            // Adicionar índice para query de streak (data de criação)
            $table->index('created_at', 'idx_study_sessions_created_at');
        });

        // Índices para decks
        Schema::table('decks', function (Blueprint $table) {
            // Índice composto para user_id + parent_id (queries de main decks)
            if (! Schema::hasIndex('decks', 'idx_decks_user_parent')) {
                $table->index(['user_id', 'parent_id'], 'idx_decks_user_parent');
            }

            // Índice para is_public (queries de decks públicos)
            $table->index('is_public', 'idx_decks_is_public');
        });

        // Índices para cards
        Schema::table('cards', function (Blueprint $table) {
            // Índice para deck_id (já deve existir pela foreign key, mas garantir)
            if (! Schema::hasIndex('cards', 'idx_cards_deck_id')) {
                $table->index('deck_id', 'idx_cards_deck_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('study_sessions', function (Blueprint $table) {
            $table->dropIndex('idx_study_sessions_created_at');
        });

        Schema::table('decks', function (Blueprint $table) {
            $table->dropIndex('idx_decks_user_parent');
            $table->dropIndex('idx_decks_is_public');
        });

        Schema::table('cards', function (Blueprint $table) {
            if (Schema::hasIndex('cards', 'idx_cards_deck_id')) {
                $table->dropIndex('idx_cards_deck_id');
            }
        });
    }
};
