<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Word;
use App\Models\Sponsor;
use App\Models\Question;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ImportExampleQuestionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create admin user for created_by
        $admin = User::where('email', 'admin@worddrop.live')->first();
        if (!$admin) {
            $admin = User::factory()->create([
                'email' => 'admin@worddrop.live',
                'name' => 'Admin',
                'role' => 'admin',
            ]);
        }

        $this->command->info('Importing Word of the Day questions...');
        $this->importWordOfTheDayQuestions($admin);
        
        $this->command->info('Importing Sponsor questions...');
        $this->importSponsorQuestions($admin);
        
        $this->command->info('Import completed!');
    }

    private function importWordOfTheDayQuestions($admin)
    {
        // Daily questions from wordOfTheDay.ts
        $dailyQuestions = [
            // Science
            ['category' => 'Science', 'question' => 'What planet is known as the Red Planet?', 'answer' => 'MARS', 'difficulty' => 'easy'],
            ['category' => 'Science', 'question' => "What's the closest star to Earth?", 'answer' => 'SUN', 'difficulty' => 'easy'],
            ['category' => 'Science', 'question' => "What's the hardest natural substance?", 'answer' => 'DIAMOND', 'difficulty' => 'medium'],
            ['category' => 'Science', 'question' => 'What is the name of the AI chatbot released by OpenAI in late 2022?', 'answer' => 'CHATGPT', 'difficulty' => 'easy'],
            ['category' => 'Science', 'question' => 'Which tech billionaire founded Neuralink, a brain-computer interface company?', 'answer' => 'MUSK', 'difficulty' => 'medium'],
            ['category' => 'Science', 'question' => "What is the name of the quantum computer developed by Google that achieved 'quantum supremacy'?", 'answer' => 'SYCAMORE', 'difficulty' => 'hard'],
            ['category' => 'Science', 'question' => 'Which mRNA-based vaccine was one of the first approved for COVID-19?', 'answer' => 'MODERNA', 'difficulty' => 'medium'],
            
            // Geography
            ['category' => 'Geography', 'question' => 'What is the capital city of Japan?', 'answer' => 'TOKYO', 'difficulty' => 'easy'],
            ['category' => 'Geography', 'question' => "What's the largest continent?", 'answer' => 'ASIA', 'difficulty' => 'easy'],
            ['category' => 'Geography', 'question' => "What's the largest ocean?", 'answer' => 'PACIFIC', 'difficulty' => 'medium'],
            ['category' => 'Geography', 'question' => 'What country has the Eiffel Tower?', 'answer' => 'FRANCE', 'difficulty' => 'hard'],
            ['category' => 'Geography', 'question' => 'What continent has no desert?', 'answer' => 'EUROPE', 'difficulty' => 'hard'],
            ['category' => 'Geography', 'question' => 'Which country launched the world\'s largest solar farm in 2024?', 'answer' => 'MOROCCO', 'difficulty' => 'medium'],
            ['category' => 'Geography', 'question' => 'What melting glacier is currently contributing most to global sea-level rise?', 'answer' => 'THWAITES', 'difficulty' => 'hard'],
            ['category' => 'Geography', 'question' => 'Which city became the most populous in 2024, surpassing Tokyo?', 'answer' => 'DELHI', 'difficulty' => 'easy'],
            ['category' => 'Geography', 'question' => 'Which U.S. state ran entirely on renewable energy for 30 days in 2024?', 'answer' => 'VERMONT', 'difficulty' => 'hard'],
            
            // History
            ['category' => 'History', 'question' => 'Who painted the Mona Lisa?', 'answer' => 'DAVINCI', 'difficulty' => 'medium'],
            ['category' => 'History', 'question' => 'Who flew solo across the Atlantic first?', 'answer' => 'EARHART', 'difficulty' => 'hard'],
            ['category' => 'History', 'question' => 'Which ancient African kingdom was known for its gold and powerful ruler Mansa Musa?', 'answer' => 'MALI', 'difficulty' => 'medium'],
            ['category' => 'History', 'question' => 'Which Mongol leader founded the largest contiguous empire in history?', 'answer' => 'GENGHIS', 'difficulty' => 'easy'],
            ['category' => 'History', 'question' => 'Which civilization built the pyramids of Teotihuacan?', 'answer' => 'AZTECS', 'difficulty' => 'hard'],
            ['category' => 'History', 'question' => 'Which ancient empire built Machu Picchu?', 'answer' => 'INCAS', 'difficulty' => 'easy'],
            
            // Sports
            ['category' => 'Sports', 'question' => 'Which South African runner holds the 400m world record (43.03s)?', 'answer' => 'VAN NIEKERK', 'difficulty' => 'hard'],
            ['category' => 'Sports', 'question' => 'What sport has slam dunks?', 'answer' => 'BASKETBALL', 'difficulty' => 'easy'],
            ['category' => 'Sports', 'question' => 'What sport uses a puck?', 'answer' => 'HOCKEY', 'difficulty' => 'hard'],
            ['category' => 'Sports', 'question' => 'Which Japanese city hosted the 2020 Summer Olympics?', 'answer' => 'TOKYO', 'difficulty' => 'easy'],
            ['category' => 'Sports', 'question' => 'Which country hosted the first FIFA World Cup in 1930?', 'answer' => 'URUGUAY', 'difficulty' => 'medium'],
            ['category' => 'Sports', 'question' => 'Which Australian swimmer holds the 400m freestyle world record?', 'answer' => 'TITMUS', 'difficulty' => 'hard'],
            ['category' => 'Sports', 'question' => 'Which island nation invented rugby 7s?', 'answer' => 'FIJI', 'difficulty' => 'medium'],
            
            // Food
            ['category' => 'Food', 'question' => 'What fruit is known as the king of fruits?', 'answer' => 'DURIAN', 'difficulty' => 'medium'],
            ['category' => 'Food', 'question' => 'What fruit did Newton see fall?', 'answer' => 'APPLE', 'difficulty' => 'easy'],
            ['category' => 'Food', 'question' => "What's the main ingredient in hummus?", 'answer' => 'CHICKPEA', 'difficulty' => 'medium'],
            ['category' => 'Sports', 'question' => 'Which footballer won 8 Ballon d\'Or awards?', 'answer' => 'MESSI', 'difficulty' => 'medium'],
            
            // Technology
            ['category' => 'Technology', 'question' => 'Who co-founded Apple with Steve Jobs?', 'answer' => 'WOZNIAK', 'difficulty' => 'hard'],
            ['category' => 'Technology', 'question' => 'What protocol do websites use?', 'answer' => 'HTTP', 'difficulty' => 'hard'],
            ['category' => 'Technology', 'question' => 'Which African country launched its first satellite in 2023?', 'answer' => 'GHANA', 'difficulty' => 'medium'],
            ['category' => 'Technology', 'question' => 'What type of renewable energy powers most Antarctic research stations?', 'answer' => 'SOLAR', 'difficulty' => 'easy'],
            ['category' => 'Technology', 'question' => 'Which company created the world\'s first foldable smartphone?', 'answer' => 'SAMSUNG', 'difficulty' => 'medium'],
            ['category' => 'Technology', 'question' => 'Which European country developed the first mRNA COVID vaccine?', 'answer' => 'GERMANY', 'difficulty' => 'hard'],
            ['category' => 'Technology', 'question' => 'Which tech giant recently unveiled its first quantum computer?', 'answer' => 'GOOGLE', 'difficulty' => 'medium'],
            ['category' => 'Technology', 'question' => 'Which Australian invention revolutionized WiFi technology?', 'answer' => 'RADIOS', 'difficulty' => 'hard'],
            
            // Animals
            ['category' => 'Animals', 'question' => "What's the fastest land animal?", 'answer' => 'CHEETAH', 'difficulty' => 'easy'],
            ['category' => 'Animals', 'question' => "What's the largest mammal?", 'answer' => 'WHALE', 'difficulty' => 'medium'],
            ['category' => 'Animals', 'question' => "This animal's name means 'earth pig' in Afrikaans, though it's not porcine", 'answer' => 'AARDVARK', 'difficulty' => 'hard'],
            ['category' => 'Animals', 'question' => "The only insect native to this continent survives by freezing itself solid", 'answer' => 'BELGICA', 'difficulty' => 'hard'],
            ['category' => 'Animals', 'question' => "This 'blind' subterranean mammal digs 100m of tunnels nightly", 'answer' => 'MOLE', 'difficulty' => 'medium'],
            ['category' => 'Animals', 'question' => "This monotreme's electroreceptive bill detects prey's muscle movements", 'answer' => 'PLATYPUS', 'difficulty' => 'medium'],
            
            // Space
            ['category' => 'Space', 'question' => 'What planet has the most moons?', 'answer' => 'JUPITER', 'difficulty' => 'medium'],
            ['category' => 'Space', 'question' => "What's our galaxy called?", 'answer' => 'MILKYWAY', 'difficulty' => 'easy'],
            ['category' => 'Space', 'question' => 'What solar system body has a day longer than its year?', 'answer' => 'VENUS', 'difficulty' => 'medium'],
            ['category' => 'Space', 'question' => 'The only spacecraft to visit Uranus and Neptune shares its name with this sea vessel', 'answer' => 'VOYAGER', 'difficulty' => 'medium'],
            ['category' => 'Space', 'question' => "The only moon with its own substantial atmosphere (1.5x Earth's pressure)", 'answer' => 'TITAN', 'difficulty' => 'hard'],
            
            // Music
            ['category' => 'Music', 'question' => 'What instrument has strings and a bow?', 'answer' => 'VIOLIN', 'difficulty' => 'easy'],
            ['category' => 'Music', 'question' => 'Who was the King of Pop?', 'answer' => 'JACKSON', 'difficulty' => 'easy'],
            ['category' => 'Music', 'question' => "The first rapper to win a Pulitzer Prize (2018) shares his name with a Broadway musical", 'answer' => 'KENDRICK', 'difficulty' => 'hard'],
            ['category' => 'Music', 'question' => "The 'King of Tango' who composed 'Libertango' lost his sight completely by age 20", 'answer' => 'PIAZZOLLA', 'difficulty' => 'hard'],
            ['category' => 'Music', 'question' => "The only Billboard #1 hit sung entirely in Spanish before 'Despacito' (1996)", 'answer' => 'MACARENA', 'difficulty' => 'hard'],
            ['category' => 'Music', 'question' => 'Which Grammy-winning South African DJ performed at Coachella 2022 who goes by the name of Black-?', 'answer' => 'COFFEE', 'difficulty' => 'medium'],
            
            // Holiday
            ['category' => 'Holiday', 'question' => 'What plant brings Christmas kisses?', 'answer' => 'MISTLETOE', 'difficulty' => 'easy'],
            ['category' => 'Holiday', 'question' => 'What flying animal represents Halloween?', 'answer' => 'BAT', 'difficulty' => 'easy'],
        ];

        $startDate = Carbon::today();
        $imported = 0;

        foreach ($dailyQuestions as $index => $q) {
            $date = $startDate->copy()->addDays($index);
            
            // Calculate points based on difficulty
            $points = match($q['difficulty']) {
                'easy' => 100,
                'medium' => 200,
                'hard' => 300,
                default => 150,
            };

            // Check if word already exists (by word or by date)
            $wordText = strtoupper($q['answer']);
            $existing = Word::where('word', $wordText)
                ->orWhere('date', $date->format('Y-m-d'))
                ->first();
            
            if ($existing) {
                continue;
            }

            Word::create([
                'word' => $wordText,
                'question' => $q['question'],
                'date' => $date->format('Y-m-d'),
                'category' => $q['category'],
                'difficulty' => $q['difficulty'],
                'points' => $points,
                'is_active' => true,
                'created_by' => $admin->id,
            ]);

            $imported++;
        }

        $this->command->info("Imported {$imported} Word of the Day questions.");
    }

    private function importSponsorQuestions($admin)
    {
        // Sponsor questions from sponsorQuestions.ts
        $sponsorQuestions = [
            ['sponsor' => 'Apple', 'category' => 'Technology', 'question' => 'What OS runs on iPhones?', 'answer' => 'IOS', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'McDonald\'s', 'category' => 'Fast Food', 'question' => 'What meat is in a Big Mac?', 'answer' => 'BEEF', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'PepsiCo', 'category' => 'Beverages', 'question' => 'What\'s the main ingredient in soda?', 'answer' => 'WATER', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Coca-Cola', 'category' => 'Beverages', 'question' => 'What makes cola brown?', 'answer' => 'CARAMEL', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Nike', 'category' => 'Sportswear', 'question' => 'What Greek goddess inspired Nike?', 'answer' => 'VICTORY', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Samsung', 'category' => 'Technology', 'question' => 'What\'s Samsung\'s AI helper called?', 'answer' => 'BIXBY', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Toyota', 'category' => 'Automotive', 'question' => 'What\'s Toyota\'s luxury brand?', 'answer' => 'LEXUS', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'McDonald\'s', 'category' => 'Fast Food', 'question' => 'What potato type makes the best fries?', 'answer' => 'RUSSET', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Apple', 'category' => 'Technology', 'question' => 'What fruit is in Apple\'s logo?', 'answer' => 'APPLE', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Adidas', 'category' => 'Sportswear', 'question' => 'What sport was Adidas made for?', 'answer' => 'SOCCER', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Amazon', 'category' => 'Retail', 'question' => 'What river inspired Amazon\'s name?', 'answer' => 'AMAZON', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Starbucks', 'category' => 'Coffee', 'question' => 'What\'s Starbucks\' signature drink?', 'answer' => 'LATTE', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Intel', 'category' => 'Technology', 'question' => 'What\'s the brain of a computer?', 'answer' => 'CPU', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Visa', 'category' => 'Finance', 'question' => 'What color are most Visa cards?', 'answer' => 'BLUE', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Netflix', 'category' => 'Streaming', 'question' => 'What show in netflix starts Millie Bobby Brown?', 'answer' => 'DAMSEL', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Toblerone', 'category' => 'Chocolate', 'question' => 'What mountain shaped Toblerone?', 'answer' => 'ALPEN', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Pringles', 'category' => 'Snacks', 'question' => 'What shape are Pringles?', 'answer' => 'CURVE', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Unilever', 'category' => 'Ice Cream', 'question' => 'What\'s in Ben & Jerry\'s Cookie Dough?', 'answer' => 'VANILLA', 'difficulty' => 'medium', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Gucci', 'category' => 'Luxury', 'question' => 'What animal is in Gucci\'s logo?', 'answer' => 'HORSE', 'difficulty' => 'medium', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'IKEA', 'category' => 'Fast Fashion', 'question' => 'What country is IKEA from?', 'answer' => 'SWEDEN', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'TikTok', 'category' => 'Social Media', 'question' => 'What was TikTok before?', 'answer' => 'MUSICALLY', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Microsoft', 'category' => 'Gaming', 'question' => 'What\'s Xbox\'s game service?', 'answer' => 'GAMEPASS', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Canon', 'category' => 'Cameras', 'question' => 'What\'s Canon\'s camera line?', 'answer' => 'EOS', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Mercedes-Benz', 'category' => 'Luxury Cars', 'question' => 'What\'s Mercedes\' luxury line?', 'answer' => 'MAYBACH', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            
            // Kids category
            ['sponsor' => 'Sesame Street', 'category' => 'Kids', 'question' => 'What color is Cookie Monster?', 'answer' => 'BLUE', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'National Geographic Kids', 'category' => 'Kids', 'question' => 'What do you call a baby frog?', 'answer' => 'TADPOLE', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Crayola', 'category' => 'Kids', 'question' => 'How many colors are in a rainbow?', 'answer' => 'SEVEN', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Disney Junior', 'category' => 'Kids', 'question' => 'What bird delivers babies in stories?', 'answer' => 'STORK', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Disney', 'category' => 'Kids', 'question' => 'What\'s Mickey Mouse\'s dog\'s name?', 'answer' => 'PLUTO', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Nickelodeon', 'category' => 'Kids', 'question' => 'What animal is SpongeBob\'s friend Patrick?', 'answer' => 'STARFISH', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Highlights Magazine', 'category' => 'Kids', 'question' => 'What do caterpillars turn into?', 'answer' => 'BUTTERFLY', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Chiquita', 'category' => 'Kids', 'question' => 'What yellow fruit do monkeys eat?', 'answer' => 'BANANA', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Cheerios', 'category' => 'Kids', 'question' => 'What do bees make?', 'answer' => 'HONEY', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'PBS Kids', 'category' => 'Kids', 'question' => 'What\'s the opposite of day?', 'answer' => 'NIGHT', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Nickelodeon', 'category' => 'Kids', 'question' => 'Who lives in a pineapple under the sea?', 'answer' => 'SPONGEBOB', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Animal Planet', 'category' => 'Kids', 'question' => 'What\'s a baby kangaroo called?', 'answer' => 'JOEY', 'difficulty' => 'medium', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Disney', 'category' => 'Kids', 'question' => 'Whose nose grows when he lies?', 'answer' => 'PINOCCHIO', 'difficulty' => 'medium', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Disney', 'category' => 'Kids', 'question' => 'What\'s the name of Winnie the Pooh\'s donkey friend?', 'answer' => 'EEYORE', 'difficulty' => 'medium', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'My Little Pony', 'category' => 'Kids', 'question' => 'What do you call a unicorn\'s horn?', 'answer' => 'ALICORN', 'difficulty' => 'hard', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            
            // Education
            ['sponsor' => 'Typing.com', 'category' => 'Education', 'question' => 'What system teaches typing with home row keys?', 'answer' => 'QWERTY', 'difficulty' => 'medium', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Khan Academy', 'category' => 'Education', 'question' => 'What math symbol means \'equals\'?', 'answer' => 'EQUALS', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Codecademy', 'category' => 'Education', 'question' => 'What online platform offers free coding lessons?', 'answer' => 'CODECADEMY', 'difficulty' => 'medium', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'Pearson Education', 'category' => 'Education', 'question' => 'What\'s the study of living things called?', 'answer' => 'BIOLOGY', 'difficulty' => 'easy', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
            ['sponsor' => 'College Board', 'category' => 'Education', 'question' => 'What standardized test do US college applicants take?', 'answer' => 'SAT', 'difficulty' => 'medium', 'basePoints' => 1000, 'bonusMultiplier' => 1.5],
        ];

        $sponsors = [];
        $imported = 0;

        foreach ($sponsorQuestions as $sq) {
            $sponsorName = $sq['sponsor'];
            
            // Get or create sponsor
            if (!isset($sponsors[$sponsorName])) {
                $sponsor = Sponsor::firstOrCreate(
                    ['name' => $sponsorName],
                    [
                        'slug' => Str::slug($sponsorName),
                        'is_active' => true,
                    ]
                );
                $sponsors[$sponsorName] = $sponsor;
            } else {
                $sponsor = $sponsors[$sponsorName];
            }

            // Calculate points
            $points = ($sq['basePoints'] ?? 100) * ($sq['bonusMultiplier'] ?? 1.0);

            // Check if question already exists
            $existing = Question::where('sponsor_id', $sponsor->id)
                ->where('question', $sq['question'])
                ->first();

            if ($existing) {
                continue;
            }

            Question::create([
                'sponsor_id' => $sponsor->id,
                'question' => $sq['question'],
                'answer' => strtoupper($sq['answer']),
                'category' => $sq['category'],
                'difficulty' => $sq['difficulty'],
                'base_points' => $sq['basePoints'] ?? 100,
                'bonus_multiplier' => $sq['bonusMultiplier'] ?? 1.0,
                'points' => $points,
                'is_active' => true,
                'created_by' => $admin->id,
            ]);

            $imported++;
        }

        $this->command->info("Imported {$imported} sponsor questions for " . count($sponsors) . " sponsors.");
    }
}
