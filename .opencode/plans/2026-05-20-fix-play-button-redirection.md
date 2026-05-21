# Fix Play Button Redirection Issue

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the issue where clicking the Play button on a server profile in the login page doesn't redirect to the home page.

**Architecture:** The root cause is that `ActivatePlaylistUseCase` throws an error when another playlist is already active, but `handlePlayPlaylist` in Login.tsx has no error handling. The fix will show a confirmation dialog to the user when other playlists are active, and only deactivate them if the user confirms.

**Tech Stack:** TypeScript, React, Electron, Zustand

---

## Root Cause Analysis

**File:** `src/core/domain/use-cases/playlist/activate-playlist.ts:20-24`

```typescript
const activePlaylists = await this.playlistRepository.fetchActives();

if (activePlaylists.length > 0) {
  if (!activePlaylists.find((playlist) => playlist.id === playlistId)) {
    throw new Error("Other playlist is already active.");
  }
}
```

**Problem:** The use case throws an error if another playlist is already active. The `handlePlayPlaylist` function in `Login.tsx:139-148` has no error handling, so when the error is thrown, `redirect()` is never called.

**Flow:**
```
Click Play → activate(playlistId) → Error: "Other playlist is already active" 
→ No redirect() called → Stay on login page
```

---

## Files to Modify

1. **Create:** `src/renderer/components/ConfirmDialog.tsx` - New confirmation dialog component
2. **Modify:** `src/core/domain/use-cases/playlist/activate-playlist.ts` - Deactivate other playlists before activating new one
3. **Modify:** `src/renderer/pages/Login.tsx` - Add confirmation dialog and error handling
4. **Test:** Manual testing in the app

---

### Task 1: Create ConfirmDialog Component

**Files:**
- Create: `src/renderer/components/ConfirmDialog.tsx`

- [ ] **Step 1: Create the ConfirmDialog component**

Create a reusable confirmation dialog component:

```typescript
import { cn } from "@renderer/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed",
        "inset-0",
        "z-50",
        "flex",
        "items-center",
        "justify-center",
        "bg-black/50",
        "backdrop-blur-sm",
      )}
      onClick={onCancel}
    >
      <div
        className={cn(
          "bg-zinc-900",
          "border",
          "border-zinc-700",
          "rounded-2xl",
          "p-6",
          "max-w-md",
          "w-full",
          "mx-4",
          "shadow-2xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={cn("text-xl", "font-bold", "text-white", "mb-4")}>
          {title}
        </h3>
        <p className={cn("text-zinc-300", "mb-6")}>{message}</p>
        <div className={cn("flex", "justify-end", "gap-3")}>
          <button
            onClick={onCancel}
            className={cn(
              "px-4",
              "py-2",
              "rounded-lg",
              "bg-zinc-800",
              "hover:bg-zinc-700",
              "text-zinc-300",
              "transition-colors",
            )}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4",
              "py-2",
              "rounded-lg",
              "bg-amber-500",
              "hover:bg-amber-600",
              "text-zinc-950",
              "font-bold",
              "transition-colors",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Run the linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Commit the change**

```bash
git add src/renderer/components/ConfirmDialog.tsx
git commit -m "feat: add ConfirmDialog component"
```

---

### Task 2: Modify ActivatePlaylistUseCase to Deactivate Other Playlists

**Files:**
- Modify: `src/core/domain/use-cases/playlist/activate-playlist.ts`

- [ ] **Step 1: Read the current implementation**

Read the file to understand the current logic.

- [ ] **Step 2: Update the use case to deactivate other playlists**

Replace the error-throwing logic with logic that deactivates other playlists:

```typescript
import { PlaylistRepository } from "../../repositories/playlist-repository";
import { EntityNotFoundError } from "../error/entity-not-found-error";

interface ActivatePlaylistUseCaseParams {
  playlistId: string;
}

