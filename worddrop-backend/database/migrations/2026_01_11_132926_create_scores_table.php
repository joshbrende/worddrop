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
        Schema::create('scores', function (Blueprint $table) {
            $table->id();
            $table->uuid('game_session_id');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('word');
            $table->integer('points');
            $table->integer('combo_count')->default(1);
            $table->integer('level');
            $table->enum('word_type', ['normal', 'word_of_day', 'sponsor_trivia'])->default('normal');
            $table->foreignId('word_id')->nullable()->constrained('words')->nullOnDelete();
            $table->foreignId('question_id')->nullable()->constrained('questions')->nullOnDelete();
            $table->timestamp('created_at');
            
            $table->foreign('game_session_id')->references('id')->on('game_sessions')->cascadeOnDelete();
            $table->index(['game_session_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('word_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scores');
    }
};
