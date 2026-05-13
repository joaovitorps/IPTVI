# HLS Transcoding Configuration Reference

Date: 2026-05-12
Status: Reference Doc

## Configuration Options

All HLS transcoding behavior is configured through constants in the source files. There is no runtime configuration file — settings are compile-time constants in the child process code.

### Segment Duration

**File**: `src/main/stream-parser.ts`

| Constant | Default | Description |
|----------|---------|-------------|
| `HOST` | `"127.0.0.1"` | HTTP server bind address |
| `PORT` | `9876` | HTTP server port |
| `HLS_BASE_DIR` | `"/tmp/hls"` | Base directory for HLS segments |
| `SEGMENT_TIMEOUT` | `60000` | Max ms to wait for first segment before error |

### Encoder Settings

**File**: `src/main/ffmpeg-builder.ts`

The `buildFfmpegArgs` function hardcodes these ffmpeg options:

| Option | Value | Purpose |
|--------|-------|---------|
| Video codec | `libx264` | H.264 — broadest browser support |
| Audio codec | `aac` | Advanced Audio Codec — universal browser support |
| Subtitle codec | `webvtt` | Only format HTML5 video/hls.js supports natively |
| Segment duration | `-hls_time 6` | 6 second segments |
| Playlist size | `-hls_list_size 0` | Keep all segments in playlist |
| Master playlist | `-master_pl_name master.m3u8` | Auto-generated master playlist name |

### Quality Variants

Two video variants are always produced:

| Variant | Resolution | Bitrate |
|---------|-----------|---------|
| 720p | 1280x720 | 3000 kbps |
| 360p | 640x360 | 1000 kbps |

To add additional variants (e.g., 1080p, 480p), edit `buildFfmpegArgs` in `src/main/ffmpeg-builder.ts` and add new `-map`, `-c:v`, `-b:v:N`, and `-s:v:N` entries.

### ffprobe Timeout

**File**: `src/main/ffprobe-prober.ts`

The `probeStream` function accepts a `timeout` parameter (default: 30000ms). If ffprobe does not respond within this window, an `FFprobeError` with code `TIMEOUT` is thrown.

## Child Process Message Protocol

### Parent → Child

```typescript
// Start transcoding
{ type: "credentials", playlistId: string, server: string, username: string, password: string, streamId: string }

// Graceful shutdown
{ type: "shutdown" }
```

### Child → Parent

```typescript
// Ready signal
{ type: "ready", pid: number, hlsPlaylist: string, tracks: HlsTrackInfo[] }

// Error signal
{ type: "error", message: string }
```

## Electron Forge Configuration

**File**: `forge.config.ts`

```typescript
packagerConfig: {
  asar: true,
  asarUnpack: [
    "node_modules/ffmpeg-static/**",
    "node_modules/ffprobe-static/**",
  ],
}
```

The `ffmpeg-static` and `ffprobe-static` packages are ~40MB combined. Both must be unpacked from the ASAR archive to function as executables. The paths are resolved at runtime:

```typescript
import ffmpegPath from "ffmpeg-static";       // string → binary path
import ffprobe from "ffprobe-static";          // { path: string }
```

## Startup Latency

| Content Duration | Typical first segment time |
|-----------------|---------------------------|
| 30 min | ~5-8 seconds |
| 1 hour | ~7-12 seconds |
| 2 hours | ~10-15 seconds |

The Player component shows a "Transcoding..." loading state during this window.

## Cleanup Behavior

On any of these events, the child process kills ffmpeg (`SIGTERM`), closes the HTTP server, and recursively deletes the temp HLS directory:

- `SIGINT` / `SIGTERM` signals
- `disconnect` event (parent closed IPC)
- `shutdown` message from parent
- `uncaughtException` / `unhandledRejection`
- Process exit

The parent lifecycle manager also force-kills the child if graceful shutdown exceeds 10 seconds.

## Resource Usage (per stream)

| Resource | Usage |
|----------|-------|
| CPU | ~30-50% of one core |
| Disk | ~200MB per 2-hour video |
| Temp dir | `/tmp/hls/<playlistId>/` |
| Bundled binary size | ~40MB (ffmpeg + ffprobe) |
