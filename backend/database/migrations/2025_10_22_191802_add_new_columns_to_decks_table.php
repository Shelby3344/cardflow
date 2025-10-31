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
        Schema::table('decks', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('user_id')->constrained('decks')->onDelete('cascade');
            $table->string('icon', 10)->nullable()->after('description');
            $table->string('color', 100)->nullable()->after('icon');
            $table->string('image_url')->nullable()->after('color');
            $table->integer('order')->default(0)->after('is_public');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('decks', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'icon', 'color', 'image_url', 'order']);
            $table->dropSoftDeletes();
        });
    }
};
