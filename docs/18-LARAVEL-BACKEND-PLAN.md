# Laravel Backend Implementation Plan

## Overview
This document outlines the plan for building a Laravel backend to manage game modes, words, sponsors, questions, and scores for the WordDROP game.

---

## 1. Project Structure

```
worddrop-backend/              (Laravel project - separate from React frontend)
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── GameController.php          # Game-related APIs
│   │   │   │   ├── WordController.php          # Word of the day APIs
│   │   │   │   ├── SponsorController.php       # Sponsor/trivia APIs
│   │   │   │   ├── ScoreController.php         # Score submission & leaderboards
│   │   │   │   └── QuestionController.php      # Question management
│   │   │   └── Admin/
│   │   │       ├── WordManagementController.php
│   │   │       ├── SponsorManagementController.php
│   │   │       ├── QuestionManagementController.php
│   │   │       └── DashboardController.php
│   │   └── Middleware/
│   │       └── ApiAuth.php                     # API authentication
│   ├── Models/
│   │   ├── User.php
│   │   ├── Word.php                            # Word of the day
│   │   ├── Sponsor.php
│   │   ├── Question.php                        # Sponsor trivia questions
│   │   ├── GameSession.php                     # Game sessions
│   │   ├── Score.php                           # Individual scores
│   │   └── Leaderboard.php                     # Aggregated leaderboards
│   └── Services/
│       ├── WordService.php                     # Word generation logic
│       ├── SponsorService.php                  # Sponsor assignment
│       ├── ScoreService.php                    # Score calculation
│       └── GameModeService.php                 # Game mode logic
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php                                 # API routes
│   └── web.php                                 # Admin panel routes
└── resources/
    └── views/
        └── admin/                              # Admin panel views
```

---

## 2. Database Schema

### 2.1 Core Tables

#### `users` (extends Laravel's default users table)
- `id` (primary key)
- `name`
- `email` (unique)
- `email_verified_at`
- `password`
- `api_token` (nullable, for API authentication)
- `role` (enum: 'player', 'admin', 'sponsor')
- `created_at`, `updated_at`

#### `words` (Word of the Day)
- `id` (primary key)
- `word` (string, unique, uppercase)
- `date` (date, unique) - The date this word is assigned to
- `category` (string, nullable) - e.g., "General", "Science", "Technology"
- `hint` (text, nullable) - Hint for the word
- `difficulty` (enum: 'easy', 'medium', 'hard')
- `points` (integer) - Base points for finding this word
- `is_active` (boolean, default: true)
- `created_by` (foreign key -> users.id, nullable)
- `created_at`, `updated_at`

#### `sponsors`
- `id` (primary key)
- `name` (string, unique)
- `slug` (string, unique) - URL-friendly identifier
- `logo_url` (string, nullable)
- `website_url` (string, nullable)
- `description` (text, nullable)
- `contact_email` (string, nullable)
- `contact_name` (string, nullable)
- `is_active` (boolean, default: true)
- `created_at`, `updated_at`

#### `questions` (Sponsor Trivia Questions)
- `id` (primary key)
- `sponsor_id` (foreign key -> sponsors.id)
- `question` (text) - The trivia question
- `answer` (string, uppercase) - The word answer
- `category` (string, nullable) - e.g., "Finance", "Technology", "E-Commerce"
- `difficulty` (enum: 'easy', 'medium', 'hard')
- `points` (integer) - Base points for correct answer
- `hint` (text, nullable)
- `is_active` (boolean, default: true)
- `priority` (integer, default: 0) - For ordering/sponsor preferences
- `starts_at` (datetime, nullable) - When question becomes active
- `ends_at` (datetime, nullable) - When question expires
- `created_by` (foreign key -> users.id, nullable)
- `created_at`, `updated_at`

#### `game_sessions`
- `id` (primary key, UUID)
- `user_id` (foreign key -> users.id, nullable) - Anonymous play allowed
- `session_token` (string, unique) - For anonymous sessions
- `level_reached` (integer)
- `final_score` (integer)
- `words_found` (integer)
- `duration_seconds` (integer, nullable)
- `ended_at` (timestamp, nullable)
- `created_at`, `updated_at`

