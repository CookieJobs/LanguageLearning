I will optimize the frontend UI to achieve a "World-Class Tech" aesthetic (Clean, Minimalist, Modern), similar to ChatGPT/Apple/Vercel styles.

**Design Philosophy:**
- **Typography:** Clean sans-serif with tighter tracking for headings.
- **Color Palette:** Neutral dominance (Black, White, Slate/Zinc) with purposeful accents.
- **UI Elements:** Large click targets, subtle borders/rings instead of heavy shadows, extensive use of white space.
- **Motion:** Subtle hover states and transitions.

**Implementation Steps:**

1.  **Refine `Logo` Component** (`frontend/components/Logo.tsx`):
    - Update styling to be more adaptable (allow color props).
    - Remove the heavy colored background box by default or make it sleeker.

2.  **Redesign `Auth` Component** (`frontend/components/Auth.tsx`) - **Login/Register**:
    - **Layout**: Center a minimalist card on a clean, potentially subtle patterned background (e.g., dots or subtle gradient).
    - **Form Elements**:
        - Inputs: Remove default borders, use light gray backgrounds with `focus:ring` (Apple style).
        - Buttons: Full-width, black/dark-gray primary action button with subtle transform on hover.
    - **Typography**: "Welcome back" style headers with `tracking-tight`.

3.  **Redesign `HomePage`** (`frontend/pages/HomePage.tsx`):
    - **Header**: Minimalist top bar with modern typography.
    - **Dashboard**:
        - **Stats Grid**: Re-layout the Streak and Mastery badges into a modern grid or flex row using "Card" visual language (border-less, subtle background).
        - **Hero Action**: Make the "Start Learning" call-to-action prominent, perhaps using a modern gradient or solid dark block.
    - **Visuals**: Use `lucide-react` icons effectively.

4.  **Update `StreakBadge`** (`frontend/components/StreakBadge.tsx`):
    - Modernize the look (less "badge-like", more "stat-like").

I will proceed file by file to apply these changes.