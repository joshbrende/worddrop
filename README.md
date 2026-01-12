# WordDROP - CrazyGames Edition

A clean, optimized word puzzle game built for CrazyGames platform.

## Tech Stack

- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Pure CSS** - Styling (no UI frameworks)
- **Framework-agnostic core** - Game logic separate from React

## Project Structure

```
worddrop-crazygames/
├── src/
│   ├── core/              # Framework-agnostic game logic
│   │   ├── GameEngine.ts
│   │   ├── Board.ts
│   │   ├── Letter.ts
│   │   ├── WordDetector.ts
│   │   └── Gravity.ts
│   ├── components/        # React UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # External services
│   ├── utils/            # Pure utility functions
│   ├── constants/        # Game constants
│   ├── types/            # TypeScript types
│   └── styles/           # CSS files
└── public/               # Static assets
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm run test
```

## Phase 1 Status

✅ Project structure created
✅ TypeScript configuration
✅ Core game engine (framework-agnostic)
✅ React hooks for game loop
✅ Basic game board component
✅ Keyboard controls
✅ Falling letter mechanics

## Next Steps

- Phase 2: Word detection and scoring
- Phase 3: Power-ups
- Phase 4: UI/UX polish
- Phase 5: CrazyGames SDK integration
