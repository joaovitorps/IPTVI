# Download Feature Enhancements

Date: 2026-05-21

Planned enhancements for the download feature, to be implemented after the core feature is stable.

See [main design](./2026-05-21-download-feature-design.md) for the current implementation scope.

## 1. HTTP Range Resume (A1)

Currently using B2 persistence (queue saved, completed items skipped, incomplete restart fresh). This enhancement adds byte-level resume:

- Save download state (episode info, bytes downloaded, file path) to electron-store
- On restart, get a fresh stream URL from the IPTV API (URLs are time-limited tokens)
- Use HTTP `Range` headers to resume from last byte written
- Validate partial file integrity (check file size matches bytes downloaded)
- Fallback: if Range not supported by server, restart download fresh

**Complexity**: Medium-high. Requires byte tracking, file handle management, fresh URL re-authentication, and integrity checks.

**Benefit**: Saves bandwidth on interrupted downloads, especially for large files.

## 2. Downloads Panel / Drawer

A slide-out panel accessible from anywhere in the app showing:

- Full download queue with individual progress bars (linear, not circular)
- Cancel buttons per item
- Overall batch progress (X of Y complete)
- Status filters (all, downloading, completed, errors)
- Re-queue failed downloads

**Complexity**: Medium. New UI component + minor state additions.

**Benefit**: Management view for active downloads without navigating away from current page.

## 3. Movie Downloads

The `DownloadStream` discriminated union already defines a `movie` variant:

```typescript
| {
    type: "movie";
    movieId: number;
    title: string;
    containerExtension: string;
  }
```

Implementation requires:

- New IPTV API integration (`?action=get_vod_streams`, `?action=get_vod_info`)
- Movie listing and detail pages in the renderer
- Movie entity, repository, and use cases (following existing series patterns)
- `download:start-movie` IPC channel and preload method
- File path: `MovieName/MovieTitle.mkv`

**Complexity**: Medium. Mostly repetitive work following existing patterns for series.

**Benefit**: Completes the content type coverage for downloading.

## 4. Settings Page — Download Directory

See [settings spec](./2026-05-21-settings-download-dir-design.md) for the full design.

Briefly: a settings page where users can change the download directory via an OS directory picker dialog, view current path, and reset to default.