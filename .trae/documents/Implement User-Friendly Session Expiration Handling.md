
I have analyzed the current authentication flow and identified the cause of the poor user experience. The system currently handles token expiration (401 errors) by immediately clearing the token and relying on a silent redirect, or in some cases, throwing errors that look like network issues.

Here is the plan to implement a user-friendly "Session Expired" handling mechanism that will be robust for all future features.

### Phase 1: Create a Centralized Network Layer
Currently, `fetch` calls and 401 checks are repeated in every function in `geminiService.ts`. I will centralize this.

1.  **Create `frontend/services/apiClient.ts`**:
    *   A wrapper around `fetch` that automatically adds `Authorization` headers.
    *   **Global Error Handling**: It will intercept **401 (Unauthorized)** responses centrally.
    *   Instead of immediately clearing data, it will dispatch a specific `session-expired` event.

2.  **Refactor `geminiService.ts`**:
    *   Replace all direct `fetch` calls with this new `apiClient`.
    *   Remove the repetitive `if (res.status === 401)...` blocks.

### Phase 2: Implement "Session Expired" UI
1.  **Create `frontend/components/SessionExpiredModal.tsx`**:
    *   A friendly modal dialog that informs the user: "Login Session Expired".
    *   Action button: "Log in Again".
    *   This ensures the user knows *why* they were interrupted.

2.  **Update `frontend/contexts/AppContext.tsx`**:
    *   Add state to track if the session has expired (`isSessionExpired`).
    *   Listen for the `session-expired` event.
    *   **Crucial Change**: When the event fires, **do not** immediately clear the token/user data (which causes the page to crash or flash). Instead, just set `isSessionExpired = true` to show the modal.

### Phase 3: Integration & Global Handling
1.  **Update `frontend/App.tsx`**:
    *   Mount the `SessionExpiredModal` at the global level.
    *   Pass a callback to the modal so that when the user clicks "Log in Again", it performs the actual cleanup (`logout`) and redirects to `/login`.

### Phase 4: Verification
*   Trigger a 401 error manually (by modifying the token or a backend endpoint temporarily).
*   Verify that the "Session Expired" modal appears immediately.
*   Verify that clicking the button cleanly logs the user out and sends them to the login page.
