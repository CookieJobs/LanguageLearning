I will modify `frontend/App.tsx` to update the header logic.

**Current Behavior:**
When a user is not logged in (token is missing), the entire right side of the header (email and logout button) is hidden.

**New Behavior:**
I will change the condition so that when the login state is lost (token is missing), a "请登录" (Please Login) button will be displayed in the same location and style as the user email. Clicking this button will navigate to the login page.

**File to Edit:**

* `frontend/App.tsx`

