# Build Configuration Documentation

Complete guide to build configuration, optimization, and deployment settings.

## Vite Configuration

### Current Configuration (`vite.config.ts`)

The current Vite config includes:
- React plugin
- PWA plugin (remove for CrazyGames)
- Node polyfills
- Code splitting (manual chunks)
- Environment variable handling
- Supabase URL patterns

### Key Configuration Sections

#### 1. Base Path
```typescript
base: '/',
```
- **Purpose**: Base public path when served
- **For CrazyGames**: Keep as `/` (relative paths)
- **Important**: Never use absolute URLs

#### 2. Plugins

**Current Plugins:**
1. `react()` - React support (keep)
2. `nodePolyfills()` - Node.js polyfills (check if needed)
3. `VitePWA()` - PWA support (remove for CrazyGames)

**Recommended for CrazyGames:**
```typescript
plugins: [
  react(),
  // Remove VitePWA
  // Remove nodePolyfills if not needed
]
```

#### 3. Build Configuration

**Current Settings:**
```typescript
build: {
  outDir: 'dist',
  sourcemap: mode === 'development',
  minify: 'terser',
  cssMinify: true,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        game: ['three', 'framer-motion']
      }
    }
  }
}
```

**Optimized for CrazyGames:**
```typescript
build: {
  outDir: 'dist',
  sourcemap: false, // Disable source maps in production (smaller bundle)
  minify: 'terser', // Good minifier
  cssMinify: true,
  // Increase chunk size warning limit
  chunkSizeWarningLimit: 1000, // Warn if chunk > 1MB
  // Optimize asset handling
  assetsInlineLimit: 4096, // Inline assets < 4KB as base64
  // Better code splitting
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        // Split node_modules into separate chunks
        if (id.includes('node_modules')) {
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          return 'vendor-other';
        }
        // Split game logic from UI
        if (id.includes('components/GameBoard')) {
          return 'game-core';
        }
        if (id.includes('components/')) {
          return 'ui-components';
        }
      },
      // Optimize chunk file names
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',
      assetFileNames: (assetInfo) => {
        const info = assetInfo.name.split('.');
        const ext = info[info.length - 1];
        if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
          return `images/[name]-[hash][extname]`;
        }
        if (/mp3|wav|ogg|m4a/i.test(ext)) {
          return `sounds/[name]-[hash][extname]`;
        }
        return `assets/[name]-[hash][extname]`;
      }
    }
  }
}
```

### 4. Path Aliases

**Current:**
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

**Keep**: This is good for cleaner imports
- Allows `import Component from '@/components/Component'`
- Instead of `import Component from '../../components/Component'`

### 5. Environment Variables

**Current:**
```typescript
define: {
  'process.env.NODE_ENV': JSON.stringify(mode),
  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
  // ... more Supabase vars
}
```

**For CrazyGames (remove Supabase vars):**
```typescript
define: {
  'process.env.NODE_ENV': JSON.stringify(mode),
  // Remove Supabase-related variables
  // Add feature flags instead
  'import.meta.env.VITE_ENABLE_ANALYTICS': 'false',
}
```

### 6. Server Configuration

**Current:**
```typescript
server: {
  port: 5173,
  host: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    // CORS headers
  }
}
```

**For CrazyGames**: Keep for development, but these don't affect production build

## TypeScript Configuration

### Current Configuration (`tsconfig.json`)

**Key Settings:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**For CrazyGames**: Keep this configuration, it's already optimized.

**Remove from types:**
- `workbox-*` types (if removing PWA)
- `@supabase/supabase-js` types (if removing Supabase)

## Package.json Scripts

### Current Scripts
```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "tsc && vite build --mode production",
    "build:dev": "tsc && vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest --mode development"
  }
}
```

### Recommended for CrazyGames

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "tsc && vite build --mode production",
    "build:analyze": "tsc && vite build --mode production && vite-bundle-visualizer",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "check-size": "npm run build && du -sh dist && find dist -type f | wc -l"
  }
}
```

## Build Optimization Strategies

### 1. Code Splitting

**Goal**: Split code into smaller chunks that load on demand

**Strategy:**
- Split vendor code (react, react-dom) into separate chunk
- Split game logic from UI components
- Lazy load routes that aren't immediately needed

**Implementation:**
```typescript
// Lazy load routes
import { lazy, Suspense } from 'react';

const HowToPlay = lazy(() => import('./pages/HowToPlay'));
const Settings = lazy(() => import('./pages/Settings'));

// In router
<Suspense fallback={<Loading />}>
  <Route path="/how-to-play" element={<HowToPlay />} />