export class ActivatePlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepository) {}

  async execute({ playlistId }: ActivatePlaylistUseCaseParams): Promise<void> {
    const playlist = this.playlistRepository.getById(playlistId);

    if (!playlist) {
      throw new EntityNotFoundError();
    }

    // Deactivate all other playlists first
    const activePlaylists = await this.playlistRepository.fetchActives();
    
    for (const activePlaylist of activePlaylists) {
      if (activePlaylist.id !== playlistId) {
        activePlaylist.isActive = false;
        await this.playlistRepository.save(activePlaylist);
      }
    }

    // Activate the target playlist
    playlist.isActive = true;
    await this.playlistRepository.save(playlist);
  }
}
```

- [ ] **Step 3: Run the linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 4: Commit the change**

```bash
git add src/core/domain/use-cases/playlist/activate-playlist.ts
git commit -m "fix: deactivate other playlists when activating a new one"
```

---

### Task 3: Update Login.tsx with Confirmation Dialog

**Files:**
- Modify: `src/renderer/pages/Login.tsx`

- [ ] **Step 1: Add state for confirmation dialog**

Add state variables for the confirmation dialog:

```typescript
const [confirmDialog, setConfirmDialog] = useState<{
  isOpen: boolean;
  playlistId: string;
}>({
  isOpen: false,
  playlistId: "",
});
```

- [ ] **Step 2: Add function to check for active playlists**

Add a function to check if there are other active playlists:

```typescript
const hasOtherActivePlaylists = (excludePlaylistId: string): boolean => {
  return playlists.some(
    (playlist) => playlist.isActive && playlist.id !== excludePlaylistId,
  );
};
```

- [ ] **Step 3: Update handlePlayPlaylist function**

Update the function to show confirmation dialog when other playlists are active:

```typescript
const handlePlayPlaylist = async (
  e: React.MouseEvent,
  playlistId: string,
) => {
  e.stopPropagation();

  // Check if there are other active playlists
  if (hasOtherActivePlaylists(playlistId)) {
    setConfirmDialog({
      isOpen: true,
      playlistId,
    });
    return;
  }

  // No other active playlists, proceed directly
  await activatePlaylist(playlistId);
};
```

- [ ] **Step 4: Add activatePlaylist function**

Add a function to handle the actual activation:

```typescript
const activatePlaylist = async (playlistId: string) => {
  try {
    await window.api.playlist.activate(playlistId);
    redirect();
  } catch (error) {
    console.error("Failed to activate playlist:", error);
    setError(
      error instanceof Error ? error.message : "Failed to activate playlist",
    );
  }
};
```

- [ ] **Step 5: Add confirmation dialog handlers**

Add handlers for the confirmation dialog:

```typescript
const handleConfirmActivate = async () => {
  setConfirmDialog({ isOpen: false, playlistId: "" });
  await activatePlaylist(confirmDialog.playlistId);
};

const handleCancelActivate = () => {
  setConfirmDialog({ isOpen: false, playlistId: "" });
};
```

- [ ] **Step 6: Add ConfirmDialog to the component JSX**

Add the ConfirmDialog component at the end of the return statement:

```typescript
return (
  <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row p-6 gap-8">
    {/* ... existing JSX ... */}

    <ConfirmDialog
      isOpen={confirmDialog.isOpen}
      title="Switch Active Playlist"
      message="Another playlist is currently active. Do you want to deactivate it and activate this one instead?"
      confirmLabel="Switch Playlist"
      cancelLabel="Cancel"
      onConfirm={handleConfirmActivate}
      onCancel={handleCancelActivate}
    />
  </div>
);
```

- [ ] **Step 7: Import ConfirmDialog**

Add the import at the top of the file:

```typescript
import { ConfirmDialog } from "../components/ConfirmDialog";
```

- [ ] **Step 8: Run the linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 9: Commit the change**

```bash
git add src/renderer/pages/Login.tsx
git commit -m "fix: add confirmation dialog for playlist switching"
```

---

### Task 4: Manual Testing

- [ ] **Step 1: Test with no active playlists**

1. Start the app
2. Ensure no playlists are active
3. Add a playlist with valid credentials
4. Click the Play button on the playlist
5. Expected: Redirect to home page immediately

- [ ] **Step 2: Test with another active playlist (confirm)**

1. Start the app
2. Have one playlist already active
3. Add another playlist with valid credentials
4. Click the Play button on the new playlist
5. Expected: Confirmation dialog appears
6. Click "Switch Playlist"
7. Expected: Redirect to home page

- [ ] **Step 3: Test with another active playlist (cancel)**

1. Start the app
2. Have one playlist already active
3. Add another playlist with valid credentials
4. Click the Play button on the new playlist
5. Expected: Confirmation dialog appears
6. Click "Cancel"
7. Expected: Stay on login page, no changes made

- [ ] **Step 4: Test with invalid credentials**

1. Start the app
2. Add a playlist with invalid credentials
3. Click the Play button on the playlist
4. Expected: Error message shown, stay on login page

---

## Verification

After implementing the changes:

1. Run `npm run lint` to ensure code quality
2. Test the Play button functionality with various scenarios
3. Verify that confirmation dialog appears when switching active playlists
4. Verify that clicking "Switch Playlist" activates the new playlist and redirects
5. Verify that clicking "Cancel" does nothing
6. Verify that error messages are shown for invalid credentials
