# Dependencies Documentation

Complete analysis of all npm packages used in the WordDROP game.

## Dependency Categories

### Core Framework (Essential - Keep)

#### React
- **react** `^18.2.0` - Core React library
- **react-dom** `^18.2.0` - React DOM renderer
- **Purpose**: Core framework for building UI components
- **Size Impact**: ~130KB (gzipped)
- **Keep for CrazyGames**: ✅ Essential

#### React Router
- **react-router-dom** `^6.22.0` - Client-side routing
- **Purpose**: Navigation between pages/routes
- **Size Impact**: ~15KB (gzipped)
- **Keep for CrazyGames**: ✅ Essential (but can simplify routes)

### Build Tools (Essential - Keep)

#### Vite
- **vite** `^6.3.4` - Build tool and dev server
- **@vitejs/plugin-react** `^4.2.1` - React plugin for Vite
- **Purpose**: Fast build tool, HMR, bundling
- **Size Impact**: Build-time only (not in bundle)
- **Keep for CrazyGames**: ✅ Essential

#### TypeScript
- **typescript** `^5.2.2` - TypeScript compiler
- **Purpose**: Type safety, better IDE support
- **Size Impact**: Build-time only
- **Keep for CrazyGames**: ✅ Recommended (optional but highly recommended)

### UI Library (Consider Removing)

#### Material-UI (MUI)
- **@mui/material** `^5.15.10` - Component library
- **@mui/icons-material** `^5.15.10` - Icon library
- **@mui/x-date-pickers** `^6.19.4` - Date picker component
- **@emotion/react** `^11.14.0` - CSS-in-JS runtime
- **@emotion/styled** `^11.14.0` - Styled components
- **Purpose**: Pre-built UI components (buttons, dialogs, etc.)
- **Size Impact**: ~200KB+ (gzipped) - **LARGE**
- **Keep for CrazyGames**: ❌ Consider removing
  - **Reason**: Adds significant bundle size
  - **Alternative**: Use plain CSS or smaller CSS framework
  - **Action**: Replace with custom CSS components

### Backend/Database (Make Optional)

#### Supabase
- **@supabase/supabase-js** `^2.43.4` - Supabase client
- **@supabase/auth-ui-react** `^0.4.7` - Auth UI components
- **@supabase/auth-ui-shared** `^0.1.8` - Shared auth utilities
- **@supabase/gotrue-js** `^2.69.1` - Auth library
- **@supabase/ssr** `^0.6.1` - SSR support
- **supabase** `^2.22.6` - CLI tool (dev dependency)
- **Purpose**: Backend database, authentication, real-time features
- **Size Impact**: ~100KB+ (gzipped)
- **Keep for CrazyGames**: ❌ Remove or make optional
  - **Reason**: Not needed for static hosting
  - **Alternative**: Use localStorage for game data
  - **Action**: Remove all Supabase packages, implement localStorage fallback

### State Management (Optional)

#### TanStack Query (React Query)
- **@tanstack/react-query** `^5.18.1` - Data fetching and caching
- **Purpose**: Server state management, caching API responses
- **Size Impact**: ~15KB (gzipped)
- **Keep for CrazyGames**: ❌ Remove
  - **Reason**: Only needed for server state management
  - **Action**: Remove, use React Context + useState instead

### Analytics (Remove)

#### Vercel Analytics
- **@vercel/analytics** `^1.5.0` - Analytics tracking
- **Purpose**: Track page views and events
- **Size Impact**: ~5KB (gzipped)
- **Keep for CrazyGames**: ❌ Remove
  - **Reason**: Not needed, CrazyGames has own analytics
  - **Action**: Remove package

### Animation Libraries (Consider Optimizing)

