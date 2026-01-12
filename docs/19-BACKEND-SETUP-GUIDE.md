# Laravel Backend Setup Guide

## Configuration Summary

Based on user requirements:

### Authentication
- **Session-based** anonymous play (CrazyGames handles user accounts)
- Users identified by `session_token` for anonymous sessions
- Optional `user_id` if provided by CrazyGames

### Word Management
- **Manual assignment** via admin panel
- Admin creates questions and answers
- Assign words to specific dates

### Sponsor Management
- **Admin-managed only** (no self-service)
- All sponsor onboarding through admin panel

### Deployment
- **Development**: WAMP local (localhost)
- **Production**: Shared hosting (worddrop.live) via Git
- **Database**: MySQL
  - Name: `worddrop`
  - User: `root`
  - Password: (empty)
  - Host: `localhost` (WAMP) / server hostname (production)

---

## Setup Steps

### 1. Install Laravel

```bash
cd C:\wamp64\www\words
composer create-project laravel/laravel worddrop-backend
cd worddrop-backend
```

### 2. Configure Database

Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=worddrop
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Configure CORS

Edit `config/cors.php`:
```php
'paths' => ['api/*', 'admin/*'],
'allowed_origins' => [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://worddrop.live',
],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
'allowed_headers' => ['*'],
```

### 4. Install Dependencies

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 5. Run Migrations

After creating migrations:
```bash
php artisan migrate
```

### 6. Create Admin User

```bash
php artisan tinker
>>> $user = App\Models\User::create(['name' => 'Admin', 'email' => 'admin@worddrop.live', 'password' => bcrypt('password'), 'role' => 'admin']);
```

---

## Git Setup (for deployment)

### Initial Git Repository

```bash
cd C:\wamp64\www\words\worddrop-backend
git init
git add .
git commit -m "Initial Laravel backend setup"
```

### Connect to Remote (when ready)

```bash
git remote add origin <your-git-repo-url>
git branch -M main
git push -u origin main
```

---

## File Structure to Create

```
worddrop-backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── Api/
│   │   │   ├── GameController.php
│   │   │   ├── WordController.php
│   │   │   ├── SponsorController.php
│   │   │   ├── ScoreController.php
│   │   │   └── QuestionController.php
│   │   └── Admin/
│   │       ├── WordManagementController.php
│   │       ├── SponsorManagementController.php
│   │       ├── QuestionManagementController.php
│   │       └── DashboardController.php
│   └── Models/
│       ├── Word.php
│       ├── Sponsor.php
│       ├── Question.php
│       ├── GameSession.php
│       ├── Score.php
│       └── Leaderboard.php
├── database/migrations/
│   ├── 2024_01_01_000001_create_words_table.php
│   ├── 2024_01_01_000002_create_sponsors_table.php
│   ├── 2024_01_01_000003_create_questions_table.php
│   ├── 2024_01_01_000004_create_game_sessions_table.php
│   ├── 2024_01_01_000005_create_scores_table.php
│   └── 2024_01_01_000006_create_leaderboards_table.php
└── routes/
    ├── api.php
    └── web.php
```
