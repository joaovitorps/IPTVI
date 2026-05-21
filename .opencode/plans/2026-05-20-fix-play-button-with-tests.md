# Fix Play Button Redirection + Add Component Testing

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the issue where clicking Play on a server profile activates the playlist even with invalid credentials, causing a redirect loop. Also set up component testing infrastructure and write tests.

**Architecture:** Move credential validation into `ActivatePlaylistUseCase` so it validates BEFORE activating. If invalid, throw an error that `Login.tsx` displays via the existing red banner. Set up `@testing-library/react` + `happy-dom` for component testing.

**Tech Stack:** TypeScript, React, Electron, Zustand, Vitest, @testing-library/react, happy-dom

---

## Root Cause Analysis

**The actual bug flow:**

```
Click Play → activate(playlistId) → Sets isActive=true (NO validation!)
→ redirect() → "/" → ProtectedRoute validates credentials → FAILS (invalid creds)
→ Redirects back to /login → User confused, page "refreshes"
```

**Fix:** Validate credentials INSIDE the use case before setting `isActive = true`.

---

## Files to Modify

1. **`src/core/domain/use-cases/error/invalid-credentials-error.ts`** (new) - Domain error for invalid credentials
2. **`src/core/domain/use-cases/playlist/activate-playlist.ts`** - Add credential validation dependency
3. **`src/main/handlers/activate-playlist.ts`** - Pass `APICredentialRepository` to use case
4. **`src/renderer/pages/Login.tsx`** - Handle activation errors (already done partially, just need to ensure it works)
5. **`vitest.config.ts`** - Add `happy-dom` environment for component tests
6. **`package.json`** - Add `@testing-library/react` and `happy-dom` dependencies

## Files to Create (Tests)

7. **`tests/unit/activate-playlist-with-validation.spec.ts`** - Unit tests for activate use case with validation
8. **`tests/component/login-play-button.spec.tsx`** - Component test for Login page Play button flow
9. **`tests/component/setup.tsx`** (new) - Shared test setup / render helper

---

## Error Message Strategy

**Rule:** Reuse the SAME error messages that already exist in `APICredentialRepository`:

- `"Invalid Credentials."` (401)
- `"Invalid URL."` (400/ENOTFOUND)
- `"Service Unavailable"` (503/Zod parse fail)
- `"Unknown error."` (500)

**Implementation:** The `ActivatePlaylistUseCase` will call `credentialRepository.validate()` and throw `InvalidCredentialsError` with the exact message from the API response. The `Login.tsx` `activatePlaylist()` catch block already does `setError(error.message)` — no changes needed to error display.

**This ensures:** One source of truth for error messages. If the API message changes, it propagates automatically.

---

### Task 1: Add InvalidCredentialsError Domain Error

**Files:**

- Create: `src/core/domain/use-cases/error/invalid-credentials-error.ts`

- [ ] **Step 1: Create the error class**

```typescript
export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/domain/use-cases/error/invalid-credentials-error.ts
git commit -m "feat: add InvalidCredentialsError domain error"
```

---

### Task 2: Modify ActivatePlaylistUseCase to Validate Credentials

**Files:**

- Modify: `src/core/domain/use-cases/playlist/activate-playlist.ts`

- [ ] **Step 1: Read current file**

Read `src/core/domain/use-cases/playlist/activate-playlist.ts`.

- [ ] **Step 2: Update with credential validation**

```typescript
import { CredentialRepository } from "../../repositories/credential-repository";
import { PlaylistRepository } from "../../repositories/playlist-repository";
import { EntityNotFoundError } from "../error/entity-not-found-error";
import { InvalidCredentialsError } from "../error/invalid-credentials-error";

interface ActivatePlaylistUseCaseParams {
  playlistId: string;
}

interface ActivatePlaylistUseCaseReturn {
  activated: boolean;
}

export class ActivatePlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly credentialRepository: CredentialRepository,
  ) {}

  async execute({
    playlistId,
  }: ActivatePlaylistUseCaseParams): Promise<ActivatePlaylistUseCaseReturn> {
    const playlist = this.playlistRepository.getById(playlistId);

    if (!playlist) {
      throw new EntityNotFoundError();
    }

    // Validate credentials BEFORE activating
    const validation = await this.credentialRepository.validate({
      server: playlist.server,
      username: playlist.username,
      password: playlist.password,
    });

    if (!validation.ok) {
      throw new InvalidCredentialsError(validation.data.error);
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

    return { activated: true };
  }
}
```

- [ ] **Step 3: Run linter**

```bash
npm run lint
```

Expected: No new errors.

- [ ] **Step 4: Commit**

```bash
git add src/core/domain/use-cases/playlist/activate-playlist.ts
git commit -m "feat: validate credentials before activating playlist"
```