#### Framer Motion
- **framer-motion** `^11.0.3` - Animation library
- **Purpose**: Smooth animations for UI elements
- **Size Impact**: ~50KB (gzipped) - **MODERATE**
- **Keep for CrazyGames**: ⚠️ Consider alternatives
  - **Reason**: Adds bundle size
  - **Alternative**: CSS animations, smaller animation library, or remove
  - **Action**: Evaluate if animations are essential, consider CSS-only

#### Three.js
- **three** `^0.161.0` - 3D graphics library
- **Purpose**: 3D rendering (if used for special effects)
- **Size Impact**: ~500KB+ (gzipped) - **VERY LARGE**
- **Keep for CrazyGames**: ❌ Remove if not essential
  - **Reason**: Massive bundle size
  - **Action**: Check if actually used, remove if not needed

### Utility Libraries

#### Date Handling
- **dayjs** `^1.11.10` - Date manipulation library
- **Purpose**: Format dates, calculate time differences
- **Size Impact**: ~3KB (gzipped)
- **Keep for CrazyGames**: ✅ Keep (lightweight, useful)

#### Image Generation
- **html-to-image** `^1.11.11` - Convert HTML to images
- **Purpose**: Generate images from DOM (screenshots, sharing)
- **Size Impact**: ~20KB (gzipped)
- **Keep for CrazyGames**: ⚠️ Optional
  - **Action**: Remove if not used for sharing/screenshots

#### Charts (Remove)
- **recharts** `^2.15.3` - Chart library
- **Purpose**: Display charts/graphs (stats, leaderboard)
- **Size Impact**: ~100KB+ (gzipped) - **LARGE**
- **Keep for CrazyGames**: ❌ Remove
  - **Reason**: Not essential for core gameplay
  - **Action**: Remove, use simple HTML/CSS for stats display

### PWA/Service Worker (Remove for CrazyGames)

#### PWA Plugin
- **vite-plugin-pwa** `^1.0.0` - PWA support
- **workbox-core** `^7.3.0` - Service worker core
- **workbox-precaching** `^7.3.0` - Asset precaching
- **workbox-routing** `^7.3.0` - Request routing
- **workbox-strategies** `^7.3.0` - Caching strategies
- **Purpose**: Progressive Web App features, offline support
- **Size Impact**: Service worker files (~50KB)
- **Keep for CrazyGames**: ❌ Remove
  - **Reason**: Not needed for CrazyGames hosting
  - **Action**: Remove all PWA-related packages

### Animation Assets

#### Lottie
- **@lottiefiles/react-lottie-player** `^3.6.0` - Lottie animation player
- **Purpose**: Play Lottie JSON animations
- **Size Impact**: ~30KB (gzipped)
- **Keep for CrazyGames**: ⚠️ Optional
  - **Action**: Remove if not using Lottie animations, or keep if animations are important

### Development Dependencies (Keep for Dev)

