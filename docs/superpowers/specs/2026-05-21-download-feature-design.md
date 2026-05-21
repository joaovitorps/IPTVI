# Download Feature Design

Date: 2026-05-21

## Overview

Add the ability to download TV show episodes directly from the IPTV stream source. Downloads are sequential (one at a time), managed by a centralized `DownloadManager` in the main process, with real-time progress pushed to the renderer via IPC events.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Download format | Direct stream download | Fastest, preserves original quality |
| Architecture | Centralized Download Manager (Approach A) | Single source of truth, no race conditions, follows existing domain patterns |
| Persistence | B2: Queue persistence, skip completed | Simple, no byte-tracking, completed items not stored |
| Download dir default | ~/Downloads/IPTVI | Cross-platform, sensible default |
| File naming | SerieName/S01E01 - Title.mkv | Organized in serie folders |
| Cancellation | Full (in-progress + queued) | Best UX |
| Content type | Episodes only (this spec) | Extensible via DownloadStream discriminated union |

## Domain Model

### DownloadStream (Discriminated Union)

Defined in `src/shared/types/ipc.ts`

```typescript
type DownloadStream =
  | {
      type: "episode";
      episodeId: number;
      serieId: number;
      serieName: string;
      seasonNumber: number;
      episodeNum: number;
      episodeTitle: string;
      containerExtension: string;
    }
  | {
      type: "movie";
      movieId: number;
      title: string;
      containerExtension: string;
    };
```

The `movie` variant is defined now for type safety but not functionally supported yet. See [enhancements spec](./2026-05-21-download-feature-enhancements.md).

### DownloadStatus (Enum)

```typescript
type DownloadStatus = "queued" | "downloading" | "completed" | "error" | "cancelled";
```

### Download Entity

Defined in `src/core/domain/entities/download.ts`, following existing Entity pattern:

```typescript
interface DownloadProps {
  stream: DownloadStream;
  status: DownloadStatus;
  progress: number;           // 0-100
  bytesDownloaded: number;
  totalBytes: number;         // -1 if unknown (no Content-Length)
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  filePath?: string;          // Set on completion
}
```

Entity produces `DownloadDTO` via `toJSON()`. DTO defined in `src/shared/types/dto.ts`.

### StoreSchema Update

Add to `src/shared/store.ts`:

```typescript
downloads: DownloadDTO[];  // Only non-completed items persisted
downloadDir: string;        // Default: ~/Downloads/IPTVI (resolved at runtime if empty)
```

Defaults: `downloads: []`, `downloadDir: ""` (resolved at runtime via `path.join(os.homedir(), 'Downloads', 'IPTVI')` if empty).

### Atomic Commit

```
feat(download): add DownloadStream type, DownloadStatus, DownloadDTO, and IPC types
```

Files: `src/shared/types/ipc.ts`, `src/shared/types/dto.ts`, `src/shared/store.ts`

```
feat(download): add Download entity
```

Files: `src/core/domain/entities/download.ts`, tests

### Tests — Domain Model

**Download Entity** (`src/core/domain/entities/download.ts`):
- Creation with all required props
- `toJSON()` produces correct `DownloadDTO` shape
- Status transitions are valid (`queued` → `downloading` → `completed` / `error`)
- Cancellation sets status correctly
- `DownloadStream` discriminated union: episode variant and movie variant both type-check

**Store Persistence** (`src/shared/store.ts`):
- `downloads` key stores and retrieves `DownloadDTO[]`
- `downloadDir` key stores and retrieves string
- Default values are correct

## DownloadManager

Located in `src/main/download-manager.ts`.

### Responsibilities

- Maintain ordered queue of Download items
- Process one download at a time (sequential)
- Auto-advance to next item on completion
- Persist non-completed queue state to electron-store
- Push progress events to renderer via `webContents.send()`
- Handle cancellation (abort request, delete partial file, or remove from queue)
- Delete partial files for incomplete downloads on startup

### Public Interface

```typescript
class DownloadManager {
  constructor(store: Store<StoreSchema>, webContents: WebContents);

  enqueue(stream: DownloadStream): string;              // Returns download ID
  cancel(downloadId: string): void;                     // Cancel + remove
  cancelAll(): void;                                    // Clear entire queue
  getQueue(): DownloadDTO[];                            // Snapshot of current state
  getItem(downloadId: string): DownloadDTO | undefined;
}
```

