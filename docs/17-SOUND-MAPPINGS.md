# Sound Mappings Documentation

## Overview
This document maps sound files from `public/assets/sounds/` to game activities.

## Sound File Mappings

### UI Sounds
- **menu.mp3** / **loop_menu.mp3**: Menu background music (looping)
- **button.mp3** / **button_press.mp3**: Button press sound (all buttons)
- **error.mp3**: Error sound (invalid actions, failures)

### Game Background Music
- **music.mp3** / **in-game.mp3**: Background music during gameplay (looping)

### Word Formation
- **word-formed.mp3**: Sound when a word is formed (single word)
- **combo.mp3**: Sound when combo words are formed (multiple words in sequence, comboCount > 1)

### Level Progression
- **level_up.mp3**: Sound when level-up banner appears

### Letter Movement
- **move.mp3**: Sound when letter moves left/right
- **letter_drop.mp3**: Sound when letter drops (manual drop/spacebar)

### Power-Ups
- **bomb.mp3**: Bomb power-up explosion sound
- **lightning.mp3**: Lightning power-up sound
- **freeze.mp3**: Freeze power-up sound
- **wind.mp3**: Wind power-up sound

### Game State
- **game_over.mp3**: Sound when game over occurs

### Additional Sounds (Not Yet Used)
- **career-mode.mp3**: Future career mode
- **career-timer.mp3**: Career mode timer
- **time-trial.mp3**: Future time trial mode
- **timer.mp3**: Timer sound

## Integration Points

### 1. MenuScreen (`src/components/MenuScreen.tsx`)
- **menu.mp3**: Play when menu screen loads (background music, looping)
- **button.mp3**: Play when any button is clicked

### 2. LevelUpBanner (`src/components/LevelUpBanner.tsx`)
- **level_up.mp3**: Play when banner appears

### 3. GameEngine (`src/core/GameEngine.ts`)
- **word-formed.mp3**: Play when word is detected and removed
- **combo.mp3**: Play when comboCount > 1 (multiple words detected)
- **game_over.mp3**: Play when game over occurs
- **bomb.mp3**: Play when bomb power-up explodes
- **lightning.mp3**: Play when lightning power-up is used
- **freeze.mp3**: Play when freeze power-up is used
- **wind.mp3**: Play when wind power-up is used
- **letter_drop.mp3**: Play when letter drops manually
- **move.mp3**: Play when letter moves left/right

### 4. PowerUps Component (`src/components/PowerUps.tsx`)
- **button.mp3**: Play when power-up button is clicked (before power-up is used)

### 5. GameBoard (`src/components/GameBoard.tsx`)
- **music.mp3**: Play background music when game starts
- **move.mp3**: Play when move controls are used (optional - already in GameEngine)
- **letter_drop.mp3**: Play when drop control is used (optional - already in GameEngine)

## Sound Service

All sounds are managed through `SoundService` singleton (`src/services/SoundService.ts`):

```typescript
import soundService from '../services/SoundService';
import { SOUND_MAPPINGS } from '../constants/sounds';

// Play a sound
soundService.play(SOUND_MAPPINGS.LEVEL_UP);

// Play background music
soundService.playBackgroundMusic(SOUND_MAPPINGS.MENU_BACKGROUND);

// Stop background music
soundService.stopBackgroundMusic();

// Control sound
soundService.setSoundEnabled(true);
soundService.setMusicVolume(0.5);
soundService.setEffectsVolume(0.7);
```

## Notes

- All sounds are relative to `public/assets/sounds/`
- Sound service must be initialized before use (auto-initialized on first play)
- Browser autoplay policies require user interaction before sounds can play
- Sounds respect user settings (volume, enabled/disabled)
- Settings are saved to localStorage