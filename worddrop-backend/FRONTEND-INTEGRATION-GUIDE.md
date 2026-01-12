# Frontend Integration Guide - CrazyGames SDK

## Overview

This guide shows how to integrate your React game frontend with the Laravel backend while complying with [CrazyGames SDK requirements](https://docs.crazygames.com/requirements/account-integration/).

## Backend Base URL

- **Development**: `http://192.168.0.153:8000/api`
- **Production**: `https://worddrop.live/api`

---

## Step 1: Install CrazyGames SDK

```bash
npm install @crazygames/sdk
```

## Step 2: Initialize SDK in Your React App

```typescript
// src/services/CrazyGamesService.ts
import { CrazyGames } from '@crazygames/sdk';

class CrazyGamesService {
  private userId: string | null = null;
  private username: string | null = null;

  async initialize() {
    try {
      // Initialize SDK
      await CrazyGames.init();
      
      // Get user ID (null if guest)
      this.userId = await CrazyGames.user.getUserId();
      this.username = await CrazyGames.user.getUsername();
      
      // Register/login user with backend if logged into CrazyGames
      if (this.userId) {
        await this.registerOrLogin();
      }
      
      return { userId: this.userId, username: this.username };
    } catch (error) {
      console.error('CrazyGames SDK initialization failed:', error);
      return { userId: null, username: null };
    }
  }

  async registerOrLogin() {
    if (!this.userId) return null;

    const response = await fetch('http://192.168.0.153:8000/api/v1/crazygames/register-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crazygames_user_id: this.userId,
        username: this.username,
      }),
    });

    const data = await response.json();
    return data.data; // { user_id, crazygames_user_id, name }
  }

  getUserId() {
    return this.userId;
  }

  getUsername() {
    return this.username;
  }
}

export const crazyGamesService = new CrazyGamesService();
```

## Step 3: Use in Your Game Components

```typescript
// src/App.tsx or your main game component
import { useEffect, useState } from 'react';
import { crazyGamesService } from './services/CrazyGamesService';

function App() {
  const [crazyGamesUser, setCrazyGamesUser] = useState<any>(null);

  useEffect(() => {
    // Initialize CrazyGames SDK on mount
    crazyGamesService.initialize().then((user) => {
      setCrazyGamesUser(user);
    });
  }, []);

  // ... rest of your app
}
```

## Step 4: Create Game Session

```typescript
// When starting a new game
async function startGame() {
  const userId = crazyGamesService.getUserId();
  
  const response = await fetch('http://192.168.0.153:8000/api/v1/game-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      crazygames_user_id: userId, // null for guest users
      level_reached: 1,
      final_score: 0,
      words_found: 0,
    }),
  });

  const { data } = await response.json();
  // Store data.session_token and data.game_session_id
  return data;
}
```

## Step 5: Submit Scores

```typescript
// When player finds a word
async function submitScore(gameSessionId: string, word: string, points: number, level: number) {
  const userId = crazyGamesService.getUserId();
  
  await fetch('http://192.168.0.153:8000/api/v1/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      game_session_id: gameSessionId,
      crazygames_user_id: userId, // Optional - can be null for guests
      word: word,
      points: points,
      combo_count: 1,
      level: level,
      word_type: 'normal', // or 'word_of_day' or 'sponsor_trivia'
    }),
  });
}
```

## Step 6: Update Game Session on Game End

```typescript
// When game ends
async function endGame(sessionToken: string, finalScore: number, levelReached: number, wordsFound: number) {
  const userId = crazyGamesService.getUserId();
  
  await fetch('http://192.168.0.153:8000/api/v1/game-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_token: sessionToken,
      crazygames_user_id: userId,
      level_reached: levelReached,
      final_score: finalScore,
      words_found: wordsFound,
      duration_seconds: gameDuration,
    }),
  });
}
```

## Step 7: Get Leaderboard

```typescript
// Get leaderboard
async function getLeaderboard(type: 'all_time' | 'daily' | 'weekly' | 'monthly' = 'all_time') {
  const response = await fetch(
    `http://192.168.0.153:8000/api/v1/leaderboard?type=${type}&limit=10`
  );
  const { data } = await response.json();
  return data;
}

// Get user's position
async function getUserPosition(userId: number, type: string = 'all_time') {
  const response = await fetch(
    `http://192.168.0.153:8000/api/v1/leaderboard/user/${userId}?type=${type}`
  );
  const { data } = await response.json();
  return data;
}
```

## Step 8: Get Word of Day / Sponsor Questions

```typescript
// Get today's word of the day
async function getWordOfDay() {
  const response = await fetch('http://192.168.0.153:8000/api/v1/word-of-day');
  const { data } = await response.json();
  return data;
}

// Get random sponsor question
async function getSponsorQuestion(level: number = 1) {
  const response = await fetch(
    `http://192.168.0.153:8000/api/v1/sponsor-question?level=${level}`
  );
  const { data } = await response.json();
  return data;
}
```

## Complete Example: Game Flow

```typescript
import { crazyGamesService } from './services/CrazyGamesService';

class GameAPI {
  private baseUrl = 'http://192.168.0.153:8000/api/v1';
  private sessionToken: string | null = null;
  private gameSessionId: string | null = null;

  async initialize() {
    // Initialize CrazyGames SDK
    await crazyGamesService.initialize();
    
    // Start game session
    const session = await this.startSession();
    this.sessionToken = session.session_token;
    this.gameSessionId = session.game_session_id;
  }

  async startSession() {
    const userId = crazyGamesService.getUserId();
    
    const response = await fetch(`${this.baseUrl}/game-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crazygames_user_id: userId,
        level_reached: 1,
        final_score: 0,
        words_found: 0,
      }),
    });
    
    const { data } = await response.json();
    return data;
  }

  async submitWord(word: string, points: number, level: number, wordType: string = 'normal') {
    if (!this.gameSessionId) return;

    const userId = crazyGamesService.getUserId();
    
    await fetch(`${this.baseUrl}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_session_id: this.gameSessionId,
        crazygames_user_id: userId,
        word: word,
        points: points,
        level: level,
        word_type: wordType,
      }),
    });
  }

  async endSession(finalScore: number, levelReached: number, wordsFound: number, duration: number) {
    if (!this.sessionToken) return;

    const userId = crazyGamesService.getUserId();
    
    await fetch(`${this.baseUrl}/game-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token: this.sessionToken,
        crazygames_user_id: userId,
        level_reached: levelReached,
        final_score: finalScore,
        words_found: wordsFound,
        duration_seconds: duration,
      }),
    });
  }
}

export const gameAPI = new GameAPI();
```

## Guest Mode Support

The backend fully supports guest/anonymous play:

```typescript
// Guest users can play without CrazyGames account
// Just don't send crazygames_user_id
const session = await fetch('http://192.168.0.153:8000/api/v1/game-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // No crazygames_user_id - works as guest
    level_reached: 1,
    final_score: 0,
    words_found: 0,
  }),
});
```

## Compliance Checklist

- [x] SDK initialized on game load
- [x] User automatically registered/logged in when CrazyGames user ID available
- [x] Guest mode supported (no user ID required)
- [x] Game sessions linked to CrazyGames users
- [x] Scores submitted with CrazyGames user ID
- [x] Leaderboard works with CrazyGames users
- [x] No external login systems (Facebook/Google)

## References

- [CrazyGames SDK Documentation](https://docs.crazygames.com/)
- [Account Integration Requirements](https://docs.crazygames.com/requirements/account-integration/)
- [SDK User Module](https://docs.crazygames.com/sdk/user/)
