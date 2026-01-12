# Technology Stack for WordDROP Rebuild

Complete overview of technologies, frameworks, and tools used to build the game.

## Core Technology Stack

### Frontend Framework
- **React 18.2+** - UI library for building component-based interfaces
- **TypeScript 5.2+** - Type-safe JavaScript for better code quality
- **React DOM** - React renderer for web browsers

### Build Tool
- **Vite 6.3+** - Fast build tool and dev server
  - Hot Module Replacement (HMR) for instant updates
  - Fast builds and optimized production bundles
  - Native ES modules support

### Routing
- **React Router DOM 6.22+** - Client-side routing
  - Simplified routing for single-page application
  - Minimal bundle size (~15KB)

---

## Styling & UI

### CSS (Primary)
- **Pure CSS / CSS Modules** - Main styling approach
  - Custom CSS with cyberpunk theme
  - CSS animations (0KB bundle impact)
  - CSS transitions for smooth effects
  - Responsive design with CSS Grid & Flexbox
  - **No CSS frameworks** (Tailwind, Bootstrap, etc.)

### Why No UI Libraries?
- **Removed:** Material-UI (MUI) - saves ~200KB+
- **Reason:** Custom cyberpunk design requires custom components
- **Alternative:** Build custom components with CSS

---

## State Management

### React Built-in
- **React Context API** - Global state (settings, theme)
- **useState** - Local component state
- **useReducer** - Complex state logic (game state)
- **Custom Hooks** - Reusable state logic
  - `useGameState` - Game state management
  - `useGameLoop` - Game loop logic
  - `useKeyboard` - Keyboard input handling

### Why No External State Management?
- **Not using:** Redux, Zustand, Jotai
- **Reason:** React's built-in tools are sufficient for this game
- **Benefit:** Smaller bundle, simpler code

---

## Animation Strategy

### Primary: CSS Animations
- **CSS @keyframes** - All game animations
  - Word disappearing
  - Score popups
  - Power-up effects
  - Level up animations
- **CSS Transitions** - Smooth state changes
- **Bundle Size:** 0 KB (native browser feature)

### Optional (Sparingly)
- **Canvas 2D API** - Lightweight particle effects (~2KB custom implementation)
- **Lottie** - Only for complex animations CSS can't handle (~50KB + JSON files)
  - Usage: Only if absolutely necessary

### Removed
- **Framer Motion** - Removed (saves ~80KB)
- **Three.js** - Removed (saves ~500KB)

---

## Game Logic Architecture

### Core Game Engine (Framework-Agnostic)
- **Pure TypeScript classes** - Game logic separate from React
  - `GameEngine` - Main game loop
  - `Board` - Board state management
  - `WordDetector` - Word detection algorithm
  - `Gravity` - Physics system
  - `Scoring` - Score calculation

### Why Framework-Agnostic?
- **Testable:** Easier to unit test
- **Maintainable:** Game logic separate from UI
- **Portable:** Could work with other frameworks if needed

---

## Services Layer

### Core Services
- **DictionaryService** - Word validation (loads from CSV)
- **SoundService** - Audio playback (sound effects, music)
- **CrazyGamesService** - CrazyGames SDK integration
- **StorageService** - LocalStorage wrapper for game data

### Removed Services
- **Supabase** - Removed (no backend needed for CrazyGames)
- **AnalyticsService** - Removed (CrazyGames has own analytics)
- **LeaderboardService** - Removed (no backend)

---

## Development Tools

### Code Quality
- **TypeScript** - Type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks (pre-commit checks)

### Testing
- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Target:** >90% code coverage for core game logic

### Build Tools
- **Vite** - Build and bundling
- **Terser** - JavaScript minification
- **CSS Minification** - Built into Vite

---

## Asset Management

### Audio
- **MP3/OGG files** - Sound effects and background music
- **Optimization:** Compressed to 48-64kbps
- **Target:** < 2MB total

### Images
- **SVG/WebP/PNG** - UI elements, icons
- **Optimization:** Compressed, WebP preferred
- **Target:** < 500KB total

### Animations
- **Lottie JSON** - Complex animations (optional)
- **CSS** - All game animations (primary)
- **Target:** Use CSS first, Lottie only if needed

### Data
- **Dictionary CSV** - Converted to TypeScript array
- **Target:** 2000-5000 common words (< 100KB)

---

## Third-Party Integrations

### Required
- **CrazyGames SDK** - Platform integration
  - `CrazyGames.SDK.init()`
  - `game.gameplayStart()`
  - `game.gameplayStop()`
  - `data.setItem()` / `data.getItem()`

### Removed
- **Supabase** - No backend needed
- **Vercel Analytics** - CrazyGames has own analytics
- **React Query** - No server state needed

---

## Bundle Optimization

### Code Splitting
```typescript
// Manual chunks for optimal loading
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-router': ['react-router-dom'],
  'game-core': ['./src/core'],
  'services': ['./src/services'],
}
```

### Tree Shaking
- Automatic removal of unused code
- ES modules for better tree shaking
- Vite handles this automatically

### Minification
- **Terser** - JavaScript minification
- **CSS minification** - Built into Vite
- **Asset optimization** - Image/audio compression

---

## Browser Compatibility

### Target Browsers (CrazyGames Requirements)
- **Chrome** (latest)
- **Edge** (latest)
- **Safari** (latest)
- **Chromebook** browsers