---

### Task 3: Update Activate Playlist Handler

**Files:**

- Modify: `src/main/handlers/activate-playlist.ts`

- [ ] **Step 1: Update handler to pass credential repository**

```typescript
import { APICredentialRepository } from "@/core/domain/repositories/api/api-credential-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { ActivatePlaylistUseCase } from "@/core/domain/use-cases/playlist/activate-playlist";

export const activatePlaylist = async (playlistId: string) => {
  const useCase = new ActivatePlaylistUseCase(
    new StorePlaylistRepository(),
    new APICredentialRepository(),
  );
  return useCase.execute({ playlistId });
};
```

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/main/handlers/activate-playlist.ts
git commit -m "fix: pass credential repository to activate handler"
```

---

### Task 4: Update Unit Tests for Activate Playlist

**Files:**

- Modify: `tests/unit/activate-playlist.spec.ts`
- Create: `tests/repositories/in-memory-credential-repository.ts` (already exists, may need updates)

- [ ] **Step 1: Update existing unit test file**

```typescript
import { InvalidCredentialsError } from "@/core/domain/use-cases/error/invalid-credentials-error";
import { ActivatePlaylistUseCase } from "@/core/domain/use-cases/playlist/activate-playlist";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryCredentialRepository } from "@tests/repositories/in-memory-credential-repository";
import { InMemoryPlaylistRepository } from "@tests/repositories/in-memory-playlist-repository";

describe("Activate playlist use case", () => {
  let playlistRepo: InMemoryPlaylistRepository;
  let credentialRepo: InMemoryCredentialRepository;
  let sut: ActivatePlaylistUseCase;

  beforeEach(() => {
    playlistRepo = new InMemoryPlaylistRepository();
    credentialRepo = new InMemoryCredentialRepository();
    sut = new ActivatePlaylistUseCase(playlistRepo, credentialRepo);
  });

  it("should be able to activate a playlist with valid credentials", async () => {
    const { playlist } = makePlaylist();
    playlistRepo.playlists.push(playlist);

    expect(playlist.isActive).toBe(false);

    const result = await sut.execute({ playlistId: playlist.id });

    expect(result.activated).toBe(true);
    expect(playlist.isActive).toBe(true);
  });

  it("should throw InvalidCredentialsError when credentials are invalid", async () => {
    const { playlist } = makePlaylist();
    playlistRepo.playlists.push(playlist);
    credentialRepo.isValid = false;
    credentialRepo.validationError = "Invalid Credentials.";

    await expect(sut.execute({ playlistId: playlist.id })).rejects.toThrow(
      InvalidCredentialsError,
    );

    await expect(sut.execute({ playlistId: playlist.id })).rejects.toThrow(
      "Invalid Credentials.",
    );

    expect(playlist.isActive).toBe(false);
  });

  it("should throw InvalidCredentialsError with 'Invalid URL.' when host is unreachable", async () => {
    const { playlist } = makePlaylist();
    playlistRepo.playlists.push(playlist);
    credentialRepo.isValid = false;
    credentialRepo.validationError = "Invalid URL.";

    await expect(sut.execute({ playlistId: playlist.id })).rejects.toThrow(
      "Invalid URL.",
    );

    expect(playlist.isActive).toBe(false);
  });

  it("should deactivate other playlists when activating a new one", async () => {
    const { playlist: activePlaylist } = makePlaylist();
    activePlaylist.isActive = true;
    playlistRepo.playlists.push(activePlaylist);

    const { playlist: newPlaylist } = makePlaylist();
    playlistRepo.playlists.push(newPlaylist);

    await sut.execute({ playlistId: newPlaylist.id });

    expect(activePlaylist.isActive).toBe(false);
    expect(newPlaylist.isActive).toBe(true);
  });

  it("should not deactivate the same playlist when it is already active", async () => {
    const { playlist } = makePlaylist();
    playlist.isActive = true;
    playlistRepo.playlists.push(playlist);

    const result = await sut.execute({ playlistId: playlist.id });

    expect(result.activated).toBe(true);
    expect(playlist.isActive).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test -- tests/unit/activate-playlist.spec.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/activate-playlist.spec.ts
git commit -m "test: add validation tests for activate playlist use case"
```

---

### Task 5: Set Up Component Testing Infrastructure

**Files:**

- Modify: `package.json` (add deps)
- Modify: `vitest.config.ts` (add environment)
- Create: `tests/component/setup.tsx` (test helper)

- [ ] **Step 1: Install dependencies**

```bash
npm install -D @testing-library/react happy-dom
```

- [ ] **Step 2: Update vitest.config.ts**

```typescript
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: [...configDefaults.exclude, "**/.worktrees/**"],
    globals: true,
    environment: "happy-dom", // Default for component tests
  },
});
```

**IMPORTANT:** The existing unit tests (backend/domain) should NOT use happy-dom. We'll override per-file. Add this comment in the config or use a workspace setup if needed. For simplicity, keep the default as `node` and only override component tests.

Actually, better approach: Keep default as `node` (for existing unit tests), and add a component test config:

```typescript
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: [...configDefaults.exclude, "**/.worktrees/**"],
    globals: true,
    // Default environment for unit tests (node = no DOM)
    environment: "node",
  },
});
```

Then in component test files, add:

```typescript
/**
 * @vitest-environment happy-dom
 */
