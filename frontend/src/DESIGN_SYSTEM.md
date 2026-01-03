# Fleet Management System - Apple Music Inspired Design

## Design System Overview

This Fleet Management System features an elegant, modern design inspired by Apple Music's sophisticated aesthetic. The interface combines glassmorphism effects, refined typography, smooth animations, and full dark/light mode support.

## Key Design Features

### 🎨 Color Palette
- **Light Mode**: Clean whites with subtle grays, vibrant blue primary (#007aff)
- **Dark Mode**: Deep blacks with refined grays, bright blue primary (#0a84ff)
- Consistent color variables that automatically adapt to theme

### ✨ Visual Effects
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur
- **Smooth Transitions**: 200-300ms cubic-bezier animations
- **Soft Shadows**: Layered shadow system for depth
- **Rounded Corners**: 12-16px border radius for modern feel

### 🎯 Components
All UI components have been enhanced with:
- Rounded borders (rounded-xl)
- Subtle hover effects
- Smooth transitions
- Proper focus states
- Theme-aware colors

### 🌓 Dark Mode
- Automatic system preference detection
- Manual toggle with smooth transitions
- Persistent theme selection (localStorage)
- Theme-aware chart colors

## Theme Toggle

Click the sun/moon icon in the top navigation to switch between light and dark modes. Your preference is automatically saved.

## Typography
- System font stack: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
- Antialiased text rendering
- Tight letter spacing for headings
- Comfortable line height for body text

## Spacing
- Consistent 4px/8px base unit
- Generous padding for cards (24px)
- Balanced whitespace throughout

## Best Practices
- Use CSS variables for colors (var(--color-primary))
- Apply 'glass' class for glassmorphism effect
- Use theme-aware chart colors (var(--color-chart-1))
- Maintain consistent border radius (rounded-xl)
