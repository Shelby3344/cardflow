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
        // Indexes para melhorar performance de queries
        // Nota: alguns indexes já podem existir, ignorar duplicatas

        try {
            Schema::table('cards', function (Blueprint $table) {
                $table->index('deck_id');
            });
        } catch (\Exception $e) {
            // Index já existe
        }

        try {
            Schema::table('study_sessions', function (Blueprint $table) {
                $table->index('card_id');
                $table->index('user_id');
            });
        } catch (\Exception $e) {
            // Index já existe
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::table('cards', function (Blueprint $table) {
                $table->dropIndex(['deck_id']);
            });
        } catch (\Exception $e) {
            //
        }

        try {
            Schema::table('study_sessions', function (Blueprint $table) {
                $table->dropIndex(['card_id']);
                $table->dropIndex(['user_id']);
            });
        } catch (\Exception $e) {
            //
        }
    }
};