</Suspense>
```

### 2. Tree Shaking

**Automatic in Vite**: Unused code is automatically removed

**To maximize tree shaking:**
- Use ES modules (not CommonJS)
- Import only what you need: `import { Button } from 'library'` not `import * from 'library'`
- Avoid side effects in module-level code

### 3. Asset Optimization

**Images:**
- Use WebP format (smaller than PNG/JPG)
- Compress images before adding to project
- Use appropriate sizes (don't use 2000px image for 200px display)

**Sounds:**
- Compress MP3 files (lower bitrate)
- Keep files short (effects < 2s, music loops < 30s)
- Consider using OGG Vorbis (smaller than MP3)

**Fonts:**
- Use system fonts when possible
- If custom fonts, use WOFF2 format
- Subset fonts (only include needed characters)

### 4. Minification

**Current**: Uses Terser (good choice)

**Terser Options** (can add to vite.config.ts):
```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true, // Remove console.log in production
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info'], // Remove specific functions
    },
    format: {
      comments: false, // Remove comments
    }
  }
}
```

### 5. Compression (Gzip/Brotli)

**Server-side**: Enable gzip/brotli compression on hosting server
- Vite doesn't compress, server handles it
- Most CDNs (including CrazyGames hosting) automatically compress

## Bundle Size Analysis

### Tools for Analysis

1. **vite-bundle-visualizer**:
```bash
npm install -D vite-bundle-visualizer
```

Add to vite.config.ts:
```typescript
import { visualizer } from 'vite-bundle-visualizer';

plugins: [
  // ... other plugins
  visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true,
  })
]
```

2. **Manual Analysis**:
```bash
npm run build
cd dist
du -sh *  # Check sizes
find . -type f -exec du -h {} + | sort -rh | head -20  # Largest files
```

### Target Sizes

**Initial Bundle (for CrazyGames < 20MB target):**
- JavaScript: < 500KB (gzipped)
- CSS: < 100KB (gzipped)
- Assets (images, sounds): < 15MB
- Dictionary: < 500KB
- **Total: < 20MB** ✅

**Total Build Size (target < 250MB):**
- All files combined: < 50MB (well under 250MB)

## Environment Configuration

### Development vs Production

**Development Mode:**
- Source maps enabled
- Verbose logging
- Hot module replacement
- Larger bundle (not optimized)

**Production Mode:**
- Source maps disabled (or separate)
- Minimal logging
- Full optimization
- Smaller bundle

### Feature Flags

Create `src/config/features.ts`:
```typescript
export const FEATURES = {
  ENABLE_SUPABASE: import.meta.env.VITE_ENABLE_SUPABASE === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',
};
```

Use in code:
```typescript
if (FEATURES.ENABLE_SUPABASE) {
  // Supabase code
} else {
  // localStorage fallback
}
```

## Recommended Vite Config for CrazyGames

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    }
  },
  
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }
});
```

## Build Commands

### Development
```bash
npm run dev
# Starts dev server on http://localhost:5173
```

### Production Build
```bash
npm run build
# Builds to dist/ folder
# Run TypeScript compiler first (tsc)
# Then Vite build
```

### Preview Build
```bash
npm run preview
# Preview production build locally
# Useful for testing before deployment
```

### Check Bundle Size
```bash
npm run build
du -sh dist/
find dist -type f | wc -l  # File count
```

## Deployment Checklist

Before deploying to CrazyGames:

- [ ] Build succeeds without errors
- [ ] TypeScript compilation passes (`tsc`)
- [ ] No console errors in browser
- [ ] Bundle size < 20MB initial download
- [ ] File count < 1500
- [ ] All paths are relative (no absolute URLs)
- [ ] Source maps disabled in production (or separate)
- [ ] Unused code removed (tree shaking)
- [ ] Assets optimized (compressed images, sounds)
- [ ] `gameplayStart` event triggers correctly
- [ ] Game works in all target browsers

## Troubleshooting

### Build Errors

**TypeScript Errors:**
- Run `tsc` separately to see detailed errors
- Fix type errors before building

**Import Errors:**
- Check path aliases are correct
- Ensure all imports use correct paths

**Asset Errors:**
- Check asset paths are relative
- Verify assets exist in `public/` folder

### Bundle Size Issues

**Too Large:**
1. Check bundle analysis (visualizer)
2. Remove unused dependencies
3. Enable better code splitting
4. Compress assets more
5. Remove source maps

### Performance Issues

**Slow Build:**
- Disable source maps in dev (if not debugging)
- Reduce file watching scope
- Use faster machine or increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096`

## Notes

- Vite automatically handles most optimizations
- Production builds are always optimized
- Development builds prioritize speed over size
- Test production builds locally before deploying
- Use bundle analyzer to find optimization opportunities