### Polyfills
- **None required** - Modern browsers support all features
- **If needed:** Use Vite's automatic polyfills

---

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run linting
npm run lint
```

### Project Structure
```
worddrop-crazygames/
├── src/
│   ├── core/              # Framework-agnostic game logic
│   ├── components/        # React UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # External services
│   ├── utils/            # Pure utility functions
│   ├── constants/        # Game constants
│   ├── types/            # TypeScript types
│   └── styles/           # CSS files
├── public/               # Static assets
│   ├── sounds/
│   ├── images/
│   └── lottie/
├── dist/                 # Build output (generated)
└── tests/                # Test files
```

---

## Bundle Size Targets

### Initial Download
- **Target:** < 20MB
- **Current estimate:** ~5-8MB (with optimizations)

### Total Assets
- **Target:** < 250MB
- **Breakdown:**
  - JavaScript: ~500KB (gzipped)
  - CSS: ~50KB (gzipped)
  - Images: ~500KB
  - Audio: ~2MB
  - Lottie: ~200KB (if used)
  - Dictionary: ~100KB

### File Count
- **Target:** < 1500 files
- **Minimization strategy:**
  - Bundle JavaScript
  - Combine CSS files
  - Optimize assets

---

## Why This Stack?

### Performance
- ✅ **Fast builds** (Vite)
- ✅ **Small bundle** (minimal dependencies)
- ✅ **60 FPS** (CSS animations, optimized React)
- ✅ **Fast load times** (code splitting, optimization)

### Developer Experience
- ✅ **Type safety** (TypeScript)
- ✅ **Fast iteration** (HMR)
- ✅ **Good tooling** (ESLint, Prettier)
- ✅ **Easy testing** (Vitest)

### Maintainability
- ✅ **Clean architecture** (separation of concerns)
- ✅ **Framework-agnostic core** (easy to test)
- ✅ **Small dependency footprint** (less to maintain)
- ✅ **Well-documented** (TypeScript types serve as documentation)

### CrazyGames Requirements
- ✅ **No backend** (pure frontend)
- ✅ **Static hosting** (just HTML/CSS/JS)
- ✅ **Small bundle** (< 20MB)
- ✅ **Browser compatible** (Chrome, Edge, Safari)

---

## Technology Decisions Summary

| Category | Choice | Reason | Bundle Impact |
|----------|--------|--------|---------------|
| **Framework** | React 18 | Industry standard, great DX | ~130KB |
| **Language** | TypeScript | Type safety, better DX | Build-time only |
| **Build Tool** | Vite | Fast, modern, optimized | Build-time only |
| **Styling** | Pure CSS | Zero bundle, full control | 0KB |
| **Animations** | CSS | GPU-accelerated, 0KB | 0KB |
| **State** | React Context | Built-in, no deps | 0KB |
| **Routing** | React Router | Small, essential | ~15KB |
| **UI Library** | None | Custom design, save 200KB+ | 0KB saved |
| **Backend** | None | CrazyGames doesn't need it | ~100KB saved |
| **3D Graphics** | None | 2D game, save 500KB+ | ~500KB saved |

**Total Core Bundle:** ~145KB (React + Router)
**Total Saved:** ~880KB+ by removing unnecessary libraries

---

## Comparison: Current vs. Rebuild

### Current Example Stack
- React + TypeScript + Vite ✅
- Material-UI (MUI) ❌ Remove
- Supabase ❌ Remove
- Framer Motion ❌ Remove
- Three.js ❌ Remove
- React Query ❌ Remove
- PWA plugins ❌ Remove
- **Total dependencies:** ~40 packages
- **Estimated bundle:** ~1-2MB+ (unoptimized)

### Rebuild Stack
- React + TypeScript + Vite ✅
- Pure CSS ✅
- React Router ✅
- Custom services ✅
- **Total dependencies:** ~10-15 packages
- **Target bundle:** ~500KB (optimized)

**Result:** Cleaner, faster, smaller, more maintainable game.

---

## Final Technology Stack

```
┌─────────────────────────────────────────┐
│         WordDROP Game Stack             │
├─────────────────────────────────────────┤
│                                         │
│  Core Framework                         │
│  ├─ React 18.2+                        │
│  ├─ TypeScript 5.2+                    │
│  └─ React DOM                          │
│                                         │
│  Build & Dev                            │
│  ├─ Vite 6.3+                          │
│  ├─ ESLint                             │
│  └─ Vitest                             │
│                                         │
│  Routing                                │
│  └─ React Router DOM 6.22+             │
│                                         │
│  Styling                                │
│  ├─ Pure CSS                           │
│  ├─ CSS Animations                     │
│  └─ CSS Modules                        │
│                                         │
│  Game Logic                             │
│  ├─ Framework-agnostic TypeScript      │
│  ├─ Custom React Hooks                 │
│  └─ Service Layer                      │
│                                         │
│  Integrations                           │
│  └─ CrazyGames SDK                     │
│                                         │
│  Assets                                 │
│  ├─ Optimized Audio (MP3)              │
│  ├─ Optimized Images (WebP/SVG)        │
│  └─ Lottie JSON (optional)             │
│                                         │
└─────────────────────────────────────────┘
```

**Core Philosophy:** Minimal dependencies, maximum performance, clean architecture.
