# WordDROP API Documentation

## Base URL
- Development: `http://localhost:8000/api`
- Production: `https://worddrop.live/api`

---

## Public Game APIs (`/api/v1/`)

### Word of the Day

#### Get Today's Word
```
GET /api/v1/word-of-day
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "word": "EXAMPLE",
    "date": "2026-01-11",
    "category": "General",
    "hint": "A thing characteristic of its kind",
    "difficulty": "medium",
    "points": 100
  }
}
```

#### Get Word by Date
```
GET /api/v1/word-of-day/{date}
```

**Parameters:**
- `date` - Date in YYYY-MM-DD format

---

### Sponsor Questions

#### Get Random Sponsor Question
```
GET /api/v1/sponsor-question?level=5
```

**Query Parameters:**
- `level` (optional) - Game level (affects difficulty)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sponsor": {
      "id": 1,
      "name": "Acme Corp",
      "slug": "acme-corp",
      "logo_url": "https://example.com/logo.png"
    },
    "question": "What is the capital of France?",
    "answer": "PARIS",
    "category": "Geography",
    "difficulty": "easy",
    "points": 150,
    "hint": "It's a famous European city"
  }
}
```

#### Get Specific Question
```
GET /api/v1/sponsor-question/{id}
```

---

### Sponsor Details

#### Get Sponsor by Slug
```
GET /api/v1/sponsor/{slug}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Acme Corp",
    "slug": "acme-corp",
    "logo_url": "https://example.com/logo.png",
    "website_url": "https://acme.com",
    "description": "Leading provider of..."
  }
}
```

---

### Game Sessions

#### Create/Update Game Session
```
POST /api/v1/game-session
```

**Body:**
```json
{
  "session_token": "optional-existing-token",
  "user_id": 123,
  "level_reached": 10,
  "final_score": 5000,
  "words_found": 25,
  "duration_seconds": 300
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_token": "abc123...",
    "game_session_id": "uuid-here"
  }
}
```

---

### Scores

#### Submit Score
```
POST /api/v1/scores
```

**Body:**
```json
{
  "game_session_id": "uuid-here",
  "user_id": 123,
  "word": "EXAMPLE",
  "points": 100,
  "combo_count": 2,
  "level": 5,
  "word_type": "word_of_day",
  "word_id": 1,
  "question_id": null
}
```

**Word Types:**
- `normal` - Regular word
- `word_of_day` - Word of the day
- `sponsor_trivia` - Sponsor trivia question

---

### Leaderboard

#### Get Leaderboard
```
GET /api/v1/leaderboard?type=all_time&limit=10&offset=0
```

**Query Parameters:**
- `type` - `all_time`, `daily`, `weekly`, `monthly` (default: `all_time`)
- `limit` - Number of results (default: 10, max: 100)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "position": 1,
      "user_id": 123,
      "name": "Player One",
      "score": 50000
    }
  ],
  "meta": {
    "type": "all_time",
    "limit": 10,
    "offset": 0,
    "count": 10
  }
}
```

#### Get User Position
```
GET /api/v1/leaderboard/user/{user_id}?type=all_time
```

**Response:**
```json
{
  "success": true,
  "data": {
    "position": 5,
    "user_id": 123,
    "name": "Player One",
    "score": 25000
  }
}
```

---

## Admin APIs (`/api/admin/`) - Requires Authentication

All admin endpoints require `Authorization: Bearer {token}` header.

### Dashboard & Analytics

#### Get Dashboard Stats
```
GET /api/admin/dashboard/stats
```

#### Score Analytics
```
GET /api/admin/analytics/scores?period=7days
```

**Query Parameters:**
- `period` - `7days`, `30days`, `90days`

#### Sponsor Performance
```
GET /api/admin/analytics/sponsors
```

#### User Statistics
```
GET /api/admin/analytics/users
```

---

### Word Management

#### List Words
```
GET /api/admin/words?per_page=15
```

#### Create Word
```
POST /api/admin/words
```

**Body:**
```json
{
  "word": "EXAMPLE",
  "date": "2026-01-12",
  "category": "General",
  "hint": "A thing characteristic of its kind",
  "difficulty": "medium",
  "points": 100,
  "is_active": true
}
```

#### Update Word
```
PUT /api/admin/words/{id}
```

#### Delete Word
```
DELETE /api/admin/words/{id}
```

#### Assign Word to Date
```
POST /api/admin/words/{id}/assign-date
```

**Body:**
```json
{
  "date": "2026-01-15"
}
```

#### Bulk Import Words
```
POST /api/admin/words/bulk
```

**Body:**
```json
{
  "words": [
    {
      "word": "WORD1",
      "date": "2026-01-12",
      "difficulty": "easy",
      "points": 50
    }
  ]
}
```

---

### Sponsor Management

#### List Sponsors
```
GET /api/admin/sponsors?per_page=15&active_only=true
```

#### Create Sponsor
```
POST /api/admin/sponsors
```

**Body:**
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "logo_url": "https://example.com/logo.png",
  "website_url": "https://acme.com",
  "description": "Leading provider...",
  "contact_email": "contact@acme.com",
  "contact_name": "John Doe",
  "is_active": true
}
```

#### Update Sponsor
```
PUT /api/admin/sponsors/{id}
```

#### Delete Sponsor (Deactivate)
```
DELETE /api/admin/sponsors/{id}
```

---

### Question Management

#### List Questions
```
GET /api/admin/questions?sponsor_id=1&difficulty=easy&is_active=true
```

#### Create Question
```
POST /api/admin/questions
```

**Body:**
```json
{
  "sponsor_id": 1,
  "question": "What is the capital of France?",
  "answer": "PARIS",
  "category": "Geography",
  "difficulty": "easy",
  "points": 150,
  "hint": "It's a famous European city",
  "is_active": true,
  "priority": 0,
  "starts_at": "2026-01-12 00:00:00",
  "ends_at": "2026-12-31 23:59:59"
}
```

#### Update Question
```
PUT /api/admin/questions/{id}
```

#### Delete Question
```
DELETE /api/admin/questions/{id}
```

#### Bulk Import Questions
```
POST /api/admin/questions/bulk
```

**Body:**
```json
{
  "questions": [
    {
      "sponsor_id": 1,
      "question": "Question text?",
      "answer": "ANSWER",
      "difficulty": "medium",
      "points": 100
    }
  ]
}
```

---

## Redis Leaderboard

The leaderboard uses Redis sorted sets for fast retrieval:

- **All Time**: `leaderboard:all_time`
- **Daily**: `leaderboard:daily:YYYY-MM-DD`
- **Weekly**: `leaderboard:weekly:YYYY-MM-DD` (start of week)
- **Monthly**: `leaderboard:monthly:YYYY-MM-DD` (start of month)

Leaderboards are automatically updated when scores are submitted. The `LeaderboardService` handles all Redis operations.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error