#### `scores`
- `id` (primary key)
- `game_session_id` (foreign key -> game_sessions.id)
- `user_id` (foreign key -> users.id, nullable)
- `word` (string) - The word that was found
- `points` (integer) - Points awarded
- `combo_count` (integer, default: 1)
- `level` (integer)
- `word_type` (enum: 'normal', 'word_of_day', 'sponsor_trivia')
- `word_id` (foreign key -> words.id, nullable) - If word of day
- `question_id` (foreign key -> questions.id, nullable) - If sponsor trivia
- `created_at` (timestamp)

#### `leaderboards` (Optional - aggregated table for performance)
- `id` (primary key)
- `user_id` (foreign key -> users.id, unique)
- `high_score` (integer, default: 0)
- `total_games` (integer, default: 0)
- `total_words_found` (integer, default: 0)
- `total_word_of_day_found` (integer, default: 0)
- `total_sponsor_trivia_found` (integer, default: 0)
- `average_score` (decimal 10,2, default: 0)
- `updated_at`, `created_at`

---

## 3. API Endpoints

### 3.1 Public Game APIs (`/api/v1/`)

#### Word of the Day
- `GET /api/v1/word-of-day` - Get today's word of the day
  - Response: `{ word, date, category, hint, points }`
  
- `GET /api/v1/word-of-day/{date}` - Get word for specific date
  - Response: Same as above

#### Sponsor Questions
- `GET /api/v1/sponsor-question` - Get random active sponsor question
  - Query params: `level` (optional) - Game level
  - Response: `{ id, sponsor: { name, logo_url }, question, answer, category, difficulty, points, hint }`
  
- `GET /api/v1/sponsor-question/{id}` - Get specific question
  - Response: Same as above

- `GET /api/v1/sponsor/{slug}` - Get sponsor details
  - Response: `{ id, name, slug, logo_url, website_url, description }`

#### Scores
- `POST /api/v1/scores` - Submit a score
  - Body: `{ session_token?, user_id?, word, points, combo_count, level, word_type, word_id?, question_id? }`
  - Response: `{ success: true, score_id }`

- `POST /api/v1/game-session` - Create/update game session
  - Body: `{ session_token?, user_id?, level_reached, final_score, words_found, duration_seconds }`
  - Response: `{ session_token, game_session_id }`

- `GET /api/v1/leaderboard` - Get leaderboard
  - Query params: `limit` (default: 10), `type` ('all_time' | 'daily' | 'weekly' | 'monthly')
  - Response: `[{ user_id, name, high_score, total_games, ... }]`

- `GET /api/v1/leaderboard/user/{user_id}` - Get user's position
  - Response: `{ position, user, ... }`

### 3.2 Admin APIs (`/api/admin/`) - Requires authentication

#### Word Management
- `GET /api/admin/words` - List all words (paginated)
- `POST /api/admin/words` - Create new word
- `GET /api/admin/words/{id}` - Get word details
- `PUT /api/admin/words/{id}` - Update word
- `DELETE /api/admin/words/{id}` - Delete word
- `POST /api/admin/words/bulk` - Bulk import words
- `POST /api/admin/words/{id}/assign-date` - Assign word to specific date

#### Sponsor Management
- `GET /api/admin/sponsors` - List all sponsors
- `POST /api/admin/sponsors` - Create new sponsor
- `GET /api/admin/sponsors/{id}` - Get sponsor details
- `PUT /api/admin/sponsors/{id}` - Update sponsor
- `DELETE /api/admin/sponsors/{id}` - Delete sponsor (soft delete)

#### Question Management
- `GET /api/admin/questions` - List all questions (with filters)
- `POST /api/admin/questions` - Create new question
- `GET /api/admin/questions/{id}` - Get question details
- `PUT /api/admin/questions/{id}` - Update question
- `DELETE /api/admin/questions/{id}` - Delete question
- `POST /api/admin/questions/bulk` - Bulk import questions

#### Analytics/Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/analytics/scores` - Score analytics
- `GET /api/admin/analytics/sponsors` - Sponsor performance
- `GET /api/admin/analytics/users` - User statistics

---

## 4. Admin Panel Features

### 4.1 Dashboard
- Overview statistics (total users, games, scores, etc.)
- Recent activity
- Charts (score trends, word popularity, etc.)

### 4.2 Word Management
- List/Create/Edit/Delete words
- Calendar view for word assignments
- Bulk import from CSV
- Word validation (check if word exists in dictionary)
- Preview word details

