I will ensure keyboard shortcuts (specifically "Select All" via `Cmd+A` / `Ctrl+A`) are explicitly handled in all input fields to guarantee functionality.

**1. Update** **`frontend/components/LearningSession.tsx`**

* Modify the `onKeyDown` handler of the sentence input `<textarea>`.

* Add logic to intercept `Cmd+A` (Mac) or `Ctrl+A` (Windows/Linux) and force a `select()` action on the input.

**2. Update** **`frontend/components/Auth.tsx`**

* Add an `onKeyDown` handler to both the Email and Password `<input>` fields.

* Implement the same `Cmd+A` / `Ctrl+A` interception logic to ensure text selection works reliably.

**Verification**

* This manual handling ensures that even if the environment (e.g., specific browser contexts) suppresses the default behavior, the shortcut will work as expected.

