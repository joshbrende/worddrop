# Game Architecture Overview

## High-Level Architecture

WordDROP is a **falling-block word puzzle game** built with React + TypeScript. The architecture follows a component-based structure with clear separation of concerns.

## Architecture Pattern

### 1. **Component Hierarchy**
```
App (Root)
├── Context Providers (Auth, Settings, Display, Theme, Animation)
├── AppRoutes
│   ├── Protected Routes (require authentication)
│   ├── Public Routes (signin, signup)
│   ├── Game Routes (/game)
│   └── Admin Routes (/admin)
└── GameBoard (Main Game Component)
    ├── Game State Management
    ├── Letter Falling System
    ├── Word Detection System
    ├── Power-Up System
    ├── Trivia System
    └── UI Components (HUD, Menus, Animations)
```

### 2. **State Management Strategy**

**Primary Approach**: React Context + useState/useReducer
- **AuthContext**: User authentication state
- **SettingsContext**: Game settings (sound, music, vibration)
- **DisplayContext**: Theme and display preferences
- **AnimationContext**: Animation state
- **Local Component State**: Game-specific state in GameBoard

**State Flow**:
1. User actions trigger callbacks
2. Callbacks update component state
3. State changes trigger re-renders
4. Effects respond to state changes (gravity, word checking, etc.)

### 3. **Service Layer Pattern**

All external dependencies and utilities are abstracted into services:

- **DictionaryService**: Word validation (loads dictionary, validates words)
- **SoundService**: Audio playback (effects, music)
- **AnalyticsService**: Game analytics tracking
- **LeaderboardService**: Score submission and retrieval
- **UserService**: User profile management
- **AchievementService**: Achievement tracking
- **NotificationService**: Push notifications
- **DatabaseService**: Supabase database operations

### 4. **Game Loop Architecture**

```
Game Initialization
  ↓
Dictionary Load (async)
  ↓
First Letter Spawn
  ↓
[GAME LOOP]
  ↓
Letter Falls (timer-based)
  ↓
User Input (move/drop)
  ↓
Letter Lands
  ↓
Word Detection (horizontal + vertical)
  ↓
Word Validation (dictionary + special words)
  ↓
Scoring + Animations
  ↓
Gravity Application
  ↓
New Letter Spawn
  ↓
[Repeat until Game Over]
```

### 5. **Data Flow**

**Unidirectional Data Flow**:
- Props flow down from parent to child
- Events/callbacks flow up from child to parent
- Context provides shared state across component tree
- Services handle side effects (API calls, localStorage, etc.)

**Example Flow**:
```
User presses key → handleKeyDown → update position state → 
useEffect detects position change → check collision → 
update board → check words → score → update score state → 
trigger animations → apply gravity → spawn new letter
```

## Key Design Decisions

### 1. **Why React Context over Redux?**
- Simpler for this game's complexity
- Less boilerplate
- Built-in React support
- Sufficient for the state requirements

### 2. **Why Service Layer?**
- Separation of concerns
- Easy to mock for testing
- Can swap implementations (e.g., different dictionary sources)
- Centralized error handling

### 3. **Why TypeScript?**
- Type safety for game logic
- Better IDE support
- Prevents runtime errors
- Self-documenting code

### 4. **Why Vite over Create React App?**
- Faster build times
- Better HMR (Hot Module Replacement)
- Modern tooling
- Smaller bundle size

## Component Communication

### Parent → Child
- Props (data and callbacks)
- Context (shared state)

### Child → Parent
- Callback functions passed as props
- Context updates (via hooks)

### Sibling Components
- Shared context
- Event bus (rare, not used in current implementation)

## Performance Optimizations

1. **Memoization**: React.memo, useMemo, useCallback
2. **Code Splitting**: Lazy loading routes
3. **Asset Optimization**: Image compression, sound file optimization
4. **Bundle Splitting**: Vendor chunks, UI chunks, game chunks
5. **Debouncing**: Input handlers debounced to prevent excessive updates

## Error Handling Strategy

1. **Try-Catch**: Service methods wrapped in try-catch
2. **Error Boundaries**: React error boundaries for component errors
3. **Fallbacks**: Backup dictionary, fallback sounds, default values
4. **Logging**: Console logging for debugging (can be replaced with analytics)

## Dependency Injection

Services are exported as singletons:
```typescript
// Services are singletons
export default new DictionaryService();
```

Benefits:
- Single instance across app
- Easy to access anywhere
- Centralized initialization
- Memory efficient

## Future Architecture Considerations

For CrazyGames adaptation:
- Remove Supabase dependency (make optional)
- Add CrazyGames SDK integration
- Implement sitelock/whitelisting
- Optimize bundle size (target <20MB initial)
- Remove unnecessary features (admin panel, debug routes)