### 4.3 Sponsor Management
- List/Create/Edit/Delete sponsors
- Upload sponsor logos
- View sponsor's questions
- Sponsor analytics (question views, answers, etc.)

### 4.4 Question Management
- List/Create/Edit/Delete questions
- Filter by sponsor, category, difficulty
- Bulk import from CSV
- Question scheduling (start/end dates)
- Preview question details

### 4.5 Score Management
- View all scores
- Filter by date, user, word type
- Export scores to CSV
- View game sessions

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1)
1. **Setup Laravel Project**
   - Install Laravel in separate directory
   - Configure database connection
   - Setup CORS for React frontend
   - Configure API authentication

2. **Database & Models**
   - Create migrations for all tables
   - Create models with relationships
   - Setup model factories/seeders for testing

3. **Basic API Structure**
   - Setup API routes
   - Create base controllers
   - Implement API response format
   - Setup error handling

### Phase 2: Core APIs (Week 2)
1. **Word of the Day APIs**
   - Implement GET endpoints
   - Add word assignment logic
   - Create word service

2. **Sponsor Question APIs**
   - Implement GET endpoints
   - Add question selection logic
   - Create sponsor service

3. **Score APIs**
   - Implement POST endpoint for score submission
   - Create score calculation service
   - Implement leaderboard endpoint

### Phase 3: Admin Panel (Week 3)
1. **Authentication**
   - Setup admin authentication
   - Create admin middleware

2. **Word Management**
   - Create CRUD interface
   - Add calendar view
   - Implement bulk import

3. **Sponsor Management**
   - Create CRUD interface
   - Add file upload for logos

4. **Question Management**
   - Create CRUD interface
   - Add filtering/sorting
   - Implement scheduling

### Phase 4: Integration & Testing (Week 4)
1. **Frontend Integration**
   - Update React app to use Laravel APIs
   - Replace hardcoded data with API calls
   - Handle API errors

2. **Testing**
   - Write unit tests for services
   - Write feature tests for APIs
   - Test admin panel

3. **Documentation**
   - API documentation
   - Admin panel user guide
   - Deployment guide

---

## 6. Technical Considerations

### 6.1 API Authentication
- **Option 1**: API tokens (stored in users table)
- **Option 2**: Laravel Sanctum (recommended)
- **Option 3**: JWT tokens

### 6.2 CORS Configuration
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173', 'https://yourdomain.com'],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_headers' => ['*'],
```

### 6.3 Rate Limiting
- Public APIs: 60 requests/minute per IP
- Authenticated APIs: 120 requests/minute per user
- Admin APIs: 200 requests/minute per admin

### 6.4 Database Optimization
- Add indexes on frequently queried columns:
  - `words.date`
  - `scores.user_id`, `scores.created_at`
  - `questions.sponsor_id`, `questions.is_active`
  - `game_sessions.user_id`

### 6.5 Caching Strategy
- Cache word of the day (24 hours)
- Cache active sponsor questions (1 hour)
- Cache leaderboard (5 minutes)
- Clear cache on word/question updates

---

## 7. Environment Configuration

### Required Environment Variables
```env
APP_NAME=WordDROP Backend
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=worddrop
DB_USERNAME=root
DB_PASSWORD=

API_TOKEN_EXPIRY=43200  # 12 hours in minutes
```

---

## 8. Next Steps

1. **Create Laravel project structure**
2. **Design and create database migrations**
3. **Implement core models and relationships**
4. **Build basic API endpoints**
5. **Create admin authentication**
6. **Build admin panel UI**
7. **Integrate with React frontend**
8. **Test and deploy**

---

## 9. Questions to Consider

1. **Authentication**: Do users need accounts, or can they play anonymously?
   - Recommendation: Support both (anonymous with session_token, registered with user_id)

2. **Word Generation**: Auto-generate words of the day or manual assignment?
   - Recommendation: Manual assignment via admin panel for quality control

3. **Sponsor Onboarding**: Self-service or admin-managed?
   - Recommendation: Admin-managed initially, can add self-service later

4. **Scoring**: Store every score or aggregate only?
   - Recommendation: Store all scores for analytics, aggregate for leaderboards

5. **Deployment**: Shared hosting, VPS, or cloud?
   - Consider: WAMP setup suggests local/shared hosting, but cloud (AWS/Laravel Forge) recommended for production
