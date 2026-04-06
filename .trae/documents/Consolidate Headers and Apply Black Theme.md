I will resolve the duplicate header issue by consolidating the two headers into a single, unified "World-Class" header in `App.tsx` and removing the redundant one from `HomePage.tsx`. I will also finalize the "Black/Tech" theme across the header.

**1. Update Global Header (`frontend/App.tsx`)**

* **Structure**: Replace the old `HeaderBar` with the new design.

* **Style**: Use `bg-white/80 backdrop-blur-md` for the glassmorphism effect.

* **Content**:

  * **Left**: The new **Black Box Logo** (`<Logo />`).

  * **Right**:

    * **Level Badge**: Display the current level (e.g., "小学英语") in a pill-shaped gray badge.

    * **User Info**: Minimalist email display (or just an avatar icon if space is tight, but email is safer for now).

    * **Logout**: A clean, icon-based or text-based button.

* **Theme**: Ensure the "Black" theme is consistent (Logo background, high-contrast text).

**2. Clean Up** **`HomePage.tsx`**

* **Remove**: Delete the local `<header>` section entirely.

* **Adjust**: Ensure the main content area has appropriate top padding to sit comfortably below the sticky global header.

**3. Verify**

* Check that the header appears correctly on all pages (Home, Learn, Review).

* Ensure no duplication exists.

* Confirm the "Black" theme is dominant in the header elements.

