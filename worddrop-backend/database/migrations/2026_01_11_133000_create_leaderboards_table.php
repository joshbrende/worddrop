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
        Schema::create('leaderboards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->integer('high_score')->default(0);
            $table->integer('total_games')->default(0);
            $table->integer('total_words_found')->default(0);
            $table->integer('total_word_of_day_found')->default(0);
            $table->integer('total_sponsor_trivia_found')->default(0);
            $table->decimal('average_score', 10, 2)->default(0);
            $table->timestamps();
            
            $table->index('high_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaderboards');
    }
};
