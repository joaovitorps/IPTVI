# Electron IPC Handler Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Electron IPC handlers testable by extracting registration from `main.ts` and adding the first two focused Vitest specs for channel wiring and handler invocation.

**Architecture:** Move IPC `ipcMain.handle` registrations into a pure `registerMainIpc` function that accepts an `ipcMain`-like object and explicit handler dependencies. Keep Electron lifecycle and process side effects in `main.ts`. Test IPC behavior with unit tests by capturing registered listeners and invoking them directly.

**Tech Stack:** Electron 40, TypeScript, Vitest 4, Vite path aliases

---

### Task 1: Extract IPC Registration From `main.ts`

**Files:**
- Create: `src/main/ipc/register-main-ipc.ts`
- Create: `src/main/handlers/delete-playlist.ts`
- Modify: `src/main/main.ts`
- Test: `tests/unit/main/register-main-ipc.spec.ts`

- [ ] **Step 1: Write the failing test for channel registration**

```ts
// tests/unit/main/register-main-ipc.spec.ts
import { registerMainIpc } from "@main/ipc/register-main-ipc";

describe("registerMainIpc", () => {
  it("registers all expected IPC channels", () => {
    const handle = vi.fn();

    const deps = {
      validateCredentials: vi.fn(),
      createPlaylist: vi.fn(),
      fetchPlaylists: vi.fn(),
      updatePlaylist: vi.fn(),
      deletePlaylist: vi.fn(),
      fetchCategories: vi.fn(),
      fetchSeries: vi.fn(),
      fetchSerieInfo: vi.fn(),
    };

    registerMainIpc({ handle } as any, deps);

    const registeredChannels = handle.mock.calls.map(([channel]) => channel);

    expect(registeredChannels).toEqual(
      expect.arrayContaining([
        "playlist:validate",
        "playlist:create",
        "playlist:fetch",
        "playlist:update",
        "playlist:delete",
        "get-series-categories",
        "get-series-category",
        "get-serie-info",
      ]),
    );

    expect(handle).toHaveBeenCalledTimes(8);
    expect(handle).toHaveBeenCalledWith("playlist:fetch", deps.fetchPlaylists);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/main/register-main-ipc.spec.ts`
Expected: FAIL with module not found for `@main/ipc/register-main-ipc`

- [ ] **Step 3: Write minimal extraction implementation**

```ts
// src/main/ipc/register-main-ipc.ts
import { Credentials } from "@/core/domain/entities/object-values/credentials";
import { CreatePlaylist, UpdatePlaylist } from "@/shared/types";
import { IpcMain } from "electron";

import { createPlaylist } from "@main/handlers/create-playlist";
import { deletePlaylist } from "@main/handlers/delete-playlist";
import { fetchCategories } from "@main/handlers/fetch-categories";
import { fetchPlaylists } from "@main/handlers/fetch-playlists";
import { fetchSerieInfo } from "@main/handlers/fetch-serie-info";
import { fetchSeries } from "@main/handlers/fetch-series";
import { updatePlaylist } from "@main/handlers/update-playlist";
import { validateCredentials } from "@main/handlers/validate-credentials";

export interface RegisterMainIpcDeps {
  validateCredentials: typeof validateCredentials;
  createPlaylist: typeof createPlaylist;
  fetchPlaylists: typeof fetchPlaylists;
  updatePlaylist: typeof updatePlaylist;
  deletePlaylist: typeof deletePlaylist;
  fetchCategories: typeof fetchCategories;
  fetchSeries: typeof fetchSeries;
  fetchSerieInfo: typeof fetchSerieInfo;
}

const defaultDeps: RegisterMainIpcDeps = {
  validateCredentials,
  createPlaylist,
  fetchPlaylists,
  updatePlaylist,
  deletePlaylist,
  fetchCategories,
  fetchSeries,
  fetchSerieInfo,
};

export const registerMainIpc = (
  ipcMainInstance: Pick<IpcMain, "handle">,
  deps: RegisterMainIpcDeps = defaultDeps,
) => {
  ipcMainInstance.handle("playlist:validate", (_event, credentials: Credentials) =>
    deps.validateCredentials(credentials),
  );

  ipcMainInstance.handle(
    "playlist:create",
    (_event, { name, credentials }: CreatePlaylist) =>
      deps.createPlaylist({ name, credentials }),
  );

  ipcMainInstance.handle("playlist:fetch", deps.fetchPlaylists);

  ipcMainInstance.handle(
    "playlist:update",
    (_event, { playlistId, data }: UpdatePlaylist) =>
      deps.updatePlaylist({ playlistId, data }),
  );

  ipcMainInstance.handle("playlist:delete", (_event, playlistId: string) =>
    deps.deletePlaylist(playlistId),
  );

  ipcMainInstance.handle("get-series-categories", deps.fetchCategories);

  ipcMainInstance.handle("get-series-category", (_event, categoryId: number) =>
    deps.fetchSeries(categoryId),
  );

  ipcMainInstance.handle("get-serie-info", (_event, serieId: number) =>
    deps.fetchSerieInfo(serieId),
  );
};
```