### File Path Logic (Episode)

```
<downloadDir>/<sanitizedSerieName>/S01E01 - Episode Title.mkv
```

Sanitize serie/file names: replace characters invalid on Windows/macOS/Linux (`/\:*?"<>|`) with underscores.

### HTTP Download Implementation

- Use `axios` (already a project dependency) to GET the stream URL — always use GET requests, never HEAD (IPTV servers may not support HEAD and will return incorrect headers)
- Pipe response to `fs.WriteStream` at the calculated file path
- Create directories with `fs.mkdir(downloadDir, { recursive: true })` before each download
- Track progress: on `data` event, accumulate `bytesDownloaded` and emit progress event
- Read `Content-Length` header from the GET response for `totalBytes` (default to `-1` if absent)
- Construct stream URL from IPTV API: uses the episode's `directSource` field if available, otherwise falls back to the pattern `http://{server}/series/{username}/{password}/{episodeId}.{containerExtension}` (matching the existing `buildUrl` in `stream-parser.ts`)

### Startup Behavior (B2 Persistence)

1. Load `downloads` from electron-store
2. Filter out completed items (shouldn't exist in store, but defensive check)
3. Delete partial files for any items not in `completed` status
4. Set all `downloading` items back to `queued`
5. Start processing first `queued` item

### Queue Processing Loop

1. Check if item is currently downloading (only one at a time)
2. Pick first `queued` item
3. Set status to `downloading`, emit `download:on-progress`
4. Create destination directory
5. Start HTTP download, pipe to file
6. On `data`: update `bytesDownloaded`, calculate `progress`, emit `download:on-progress`
7. On `end`: set `completed`, set `filePath`, emit `download:on-completed`, remove from store, advance
8. On `error`: set `error` status, emit `download:on-error`, advance to next

### Error Handling

- On network/download error: mark item as `error`, emit error event, advance to next queued item
- No automatic retry — user can re-queue manually
- Error message stored in `error` field of DownloadDTO

### Cancellation

- **Queued item**: Remove from queue, delete from store, emit removal
- **Downloading item**: Abort the HTTP request, delete the partial file, remove from queue, delete from store

### Atomic Commit

```
feat(download): add DownloadManager
```

Files: `src/main/download-manager.ts`, tests

### Tests — DownloadManager

- `enqueue()` adds item to queue, returns ID
- `enqueue()` starts processing if queue was empty
- Sequential processing: second item stays `queued` until first completes
- `cancel()` removes queued item
- `cancel()` aborts in-progress download and deletes partial file
- `cancelAll()` clears entire queue
- `getQueue()` returns current state snapshot
- B2 persistence on startup: loads from store, resets `downloading` to `queued`, deletes partials
- Completed items are not persisted to store
- Error on download: marks item as `error`, advances to next
- Auto-advance: on completion, starts next queued item
- File path construction: sanitizes serie name, formats `S01E01 - Title.mkv`
- Directory creation: `fs.mkdir` with `{ recursive: true }`

**File Sanitization**:
- Replaces `\/:*?"<>|` with underscores
- Handles empty names with fallback
- Handles names with multiple consecutive invalid characters

## IPC Channels

### Channel Constants

Add to `src/shared/constants/ipc.ts`:

```typescript
DOWNLOAD: {
  START: "download:start",
  START_SEASON: "download:start-season",
  CANCEL: "download:cancel",
  CANCEL_ALL: "download:cancel-all",
  GET_QUEUE: "download:get-queue",
  // Push channels (main → renderer)
  ON_PROGRESS: "download:on-progress",
  ON_COMPLETED: "download:on-completed",
  ON_ERROR: "download:on-error",
  ON_QUEUED: "download:on-queued",
}
```

### IPC Types

Add to `src/shared/types/ipc.ts`:

```typescript
export interface StartSeasonParams {
  serieId: number;
  seasonNumber: number;
}
```

Note: `download:start` takes `episodeId` as a scalar number param (following existing pattern for simple IDs). `download:start-season` takes `StartSeasonParams` object (following pattern for multi-field params).

### Main Process Handlers

New file `src/main/download-ipc.ts`:

```typescript
ipcMain.handle(IPC.DOWNLOAD.START, (_, episodeId: number) =>
  downloadManager.enqueue(episodeStream));

ipcMain.handle(IPC.DOWNLOAD.START_SEASON, (_, params: StartSeasonParams) => {
  // 1. Resolve active playlist credentials from electron-store
  // 2. Call existing GetSerieById use case with the serieId
  // 3. Find matching season by seasonNumber
  // 4. Map each episode to DownloadStream (episode variant)
  // 5. Enqueue all episodes in order via downloadManager.enqueue()
  // 6. Return array of download IDs
});

ipcMain.handle(IPC.DOWNLOAD.CANCEL, (_, downloadId: string) =>
  downloadManager.cancel(downloadId));

ipcMain.handle(IPC.DOWNLOAD.CANCEL_ALL, () =>
  downloadManager.cancelAll());

ipcMain.handle(IPC.DOWNLOAD.GET_QUEUE, () =>
  downloadManager.getQueue());
```

The `start-season` handler uses the existing `APISeriesRepository.getById()` → `Serie` entity → finds the season → maps episodes to `DownloadStream`. No new API calls needed.

### Preload API

Add `download` namespace to `window.api` in `src/preload/preload.ts`:

```typescript
download: {
  start(episodeId: number): Promise<string>;
  startSeason(params: StartSeasonParams): Promise<string[]>;
  cancel(downloadId: string): Promise<void>;
  cancelAll(): Promise<void>;
  getQueue(): Promise<DownloadDTO[]>;
  onProgress(callback: (item: DownloadDTO) => void): () => void;
  onCompleted(callback: (item: DownloadDTO) => void): () => void;
  onError(callback: (item: DownloadDTO) => void): () => void;
  onQueued(callback: (item: DownloadDTO) => void): () => void;
}
```

Each `on*` method:
- Bridges via `ipcRenderer.on(channel, (_, payload) => callback(payload))`
- Returns unsubscribe function: `() => ipcRenderer.removeListener(channel, listener)`

### Window.api Type

Update `Api` interface in `src/shared/types.ts` to include the `download` namespace matching the preload shape.

### Atomic Commit

```
feat(download): add DOWNLOAD IPC channel constants
```

Files: `src/shared/constants/ipc.ts`

```
feat(download): add download IPC handlers
```

Files: `src/main/download-ipc.ts`, `src/main/main.ts`

```
feat(download): add download preload API
```

Files: `src/preload/preload.ts`, `src/shared/types.ts`

### Tests — IPC

**IPC Flow** (`src/main/download-ipc.ts`):
- `download:start` with episode ID enqueues and returns download ID
- `download:start-season` fetches serie, finds season, enqueues all episodes in order
- `download:cancel` cancels by ID
- `download:cancel-all` clears queue
- `download:get-queue` returns current queue state
- Push events are sent via `webContents.send()` on progress, completion, error, queued

**Preload Bridge** (`src/preload/preload.ts`):
- All `download.*` methods correctly bridge to IPC
- `on*` methods correctly subscribe and return unsubscribe functions
- Unsubscribe functions remove listeners properly

## Renderer State Management

### Zustand Store

`src/renderer/stores/downloadStore.ts`:

```typescript
interface DownloadState {
  items: Map<string, DownloadDTO>;

  updateProgress: (item: DownloadDTO) => void;
  markCompleted: (item: DownloadDTO) => void;
  markError: (item: DownloadDTO) => void;
  addQueued: (item: DownloadDTO) => void;
  removeItem: (id: string) => void;
  syncQueue: (items: DownloadDTO[]) => void;
}
```

**Initialization**: On `<App>` mount, call `window.api.download.getQueue()` then `syncQueue()`. Subscribe to all `on*` events. On unmount, call all unsubscribe functions.

**Derived selectors**:
- `getByEpisodeId(episodeId: number)` — find download item matching an episode
- `getSeasonProgress(serieId, seasonNumber)` — aggregate: completed count / total episodes for a season
- `getOverallProgress()` — total completed / total items for batch download

### Atomic Commit

```
feat(download): add download Zustand store
```

Files: `src/renderer/stores/downloadStore.ts`, `src/renderer/App.tsx`

### Tests — Download Store

**Download Store** (`src/renderer/stores/downloadStore.ts`):
- `syncQueue()` populates items from array
- `updateProgress()` updates existing item
- `markCompleted()` updates item and removes from active tracking
- `markError()` updates item status
- `addQueued()` adds new item
- `removeItem()` removes by ID
- `getByEpisodeId()` finds matching episode download
- `getSeasonProgress()` calculates aggregate progress correctly

## UI Components

### CircularProgress Component

`src/renderer/components/CircularProgress.tsx`

SVG-based circular progress indicator:

- **Outer circle**: progress arc using `stroke-dasharray` / `stroke-dashoffset`
- **Inner circle**: background track, muted/faded color
- **Center**: icon or percentage text

| Status | Visual | Color |
|--------|--------|-------|
| idle (hover) | Download arrow icon | Purple (brand) |
| queued | Clock icon | Gray, no arc |
| downloading | Percentage text or spinning arc | Purple arc fill |
| completed | Checkmark icon | Green, full arc |
| error | X icon | Red |
| cancelled | Strikethrough icon | Gray |

Size: compact enough to fit alongside episode/season buttons (~28-32px).

### EpisodeInfo Integration

Add `CircularProgress` to each episode row, right-aligned:

- Click handlers:
  - Idle → `window.api.download.start(episodeId)`
  - Queued/Downloading → `window.api.download.cancel(downloadId)`
- State lookup: `useDownloadStore().getByEpisodeId(episode.id)`
- Show episode progress (0-100%)

### SerieInfo Integration (Season Buttons)

Add `CircularProgress` to each season button, right-aligned:

- Click handler:
  - Idle → `window.api.download.startSeason({ serieId, seasonNumber })`
- State lookup: `useDownloadStore().getSeasonProgress(serieId, seasonNumber)`
- Show aggregate progress: completed episodes / total episodes

### Atomic Commit

```
feat(download): add CircularProgress component
```

Files: `src/renderer/components/CircularProgress.tsx`

```
feat(download): integrate CircularProgress into EpisodeInfo and SerieInfo
```

Files: `src/renderer/pages/series/EpisodeInfo.tsx`, `src/renderer/pages/series/SerieInfo.tsx`

### Tests — UI Components

**CircularProgress** (`src/renderer/components/CircularProgress.tsx`):
- Renders correct icon/content for each status (idle, queued, downloading, completed, error, cancelled)
- Progress arc reflects percentage correctly (`stroke-dashoffset` calculation)
- Click handlers fire correctly for each status

## Download Directory

- Default: `~/Downloads/IPTVI` (resolved via `path.join(os.homedir(), 'Downloads', 'IPTVI')`)
- Stored in electron-store as `downloadDir`
- If empty/unset, resolved at runtime to default
- `DownloadManager` creates directories on demand with `fs.mkdir(dir, { recursive: true })`
- See [settings spec](./2026-05-21-settings-download-dir-design.md) for future UI configuration

## File Structure

New files to create:

```
src/
├── core/domain/entities/download.ts          # Download entity
├── main/download-manager.ts                  # DownloadManager class
├── main/download-ipc.ts                      # IPC handler registration
├── renderer/stores/downloadStore.ts          # Zustand store
├── renderer/components/CircularProgress.tsx   # SVG progress component
└── shared/
    ├── types/dto.ts                          # Add DownloadDTO
    └── types/ipc.ts                          # Add DownloadStream, StartSeasonParams
    └── constants/ipc.ts                      # Add DOWNLOAD channels
    └── types.ts                              # Update Api interface
    └── store.ts                              # Update StoreSchema
    └── preload/preload.ts                    # Add download namespace
```

Files to modify:

```
src/main/main.ts                    # Register download IPC
src/renderer/App.tsx                # Initialize download store + subscribe to events
src/renderer/pages/series/EpisodeInfo.tsx  # Add CircularProgress to episode rows
src/renderer/pages/series/SerieInfo.tsx    # Add CircularProgress to season buttons
```