```

- [ ] **Step 3: Create tests/component/setup.tsx**

```typescript
import { render as rtlRender } from "@testing-library/react";
import React from "react";

/**
 * Custom render helper for component tests.
 * Wraps the component with any providers needed (e.g., Zustand, Router, QueryClient).
 */
export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <>{children}</>,
    ...options,
  });
}

// Re-export everything from testing-library for convenience
export * from "@testing-library/react";
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/component/setup.tsx
git commit -m "chore: set up @testing-library/react + happy-dom for component testing"
```

---

### Task 6: Write Component Test for Login Play Button

**Files:**

- Create: `tests/component/login-play-button.spec.tsx`

- [ ] **Step 1: Write the component test**

```typescript
/**
 * @vitest-environment happy-dom
 */

import { Login } from "@/renderer/pages/Login";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "./setup";

// Helper to create a mock playlist DTO
function makePlaylistDTO(overwrite: Partial<PlaylistDTO> = {}): PlaylistDTO {
  return {
    id: "playlist-1",
    name: "Test Playlist",
    server: "http://example.com:8080",
    username: "user",
    password: "pass",
    isActive: false,
    createdAt: new Date().toISOString(),
    ...overwrite,
  };
}

describe("Login Page - Play Button", () => {
  const mockPlaylist = makePlaylistDTO();

  it("should show error banner when activating playlist with invalid credentials", async () => {
    // Mock the API - fetch returns a playlist, activate throws error
    window.api = {
      playlist: {
        activate: vi.fn().mockRejectedValue(new Error("Invalid Credentials.")),
        validate: vi.fn(),
        create: vi.fn(),
        fetch: vi.fn().mockResolvedValue([mockPlaylist]),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: { fetch: vi.fn() },
      serie: { getById: vi.fn(), fetchByCategoryId: vi.fn() },
      streamServer: {
        start: vi.fn(),
        stop: vi.fn(),
        status: vi.fn(),
      },
    };

    render(<Login />);

    // Wait for playlists to load and render
    await waitFor(() => {
      expect(screen.getByText("Test Playlist")).toBeInTheDocument();
    });

    // Find the Play button (it's inside the playlist card, has title="Play")
    const playButton = screen.getByTitle("Play");
    expect(playButton).toBeInTheDocument();

    // Click the Play button
    fireEvent.click(playButton);

    // Wait for the error banner to appear with the exact API message
    await waitFor(() => {
      expect(screen.getByText("Invalid Credentials.")).toBeInTheDocument();
    });

    // Verify the error banner is styled correctly (red background)
    const errorBanner = screen.getByText("Invalid Credentials.").closest("div");
    expect(errorBanner).toHaveClass("bg-red-500/10");
  });

  it("should redirect when activating playlist with valid credentials", async () => {
    // Mock successful activation (returns void)
    window.api = {
      playlist: {
        activate: vi.fn().mockResolvedValue(undefined),
        validate: vi.fn(),
        create: vi.fn(),
        fetch: vi.fn().mockResolvedValue([mockPlaylist]),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: { fetch: vi.fn() },
      serie: { getById: vi.fn(), fetchByCategoryId: vi.fn() },
      streamServer: {
        start: vi.fn(),
        stop: vi.fn(),
        status: vi.fn(),
      },
    };

    // Mock window.location.href to capture redirect
    const originalHref = window.location.href;
    let redirectedTo = "";
    Object.defineProperty(window, "location", {
      value: {
        get href() {
          return redirectedTo;
        },
        set href(value: string) {
          redirectedTo = value;
        },
      },
      writable: true,
    });

    render(<Login />);

    // Wait for playlists to load
    await waitFor(() => {
      expect(screen.getByText("Test Playlist")).toBeInTheDocument();
    });

    // Click the Play button
    const playButton = screen.getByTitle("Play");
    fireEvent.click(playButton);

    // Wait for redirect to happen
    await waitFor(() => {
      expect(redirectedTo).toBe("/");
    });

    // Verify activate was called with the correct playlist ID
    expect(window.api.playlist.activate).toHaveBeenCalledWith("playlist-1");

    // Restore
    Object.defineProperty(window, "location", {
      value: { href: originalHref },
      writable: true,
    });
  });

  it("should show confirmation dialog when another playlist is active", async () => {
    const activePlaylist = makePlaylistDTO({
      id: "active-1",
      name: "Active Playlist",
      isActive: true,
    });
    const newPlaylist = makePlaylistDTO({
      id: "new-1",
      name: "New Playlist",
      isActive: false,
    });

    window.api = {
      playlist: {
        activate: vi.fn().mockResolvedValue(undefined),
        validate: vi.fn(),
        create: vi.fn(),
        fetch: vi.fn().mockResolvedValue([activePlaylist, newPlaylist]),
        update: vi.fn(),
        delete: vi.fn(),
      },
      category: { fetch: vi.fn() },
      serie: { getById: vi.fn(), fetchByCategoryId: vi.fn() },
      streamServer: {
        start: vi.fn(),
        stop: vi.fn(),
        status: vi.fn(),
      },
    };

    render(<Login />);

    // Wait for playlists to load
    await waitFor(() => {
      expect(screen.getByText("New Playlist")).toBeInTheDocument();
    });

    // Find the Play button for the NEW playlist (not the active one)
    // The new playlist is the second one, so we get all Play buttons and click the second
    const playButtons = screen.getAllByTitle("Play");
    expect(playButtons).toHaveLength(2);

    // Click Play on the new playlist
    fireEvent.click(playButtons[1]);

    // Assert that the confirmation dialog appears
    await waitFor(() => {
      expect(
        screen.getByText("Switch Active Playlist"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Another playlist is currently active. Do you want to deactivate it and activate this one instead?",
      ),
    ).toBeInTheDocument();

    // Click "Switch Playlist" to confirm
    fireEvent.click(screen.getByText("Switch Playlist"));

    // Wait for activation to happen
    await waitFor(() => {
      expect(window.api.playlist.activate).toHaveBeenCalledWith("new-1");
    });
  });
});
```

- [ ] **Step 2: Run component tests**

```bash
npm run test -- tests/component/login-play-button.spec.tsx
```

Expected: All 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/component/login-play-button.spec.tsx
git commit -m "test: add component tests for Login Play button flow"
```

---

### Task 7: Verify Login.tsx Error Handling Works

The `activatePlaylist` function in `Login.tsx` already has try-catch with `setError`. After our changes:

- `window.api.playlist.activate()` will throw `InvalidCredentialsError` with message from API
- The catch block does: `setError(error instanceof Error ? error.message : "Failed to activate playlist")`
- This will display the exact API message in the red banner

**No changes needed to Login.tsx** — the error handling is already correct!

But let's verify by checking the current `activatePlaylist` function:

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

This is perfect. The `InvalidCredentialsError` extends `Error`, so `error instanceof Error` is `true`, and `error.message` will be the exact API error message (e.g., `"Invalid Credentials."`).

- [ ] **Step 1: Verify no Login.tsx changes needed**

Confirm the existing `activatePlaylist` function already handles errors correctly.

- [ ] **Step 2: Commit (if any minor cleanup needed)**

If no changes needed, skip this step.

---

## Test Execution Summary

After all tasks:

```bash
# Run all tests
npm run test

# Run only unit tests
npm run test -- tests/unit/

# Run only component tests
npm run test -- tests/component/

# Run with coverage
npm run coverage
```

---

## Verification Checklist

- [ ] `ActivatePlaylistUseCase` validates credentials before activating
- [ ] Invalid credentials throw `InvalidCredentialsError` with API message
- [ ] Valid credentials activate playlist and deactivate others
- [ ] Unit tests cover: valid activation, invalid credentials, URL error, deactivation of others
- [ ] Component testing infrastructure is set up (`@testing-library/react` + `happy-dom`)
- [ ] 3 component tests exist: invalid credentials error, valid redirect, confirmation dialog
- [ ] Login.tsx displays error messages in the red banner without changes
- [ ] All existing tests still pass
- [ ] Linter passes with no new errors

---

## Architecture Decision Record

**Decision:** Validate credentials in `ActivatePlaylistUseCase` (domain layer), not in `Login.tsx` (UI layer).

**Rationale:**

1. Business rule "don't activate invalid playlists" belongs in the domain
2. All callers benefit (not just the Play button — also CLI, future features)
3. Easier to test (unit tests vs component tests)
4. Consistent with Clean Architecture principles used in the project

**Trade-off:** The use case now has an additional dependency (`CredentialRepository`), making it slightly more complex to instantiate. This is acceptable because:

- Dependency injection is already the project's pattern
- The handler already creates repositories anyway
- The benefit (correctness) outweighs the cost
