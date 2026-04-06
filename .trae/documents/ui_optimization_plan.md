# Plan: Duolingo-Style UI Optimization for Learning Page

## Context
The user wants to redesign the `LearningSession` page to remove the "AI-like" (generic gradient/neon) look and adopt a **Duolingo-inspired** style (Playful, Bold, Solid Colors).

## Goals
1.  **Flatten the Design**: Remove gradients and "glow" effects.
2.  **Adopt Playful Colors**: Use bright, solid colors (Green, Blue, Yellow) with high contrast.
3.  **Implement "3D" Buttons**: Add the signature "pressable" button style (solid bottom border).
4.  **Simplify Layout**: Clean up the background and spacing.

## Proposed Changes

### 1. `frontend/tailwind.config.js`
- Add custom colors for the new theme (optional, or use existing Tailwind colors).
  - `duo-green`: `#58cc02`
  - `duo-blue`: `#1cb0f6` 
  - `duo-yellow`: `#ffc800`
  - `duo-gray`: `#e5e5e5`
- Add a new box-shadow utility for the "3D" effect if needed, or just use border-bottom.

### 2. `frontend/components/Button.tsx`
- Add a new `variant` called `duo`.
- **Style**:
  - `bg-green-500` (or `duo-green`)
  - `text-white`
  - `border-b-4 border-green-600`
  - `active:border-b-0 active:translate-y-1`
  - `rounded-2xl`
  - `font-bold`
  - `uppercase tracking-wide`

### 3. `frontend/components/LearningSession.tsx`
- **Left Panel**:
  - Change background to solid **Sky Blue** (`bg-[#1cb0f6]` or `bg-sky-500`).
  - Remove the background blobs/gradients.
  - Update text to be more readable (if needed).
- **Right Panel**:
  - Change background to **White** or very light gray (`bg-white`).
  - Update the **Progress Bar** to be **Yellow** (`bg-yellow-400`) or Green.
- **Footer Buttons**:
  - "Check Answer": Use the new `duo` variant (Green).
  - "Skip": Use a `duo-outline` or `duo-ghost` variant (Gray/White).
  - "Next": Use the `duo` variant (Green/Blue).

## Verification
- Check the `LearningSession` page.
- Ensure buttons have the correct "click" animation.
- Ensure colors are consistent with the "Playful/Bold" theme.
