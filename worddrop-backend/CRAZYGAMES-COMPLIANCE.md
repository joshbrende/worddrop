# CrazyGames SDK Compliance Checklist

Based on [CrazyGames SDK Documentation](https://docs.crazygames.com/#launching-on-crazygames), here's what the backend implements:

## ✅ Account Integration Requirements

### 1. Automatic Registration/Login ✅
- **Requirement**: Automatically register and log in CrazyGames users
- **Implementation**: 
  - `POST /api/v1/crazygames/register-login` endpoint
  - `CrazyGamesService::getOrCreateUser()` method
  - Auto-creates user when `crazygames_user_id` is provided

### 2. Guest/Anonymous Play ✅
- **Requirement**: Allow guest users to play without registration
- **Implementation**:
  - Game sessions work with `session_token` only
  - `user_id` and `crazygames_user_id` are optional
  - Scores can be submitted without user account

### 3. No External Login ✅
- **Requirement**: Disable external login options (Facebook, Google)
- **Status**: ✅ Compliant - No external login systems implemented

### 4. Link Progress to CrazyGames User ✅
- **Requirement**: Link user data to CrazyGames `userId`
- **Implementation**:
  - `crazygames_user_id` stored in `users` table
  - `crazygames_user_id` stored in `game_sessions` table
  - Scores linked via `user_id` (which can be linked to CrazyGames user)

## ✅ Progress Saving

### Option 1: CrazyGames Data Module (Frontend)
- Frontend can use CrazyGames SDK Data module
- No backend changes needed

### Option 2: Backend Storage ✅
- **Implementation**: 
  - Game sessions store progress
  - Scores linked to users
  - Leaderboard tracks user progress
  - All linked via `crazygames_user_id`

## ✅ API Endpoints for CrazyGames

### Register/Login User
```
POST /api/v1/crazygames/register-login
{
  "crazygames_user_id": "cg_user_12345",
  "username": "PlayerName" // optional
}
```

### Get User by CrazyGames ID
```
GET /api/v1/crazygames/user/{crazygames_user_id}
```

### Create Game Session (with CrazyGames user)
```
POST /api/v1/game-session
{
  "crazygames_user_id": "cg_user_12345",
  "level_reached": 5,
  "final_score": 1000,
  "words_found": 10
}
```

### Submit Score (with CrazyGames user)
```
POST /api/v1/scores
{
  "game_session_id": "uuid",
  "crazygames_user_id": "cg_user_12345",
  "word": "EXAMPLE",
  "points": 100,
  "level": 5,
  "word_type": "normal"
}
```

## ✅ Database Schema

### Users Table
- `crazygames_user_id` (nullable, unique) - Links to CrazyGames account
- Supports both CrazyGames users and admin users

### Game Sessions Table
- `crazygames_user_id` (nullable) - Links session to CrazyGames user
- `user_id` (nullable) - Links to our user table
- `session_token` - For anonymous sessions

## ✅ Frontend Integration Guide

### Step 1: Get CrazyGames User ID
```javascript
import { CrazyGames } from '@crazygames/sdk';

// Get user ID from SDK
const userId = await CrazyGames.user.getUserId();
const username = await CrazyGames.user.getUsername();
```

### Step 2: Register/Login User
```javascript
// If user is logged into CrazyGames
if (userId) {
  const response = await fetch('http://192.168.0.153:8000/api/v1/crazygames/register-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      crazygames_user_id: userId,
      username: username
    })
  });
  
  const { data } = await response.json();
  // Store data.user_id for future requests
}
```

### Step 3: Create Game Session
```javascript
const sessionResponse = await fetch('http://192.168.0.153:8000/api/v1/game-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    crazygames_user_id: userId, // From SDK, or null for guest
    level_reached: currentLevel,
    final_score: currentScore,
    words_found: wordsFound
  })
});
```

### Step 4: Submit Scores
```javascript
await fetch('http://192.168.0.153:8000/api/v1/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    game_session_id: sessionId,
    crazygames_user_id: userId, // Optional
    word: foundWord,
    points: points,
    level: currentLevel,
    word_type: 'normal'
  })
});
```

## ✅ Compliance Status

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Automatic user registration | ✅ | `CrazyGamesService::getOrCreateUser()` |
| Guest/anonymous play | ✅ | Session-based, no user required |
| Link progress to CrazyGames user | ✅ | `crazygames_user_id` in sessions/scores |
| No external login | ✅ | Only session + CrazyGames |
| Progress saving | ✅ | Backend storage + optional SDK Data module |

## 📝 Notes

1. **User Creation**: Users are auto-created when `crazygames_user_id` is provided
2. **Guest Mode**: Fully supported - sessions work without any user ID
3. **Email**: Placeholder email (`{crazygames_user_id}@crazygames.local`) since CrazyGames doesn't provide email
4. **Password**: Random password generated (not used for login, only for database structure)

## 🔗 References

- [CrazyGames Account Integration](https://docs.crazygames.com/requirements/account-integration/)
- [CrazyGames SDK User Module](https://docs.crazygames.com/sdk/user/)
- [CrazyGames SDK Data Module](https://docs.crazygames.com/sdk/data/)
