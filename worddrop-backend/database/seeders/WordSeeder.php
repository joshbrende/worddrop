<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $words = [
            ['word' => 'TETRIS', 'question' => 'The famous block-stacking puzzle game', 'category' => 'Gaming'],
            ['word' => 'GALAXY', 'question' => 'A large system of stars, gas, and dust', 'category' => 'Space'],
            ['word' => 'ROBOT', 'question' => 'A machine capable of carrying out complex actions automatically', 'category' => 'Tech'],
            ['word' => 'OCEAN', 'question' => 'A vast body of salt water', 'category' => 'Nature'],
            ['word' => 'PIZZA', 'question' => 'A dish of Italian origin consisting of a flattened disk of bread dough', 'category' => 'Food'],
            ['word' => 'SUMMER', 'question' => 'The warmest season of the year', 'category' => 'Seasons'],
            ['word' => 'GUITAR', 'question' => 'A stringed musical instrument', 'category' => 'Music'],
            ['word' => 'JUNGLE', 'question' => 'Land covered with dense forest and tangled vegetation', 'category' => 'Nature'],
            ['word' => 'ROCKET', 'question' => 'A cylindrical projectile that can be propelled to a great height', 'category' => 'Tech'],
            ['word' => 'CASTLE', 'question' => 'A large building fortified against attack', 'category' => 'History'],
            ['word' => 'DRAGON', 'question' => 'A mythical monster like a giant reptile', 'category' => 'Fantasy'],
            ['word' => 'PUZZLE', 'question' => 'A game, toy, or problem designed to test ingenuity', 'category' => 'Gaming'],
            ['word' => 'PLANET', 'question' => 'A celestial body moving in an elliptical orbit around a star', 'category' => 'Space'],
            ['word' => 'MEMORY', 'question' => 'The faculty by which the mind stores and remembers information', 'category' => 'Human'],
            ['word' => 'ENERGY', 'question' => 'Power derived from the utilization of physical or chemical resources', 'category' => 'Science'],
            ['word' => 'CAMERA', 'question' => 'A device for recording visual images', 'category' => 'Tech'],
            ['word' => 'FOREST', 'question' => 'A large area covered chiefly with trees and undergrowth', 'category' => 'Nature'],
            ['word' => 'ISLAND', 'question' => 'A piece of land surrounded by water', 'category' => 'Nature'],
            ['word' => 'LEGEND', 'question' => 'A traditional story sometimes regarded as historical but unauthenticated', 'category' => 'Story'],
            ['word' => 'VICTORY', 'question' => 'An act of defeating an enemy or opponent in a battle or competition', 'category' => 'Sports'],
        ];

        // Seed for yesterday, today, and the next 18 days
        $startDate = Carbon::yesterday();

        foreach ($words as $index => $data) {
            $date = $startDate->copy()->addDays($index)->toDateString();

            DB::table('words')->updateOrInsert(
                ['date' => $date], // Unique constraint usually on date
                [
                    'word' => $data['word'],
                    'question' => $data['question'],
                    'category' => $data['category'],
                    'hint' => 'Starts with ' . substr($data['word'], 0, 1),
                    'difficulty' => 'medium',
                    'points' => 1000,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
