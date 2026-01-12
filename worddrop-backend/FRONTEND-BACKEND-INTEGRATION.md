# Frontend-Backend Integration Guide

## Overview

This guide shows how the frontend TypeScript interfaces match the backend API responses.

## Word of the Day

### Frontend Interface (wordOfTheDay.ts)
```typescript
interface WordOfTheDay extends DailyQuestion {
  date: string;
  type: 'daily' | 'sponsor';
  sponsor?: string;
  points?: number;
}

interface DailyQuestion {
  category: string;
  question: string;  // The clue/question
  answer: string;    // The word to find
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
}
```

### Backend API Response
```json
GET /api/v1/word-of-day
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

### Database Schema
- `words.word` → `answer` (the word to find)
- `words.question` → `question` (the clue/question)
- `words.hint` → `hint` (additional hint)

## Sponsor Questions

### Frontend Interface (sponsorQuestions.ts)
```typescript
interface SponsorQuestion extends BaseQuestion {
  sponsor: string;
  sponsorLogo?: string;
  basePoints?: number;
  bonusMultiplier?: number;
  correctAnswer?: string;
}

interface BaseQuestion {
  category: string;
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
}
```

### Backend API Response
```json
GET /api/v1/sponsor-question?level=5&combo_count=2
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
    "points": 1908,
    "basePoints": 1000,
    "bonusMultiplier": 1.5,
    "hint": "It's a mobile operating system",
    "type": "sponsor",
    "date": "2026-01-12"
  }
}
```

### Points Calculation

The backend automatically calculates points using `SponsorQuestionScoringService`:

```php
points = (basePoints + wordLengthBonus) * difficultyMultiplier * categoryBonus * bonusMultiplier * comboBonus
```

**Example:**
- Question: "What OS runs on iPhones?" → Answer: "IOS"
- basePoints: 1000
- wordLengthBonus: 3 * 20 = 60
- difficultyMultiplier: 1.0 (easy)
- categoryBonus: 1.2 (Technology)
- bonusMultiplier: 1.5
- comboBonus: 1.0 (no combo)

**Result:** `(1000 + 60) * 1.0 * 1.2 * 1.5 * 1.0 = 1908 points`

### Database Schema
- `questions.question` → `question` (the trivia question)
- `questions.answer` → `answer` (the word to find)
- `questions.base_points` → `basePoints` (for calculation)
- `questions.bonus_multiplier` → `bonusMultiplier` (custom multiplier)
- `questions.points` → stored points (can be overridden by calculation)

## Admin Panel Usage

### Creating Word of the Day

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

### Creating Sponsor Question

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

**Note:** The `points` field in the database is stored but may be overridden by the calculated points when the question is retrieved via the API.

## Frontend Integration

### Fetching Word of the Day
```typescript
const response = await fetch('http://192.168.0.153:8000/api/v1/word-of-day');
const { data } = await response.json();

// data matches WordOfTheDay interface
const wordOfDay: WordOfTheDay = {
  question: data.question,
  answer: data.answer,
  category: data.category,
  difficulty: data.difficulty,
  hint: data.hint,
  date: data.date,
  type: data.type,
  points: data.points,
};
```

### Fetching Sponsor Question
```typescript
const response = await fetch(
  `http://192.168.0.153:8000/api/v1/sponsor-question?level=${level}&combo_count=${comboCount}`
);
const { data } = await response.json();

// data matches SponsorQuestion interface
const sponsorQuestion: SponsorQuestion = {
  question: data.question,
  answer: data.answer,
  category: data.category,
  difficulty: data.difficulty,
  hint: data.hint,
  sponsor: data.sponsor,
  sponsorLogo: data.sponsorLogo,
  basePoints: data.basePoints,
  bonusMultiplier: data.bonusMultiplier,
  points: data.points, // Calculated points
};
```

## Key Points

1. **Word of the Day**: Uses `question` field for the clue, `word` field for the answer
2. **Sponsor Questions**: Points are calculated dynamically based on word length, difficulty, category, and combo
3. **Type Field**: Both responses include `type: 'daily'` or `type: 'sponsor'` to match frontend
4. **Backward Compatibility**: Word of the day still includes `word` field alongside `answer`
