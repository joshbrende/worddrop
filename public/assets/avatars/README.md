# WordDROP Avatar System

This directory contains SVG avatars available for players to select in the profile system.

## Available Avatars

| ID | File | Description |
|----|------|-------------|
| cyber1 | cyber-hacker.svg | Cyber-themed avatar with a diamond shape and technical design |
| cyber2 | cyber-ninja.svg | Cyber-themed avatar with ninja-inspired elements |
| cyber3 | cyber-samurai.svg | Cyber-themed avatar with samurai-inspired elements |
| cyber4 | cyber-agent.svg | Cyber-themed avatar with agent/spy aesthetics |
| cyber5 | cyber-punk.svg | Cyber-themed avatar with punk aesthetics |
| robot | robot.svg | Blue robot with mechanical features |
| ninja | ninja.svg | Dark-themed ninja avatar with mask |

## Avatar Specifications

- Format: SVG
- Dimensions: 200x200 viewBox
- Style: Consistent with game's cyber aesthetic
- Colors: Coordinated with game's color scheme (cyan, dark blues, etc.)

## Adding New Avatars

When creating new avatars:

1. Follow the same 200x200 viewBox dimensions
2. Use gradients and styling consistent with existing avatars
3. Update the avatar arrays in:
   - `src/components/profile/AvatarSelector.tsx`
   - `src/pages/PlayerProfile.tsx`
4. Ensure each avatar has a unique ID 