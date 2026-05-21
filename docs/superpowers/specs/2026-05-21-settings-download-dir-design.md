# Settings — Download Directory Configuration

Date: 2026-05-21

## Overview

A settings page allowing users to configure the download directory. The initial implementation hardcodes `~/Downloads/IPTVI` as the default. This spec defines the UI for changing it.

Referenced from [download enhancements](./2026-05-21-download-feature-enhancements.md).

## Design

### New Route

`/settings` — accessible from a gear icon in the app navigation.

### UI Layout

Simple settings page with a single section:

```
┌─────────────────────────────────────┐
│ Downloads                           │
│                                     │
│ Download Location                    │
│ ┌───────────────────────────┐  ┌──┐ │
│ │ ~/Downloads/IPTVI         │  │📂│ │
│ └───────────────────────────┘  └──┘ │
│ Reset to default                    │
│                                     │
└─────────────────────────────────────┘
```

- **Text field**: Shows current download directory (read-only)
- **Folder button**: Opens native OS directory picker via `dialog.showOpenDialog({ properties: ['openDirectory'] })`
- **Reset link**: Resets `downloadDir` in store to empty string, which resolves to the default `~/Downloads/IPTVI`

### IPC

New channels in `DOWNLOAD` namespace:

```typescript
DOWNLOAD: {
  // ...existing channels...
  GET_DOWNLOAD_DIR: "download:get-download-dir",
  SET_DOWNLOAD_DIR: "download:set-download-dir",
  OPEN_DIR_PICKER: "download:open-dir-picker",
}
```

- `GET_DOWNLOAD_DIR`: Returns current download dir path
- `SET_DOWNLOAD_DIR`: Saves new path to electron-store
- `OPEN_DIR_PICKER`: Opens native directory picker, returns selected path or null

### Validation

- Must be a writable directory (or parent must exist and be writable)
- If the selected directory is not writable, show an error and don't save
- Moving the directory does NOT move existing downloads — user is responsible for that

### Store Changes

`downloadDir` in StoreSchema is already defined in the main feature spec. This enhancement adds the UI to change it.

### Active Downloads Guard

If downloads are in progress when the user changes the directory:

- Show confirmation dialog: "Downloads are in progress. Changing the directory will only affect new downloads. Current downloads will continue to the existing location."
- Option to cancel or confirm

### Preload API Extension

```typescript
download: {
  // ...existing methods...
  getDownloadDir(): Promise<string>;
  setDownloadDir(path: string): Promise<void>;
  openDirPicker(): Promise<string | null>;
}
```

### Window.api Type Extension

Add the three new methods to the `download` namespace in the `Api` interface.

### File Structure

New files:

```
src/renderer/pages/Settings.tsx              # Settings page component
```

Files to modify:

```
src/renderer/App.tsx                          # Add /settings route
src/shared/constants/ipc.ts                  # Add 3 new channels
src/shared/types.ts                           # Update Api interface
src/shared/types/ipc.ts                       # Add new types if needed
src/preload/preload.ts                        # Add 3 new methods
src/main/download-ipc.ts                      # Add 3 new handlers
```