```ts
// src/main/handlers/delete-playlist.ts
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { DeletePlaylistUseCase } from "@/core/domain/use-cases/playlist/delete-playlist";

export const deletePlaylist = (playlistId: string) => {
  const deletePlaylistUseCase = new DeletePlaylistUseCase(
    new StorePlaylistRepository(),
  );

  return deletePlaylistUseCase.execute({ playlistId });
};
```

```ts
// src/main/main.ts (inside app.on("ready"))
registerMainIpc(ipcMain);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test -- tests/unit/main/register-main-ipc.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 1 changes**

```bash
git add src/main/ipc/register-main-ipc.ts src/main/handlers/delete-playlist.ts src/main/main.ts tests/unit/main/register-main-ipc.spec.ts
git commit -m "refactor: extract main IPC registration for testability"
```

### Task 2: Add First Invocation Spec For Playlist Validation Channel

**Files:**
- Create: `tests/unit/main/register-main-ipc-invoke.spec.ts`
- Test: `tests/unit/main/register-main-ipc-invoke.spec.ts`

- [ ] **Step 1: Write the failing invocation test**

```ts
// tests/unit/main/register-main-ipc-invoke.spec.ts
import { registerMainIpc } from "@main/ipc/register-main-ipc";

describe("registerMainIpc invocation behavior", () => {
  it("delegates playlist:validate invoke payload to validateCredentials", async () => {
    const handle = vi.fn();

    const validateResult = {
      isValid: true,
      error: undefined,
    };

    const deps = {
      validateCredentials: vi.fn().mockResolvedValue(validateResult),
      createPlaylist: vi.fn(),
      fetchPlaylists: vi.fn(),
      updatePlaylist: vi.fn(),
      deletePlaylist: vi.fn(),
      fetchCategories: vi.fn(),
      fetchSeries: vi.fn(),
      fetchSerieInfo: vi.fn(),
    };

    registerMainIpc({ handle } as any, deps);

    const validateCall = handle.mock.calls.find(
      ([channel]) => channel === "playlist:validate",
    );

    const listener = validateCall?.[1];

    const credentials = {
      server: "https://server.test",
      username: "user",
      password: "pass",
    };

    const result = await listener({} as any, credentials);

    expect(deps.validateCredentials).toHaveBeenCalledWith(credentials);
    expect(result).toEqual(validateResult);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- tests/unit/main/register-main-ipc-invoke.spec.ts`
Expected: FAIL due to listener lookup or return mismatch (before implementation is complete)

- [ ] **Step 3: Ensure invocation path returns delegated result**

```ts
// src/main/ipc/register-main-ipc.ts
ipcMainInstance.handle("playlist:validate", (_event, credentials: Credentials) =>
  deps.validateCredentials(credentials),
);
```

- [ ] **Step 4: Run the invocation test to verify it passes**

Run: `npm run test -- tests/unit/main/register-main-ipc-invoke.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 2 changes**

```bash
git add tests/unit/main/register-main-ipc-invoke.spec.ts src/main/ipc/register-main-ipc.ts
git commit -m "test: verify playlist validate IPC delegation"
```

### Task 3: Run Focused Safety Checks

**Files:**
- Modify: none
- Test: `tests/unit/main/register-main-ipc.spec.ts`
- Test: `tests/unit/main/register-main-ipc-invoke.spec.ts`

- [ ] **Step 1: Run both new tests together**

Run: `npm run test -- tests/unit/main/register-main-ipc.spec.ts tests/unit/main/register-main-ipc-invoke.spec.ts`
Expected: PASS with 2 passing files

- [ ] **Step 2: Run full suite to verify no regressions**

Run: `npm test`
Expected: PASS (or existing known failures only, if any)

- [ ] **Step 3: Commit verification notes if code changed during fixes**

```bash
git add .
git commit -m "chore: validate ipc registration tests"
```

---

## File Structure Summary

- `src/main/main.ts`: Electron lifecycle + app boot side effects only
- `src/main/ipc/register-main-ipc.ts`: single responsibility for IPC channel wiring
- `src/main/handlers/delete-playlist.ts`: keep delete orchestration in handlers folder, consistent with other handlers
- `tests/unit/main/register-main-ipc.spec.ts`: channel registration contract
- `tests/unit/main/register-main-ipc-invoke.spec.ts`: invoke behavior contract for first target channel

## Notes

- This plan intentionally starts with the first two specs only (registration and one invoke path), then can be extended channel-by-channel.
- Replacing `ipcMiddleware("get-series-categories", ...)` with `ipcMain.handle("get-series-categories", ...)` is included in extraction to keep wiring consistent and testable.
