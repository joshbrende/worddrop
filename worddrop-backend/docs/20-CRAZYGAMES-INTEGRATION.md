# CrazyGames SDK Integration Guide

## Overview

This document outlines the backend changes required to comply with [CrazyGames SDK requirements](https://docs.crazygames.com/#launching-on-crazygames).

## Key Requirements

### 1. Account Integration ✅
- **Requirement**: Link user data to CrazyGames `userId` from SDK
- **Status**: Implemented
- **Details**: 
  - Users table includes `crazygames_user_id` field
  - Game sessions can be linked to CrazyGames users
  - Supports both CrazyGames users and anonymous/guest players

### 2. Guest/Anonymous Play ✅
- **Requirement**: Allow guest users to play without registration
- **Status**: Already supported via `session_token`
- **Details**: Game sessions work with or without `user_id` or `crazygames_user_id`

### 3. Progress Saving ✅
- **Requirement**: Link user progress to CrazyGames `userId`
- **Status**: Implemented
- **Details**: 
  - Game sessions store `crazygames_user_id`
  - Scores linked to CrazyGames users
  - Leaderboard supports CrazyGames users

### 4. No External Login ✅
- **Requirement**: No Facebook/Google login within game
- **Status**: Compliant - Only session-based and CrazyGames userId

## Backend Changes Made

### Database Schema
- Added `crazygames_user_id` to `users` table (nullable, unique)
- Added `crazygames_user_id` to `game_sessions` table (nullable)

### API Endpoints Updated
- `POST /api/v1/game-session` - Accepts `crazygames_user_id`
- `POST /api/v1/scores` - Links scores to CrazyGames users
- `GET /api/v1/leaderboard` - Works with CrazyGames users

### User Model
- Added `crazygames_user_id` field
- Added method to find/create user by CrazyGames ID

## Frontend Integration

The React frontend should:

1. **Get CrazyGames User ID**:
```javascript
// In your React game
import { CrazyGames } from '@crazygames/sdk';

const userId = await CrazyGames.user.getUserId();
```

2. **Send to Backend**:
```javascript
// When creating game session
POST /api/v1/game-session
{
  "crazygames_user_id": userId, // From SDK
  "level_reached": 5,
  "final_score": 1000,
  "words_found": 10
}
```

3. **Handle Guest Mode**:
```javascript
// If userId is null/undefined, use session_token only
// Backend supports both modes
```

## Testing

### Test with CrazyGames User
```bash
POST http://192.168.0.153:8000/api/v1/game-session
{
  "crazygames_user_id": "cg_user_12345",
  "level_reached": 1,
  "final_score": 0,
  "words_found": 0
}
```

### Test Guest Mode
```bash
POST http://192.168.0.153:8000/api/v1/game-session
{
  "level_reached": 1,
  "final_score": 0,
  "words_found": 0
}
```

## Compliance Checklist

- [x] Support CrazyGames `userId` in backend
- [x] Allow anonymous/guest play
- [x] Link game progress to CrazyGames users
- [x] No external login systems
- [x] Session-based gameplay supported
- [x] Leaderboard works with CrazyGames users

## References

- [CrazyGames SDK Documentation](https://docs.crazygames.com/)
- [Account Integration Requirements](https://docs.crazygames.com/requirements/account-integration/)
- [SDK User Module](https://docs.crazygames.com/sdk/user/)
