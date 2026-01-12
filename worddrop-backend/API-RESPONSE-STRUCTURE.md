# API Response Structure

This document shows the expected API response structure matching the frontend TypeScript interfaces.

## Word of the Day API

### Endpoint: `GET /api/v1/word-of-day`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question": "What planet is known as the Red Planet?",
    "answer": "MARS",
    "word": "MARS",
    "date": "2026-01-12",
    "category": "Science",
    "hint": "It's red",
    "difficulty": "easy",
    "points": 100,
    "type": "daily"
  }
}
```

**Frontend Interface Match:**
- Matches `WordOfTheDay` interface from `wordOfTheDay.ts`
- `question`: The clue/question (required)
- `answer`: The word to find (required)
- `type`: Always "daily"

## Sponsor Question API

### Endpoint: `GET /api/v1/sponsor-question?level=5&combo_count=2`

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sponsor": "Apple",
    "sponsorLogo": "https://example.com/logo.png",
    "sponsorDetails": {
      "id": 1,
      "name": "Apple",
      "slug": "apple",
      "logo_url": "https://example.com/logo.png"
    },
    "question": "What OS runs on iPhones?",
    "answer": "IOS",
    "category": "Technology",
    "difficulty": "easy",
    "points": 1500,
    "basePoints": 1000,
    "bonusMultiplier": 1.5,
    "hint": "It's a mobile operating system",
    "type": "sponsor",
    "date": "2026-01-12"
  }
}
```

**Frontend Interface Match:**
- Matches `SponsorQuestion` interface from `sponsorQuestions.ts`
- `sponsor`: Sponsor name (string)
- `sponsorLogo`: Logo URL (optional)
- `question`: The trivia question
- `answer`: The word to find
- `basePoints`: Base points for calculation
- `bonusMultiplier`: Custom multiplier
- `points`: Calculated final points (includes word length, difficulty, category bonuses)
- `type`: Always "sponsor"

## Points Calculation

### Sponsor Question Scoring Formula

```
points = (basePoints + wordLengthBonus) * difficultyMultiplier * categoryBonus * bonusMultiplier * comboBonus
```

Where:
- `basePoints`: From question or default 100
- `wordLengthBonus`: `answer.length * 20`
- `difficultyMultiplier`: easy=1.0, medium=1.5, hard=2.5
- `categoryBonus`: Varies by category (see `SponsorQuestionScoringService`)
- `bonusMultiplier`: Custom multiplier from question (default 1.0)
- `comboBonus`: `1 + ((comboCount - 1) * 0.1)`

### Example Calculation

Question: "What OS runs on iPhones?" → Answer: "IOS"
- basePoints: 1000
- wordLengthBonus: 3 * 20 = 60
- difficultyMultiplier: 1.0 (easy)
- categoryBonus: 1.2 (Technology)
- bonusMultiplier: 1.5
- comboBonus: 1.0 (no combo)

Final: `(1000 + 60) * 1.0 * 1.2 * 1.5 * 1.0 = 1908 points`

## Database Schema

### Words Table
- `word`: The answer (e.g., "MARS")
- `question`: The clue/question (e.g., "What planet is known as the Red Planet?")
- `hint`: Additional hint (optional)
- `category`: Category name
- `difficulty`: easy, medium, hard
- `points`: Base points
- `date`: Date for word of the day

### Questions Table
- `question`: The trivia question
- `answer`: The word to find
- `sponsor_id`: Foreign key to sponsors
- `category`: Category name
- `difficulty`: easy, medium, hard
- `points`: Stored points (can be overridden by calculation)
- `base_points`: Base points for calculation (nullable)
- `bonus_multiplier`: Custom multiplier (nullable, default 1.0)
- `hint`: Additional hint (optional)

## Admin API Updates

### Create Word
```json
POST /api/admin/words
{
  "word": "MARS",
  "question": "What planet is known as the Red Planet?",
  "date": "2026-01-12",
  "category": "Science",
  "hint": "It's red",
  "difficulty": "easy",
  "points": 100
}
```

### Create Question
```json
POST /api/admin/questions
{
  "sponsor_id": 1,
  "question": "What OS runs on iPhones?",
  "answer": "IOS",
  "category": "Technology",
  "difficulty": "easy",
  "base_points": 1000,
  "bonus_multiplier": 1.5,
  "points": 1500
}
```