#### TypeScript Types
- **@types/react** `^18.2.55`
- **@types/react-dom** `^18.2.19`
- **@types/three** `^0.161.2`
- **@types/jsdom** `^21.1.7`
- **Purpose**: TypeScript type definitions
- **Keep**: ✅ Keep (dev only, doesn't affect bundle)

#### ESLint
- **eslint** `^8.56.0`
- **@typescript-eslint/eslint-plugin** `^6.21.0`
- **@typescript-eslint/parser** `^6.21.0`
- **eslint-plugin-react-hooks** `^4.6.0`
- **eslint-plugin-react-refresh** `^0.4.5`
- **Purpose**: Code linting and quality
- **Keep**: ✅ Keep (dev only)

#### Testing
- **vitest** `^3.1.2` - Test runner
- **Purpose**: Unit testing (if tests exist)
- **Keep**: ✅ Optional (keep if writing tests)

#### Polyfills
- **vite-plugin-node-polyfills** `^0.23.0` - Node.js polyfills for browser
- **Purpose**: Polyfill Node.js APIs in browser
- **Keep for CrazyGames**: ⚠️ Check if actually needed
  - **Action**: Remove if not using Node.js APIs

## Recommended Dependencies for CrazyGames Build

### Minimal Package.json (Essential Only)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^6.3.4",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0"
  }
}
```

**Estimated Bundle Size Reduction**: 
- Current: ~500KB+ (with all dependencies)
- Optimized: ~150KB (gzipped)
- **Savings: ~70%**

### Optional Additions (If Needed)

If animations are essential:
```json
{
  "dependencies": {
    "framer-motion": "^11.0.3"  // +50KB
  }
}
```

If using Lottie animations:
```json
{
  "dependencies": {
    "@lottiefiles/react-lottie-player": "^3.6.0"  // +30KB
  }
}
```

## Dependency Removal Checklist

### Phase 1: Remove Large Unused Dependencies
- [ ] Remove `@mui/material` and `@mui/*` packages (use CSS instead)
- [ ] Remove `three` (if not using 3D graphics)
- [ ] Remove `recharts` (use simple HTML/CSS for charts)
- [ ] Remove `html-to-image` (if not generating images)

### Phase 2: Remove Backend Dependencies
- [ ] Remove all `@supabase/*` packages
- [ ] Remove `@tanstack/react-query`
- [ ] Remove `@vercel/analytics`

### Phase 3: Remove PWA Dependencies
- [ ] Remove `vite-plugin-pwa`
- [ ] Remove all `workbox-*` packages

### Phase 4: Consider Animation Libraries
- [ ] Evaluate if `framer-motion` is needed (remove if not essential)
- [ ] Evaluate if `@lottiefiles/react-lottie-player` is needed

### Phase 5: Clean Up Dev Dependencies
- [ ] Remove `@types/three` (if removed three.js)
- [ ] Remove `vite-plugin-node-polyfills` (if not needed)
- [ ] Keep TypeScript, ESLint, Vite plugins

## Size Analysis

### Current Bundle Size Estimate (with all deps)

**Production Bundle (gzipped):**
- React + ReactDOM: ~130KB
- React Router: ~15KB
- MUI: ~200KB
- Emotion: ~20KB
- Supabase: ~100KB
- TanStack Query: ~15KB
- Framer Motion: ~50KB
- Three.js: ~500KB (if used)
- Other utilities: ~30KB
- **Total: ~1060KB+** (1MB+) ❌ Too large!

### Optimized Bundle Size (minimal deps)

**Production Bundle (gzipped):**
- React + ReactDOM: ~130KB
- React Router: ~15KB
- Dayjs: ~3KB
- **Total: ~148KB** ✅ Good!

**With Optional Additions:**
- + Framer Motion: ~50KB = **~200KB total** ✅ Still good!

## Migration Guide

### Removing Material-UI

**Before:**
```tsx
import { Button, Dialog } from '@mui/material';

<Button variant="contained">Click me</Button>
```

**After:**
```tsx
// Use plain HTML + CSS
<button className="btn btn-primary">Click me</button>
```

### Removing Supabase

**Before:**
```typescript
import { supabase } from './lib/supabase';
await supabase.from('scores').insert({ score: 100 });
```

**After:**
```typescript
// Use localStorage
const scores = JSON.parse(localStorage.getItem('scores') || '[]');
scores.push({ score: 100, timestamp: Date.now() });
localStorage.setItem('scores', JSON.stringify(scores));
```

### Removing TanStack Query

**Before:**
```tsx
const { data } = useQuery(['scores'], fetchScores);
```

**After:**
```tsx
const [scores, setScores] = useState([]);
useEffect(() => {
  const saved = localStorage.getItem('scores');
  setScores(saved ? JSON.parse(saved) : []);
}, []);
```

## Notes

- **Tree Shaking**: Vite automatically removes unused code, but removing packages entirely is better
- **Code Splitting**: Can help, but reducing dependencies is more effective
- **Bundle Analysis**: Use `vite-bundle-visualizer` to see actual bundle composition
- **Gradual Migration**: Remove dependencies one at a time, test after each removal
