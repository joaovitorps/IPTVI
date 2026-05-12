# Path B: HLS Transcoding Architecture

Date: 2026-05-12
Status: Design Doc (decision pending)

## The Core Concept

Instead of serving the raw MKV file via byte-range proxy, the backend spawns ffmpeg to **transcode the MKV into HLS** (HTTP Live Streaming) format. This enables:

- **Adaptive Bitrate (ABR)** — player auto-switches quality based on network conditions
- **Audio track switching** — user changes language mid-playback
- **Subtitle track switching** — user toggles subs on/off mid-playback

## Background

The current architecture (`src/main/stream-parser.ts`) acts as a byte-range proxy for a single MKV file from the upstream provider. This gives us:

- Zero adaptation to network conditions
- No ability to switch audio/subtitle tracks (tracks are burned into the container)
- No path to premium features like quality tiers

This design doc explores a complete rewrite of the streaming pipeline to use HLS.

## How HLS Works

HLS (HTTP Live Streaming) splits video into small timed segments and creates playlist files referencing them.

### Playlist Structure

```
master.m3u8  ← entry point, lists all available variant streams
├── stream_0.m3u8                  → Video 720p (segments: stream_0_0.ts, stream_0_1.ts, ...)
├── stream_1.m3u8                  → Video 360p (segments: stream_1_0.ts, stream_1_1.ts, ...)
├── stream_2.m3u8                  → Audio English (segments: stream_2_0.ts, ...)
├── stream_3.m3u8                  → Audio Portuguese (segments: stream_3_0.ts, ...)
└── stream_4.m3u8                  → Subtitles English (segments: stream_4_0.vtt, ...)
```

### How Playback Works

1. Frontend loads `master.m3u8`
2. Based on network, frontend picks the appropriate video variant (e.g., 720p or 360p)
3. Frontend also picks the selected audio track + subtitle track
4. Player fetches segments sequentially, stitching them seamlessly
5. **Switching** (quality, audio, subs) happens at segment boundaries — instant since all streams are time-aligned

## What ffmpeg Does

The backend (`stream-parser.ts`) spawns ffmpeg as a child subprocess:

```bash
ffmpeg -i <upstream-mkv-url>
  -map 0:v:0 -c:v libx264 -b:v:0 3000k -s:v:0 1280x720 \
  -map 0:v:0 -c:v libx264 -b:v:1 1000k -s:v:1 640x360 \
  -map 0:a:0 -c:a aac -b:a 128k \
  -map 0:a:1 -c:a aac -b:a 128k \
  -map 0:s:0 -c:s webvtt \
  -f hls -hls_time 6 -hls_list_size 0 \
  -master_pl_name master.m3u8 \
  /tmp/hls/stream_%v.m3u8
```

### Flag Breakdown

| Flag | Purpose |
|------|---------|
| `-i <url>` | Input: the upstream MKV URL |
| `-map 0:v:0` | Take video track 0 from input |
| `-c:v libx264` | Encode video to H.264 (broadest browser support) |
| `-b:v:0 3000k -s:v:0 1280x720` | First video variant: 720p @ 3 Mbps |
| `-b:v:1 1000k -s:v:1 640x360` | Second video variant: 360p @ 1 Mbps |
| `-map 0:a:N` | Each audio track gets its own AAC stream |
| `-c:a aac` | Audio codec: AAC (universal browser support) |
| `-map 0:s:0` | Subtitle track, converted to WebVTT |
| `-c:s webvtt` | WebVTT is natively supported by browsers |
| `-f hls` | Output format: HLS |
| `-hls_time 6` | Segment duration: 6 seconds |
| `-hls_list_size 0` | Keep all segments in playlist (not just recent N) |
| `-master_pl_name master.m3u8` | Auto-generate master playlist |

### Output Directory

```
/tmp/hls/<playlistId>/
├── master.m3u8              ← Entry point for frontend
├── stream_0.m3u8            ← Video 720p playlist
├── stream_0_0.ts            ← Video segment
├── stream_0_1.ts
├── stream_1.m3u8            ← Video 360p playlist
├── stream_1_0.ts
├── stream_2.m3u8            ← Audio English playlist
├── stream_2_0.aac
├── stream_3.m3u8            ← Audio Portuguese playlist
├── stream_3_0.aac
├── stream_4.m3u8            ← Subtitles playlist
└── stream_4_0.vtt
```

## Full Data Flow

```
1. User clicks play → Player.tsx mounts
2. window.api.streamServer.start() called
3. Backend forks child process (existing architecture)
4. Child process:
   a. Reads credentials (existing flow)
   b. Builds upstream MKV URL (existing flow)
   c. Spawns ffmpeg with the URL and output config
   d. Starts a new HTTP server to serve HLS segments
5. ffmpeg:
   a. Fetches MKV from upstream
   b. Decodes video frames → re-encodes at 720p + 360p
   c. Extracts each audio track → separate AAC stream
   d. Converts subtitles → WebVTT
   e. Writes segments + playlists to /tmp/hls/<id>/
6. After first segment is produced (~6s), backend signals "ready"
7. Response to frontend:
   {
     ok: true,
     status: {
       baseUrl: "http://127.0.0.1:9876",
       hlsPlaylist: "/hls/<playlistId>/master.m3u8",
       tracks: [
         { id: 0, type: "video", name: "720p", bitrate: 3000 },
         { id: 1, type: "video", name: "360p", bitrate: 1000 },
         { id: 0, type: "audio", name: "English", lang: "eng", default: true },
         { id: 1, type: "audio", name: "Portuguese", lang: "por" },
         { id: 0, type: "subtitle", name: "English", lang: "eng" }
       ]
     }
   }
8. Frontend loads master.m3u8 via hls.js
9. hls.js handles ABR automatically
10. User switches audio/subtitles mid-playback via hls.js API
```

## Frontend: hls.js Integration

### Track Switching API

hls.js provides native APIs for listing and switching tracks:

```typescript
import Hls from "hls.js";

const hls = new Hls();
const video = document.getElementById("video");

hls.attachMedia(video);
hls.loadSource("http://localhost:9876/hls/<id>/master.m3u8");

// Audio tracks
hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
  const tracks = hls.audioTracks;
  // tracks: [{ id, name, lang, default }, ...]
  tracks.forEach(t => console.log(t.name, t.lang));
});

hls.audioTrack = 1; // Switch to Portuguese mid-playback

// Subtitle tracks
hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
  const tracks = hls.subtitleTracks;
  // tracks: [{ id, name, lang }, ...]
});

hls.subtitleTrack = 0;  // Show subtitles
hls.subtitleTrack = -1; // Hide subtitles
```

### Integration with Vidstack

Vidstack has a first-class HLS provider that wraps hls.js. The integration would look like:

```tsx
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { HlsProvider } from "@vidstack/react/player/hls";

<MediaPlayer src="http://localhost:9876/hls/<id>/master.m3u8">
  <HlsProvider>
    <MediaProvider />
  </HlsProvider>
</MediaPlayer>
```

The HLS provider exposes hls.js events through Vidstack's event system.

## hls.js Bundling

hls.js is an npm package. Install it directly:

```bash
npm install hls.js
```

If using Vidstack's HlsProvider, it may manage hls.js internally. Check `@vidstack/react` v1.12.13 documentation for the HLS provider.

## ffmpeg Bundling for Electron

ffmpeg is NOT an npm package. Options:

| Option | Size | Pros | Cons |
|--------|------|------|------|
| **`ffmpeg-static`** | ~40MB | Pure npm install, bundled per platform | Increases app bundle size |
| **`@ffmpeg/ffmpeg` (WASM)** | ~30MB | No native binary, runs in-process | Slower, less feature-complete |
| **Download at install** | — | Smaller repo | Postinstall step, network dependency |
| **System ffmpeg** | — | No bundle cost | Fragile, user must install manually |

Recommendation: `ffmpeg-static` — it's the standard approach for Electron apps that need ffmpeg.

## Startup Latency

ffmpeg must produce its first HLS segment before playback can begin. This is the main UX cost:

| Duration | Approx. first segment time |
|----------|---------------------------|
| 1 hour | ~7-12 seconds |
| 2 hours | ~10-15 seconds |
| 30 min | ~5-8 seconds |

**Mitigation**: Show a "Transcoding..." loading state with estimated wait time in the Player UI.

## Trade-offs vs Current Architecture

| Aspect | Current (Byte-range MKV) | Path B (HLS) |
|--------|--------------------------|--------------|
| **Network adaptation** | None — single bitrate, buffers or fails | Auto ABR — adjusts to network |
| **Audio switching** | Not possible (single container) | Mid-playback, instant |
| **Subtitle switching** | Not possible | Mid-playback, toggle on/off |
| **Startup delay** | ~1 second | ~5-15 seconds (first segment) |
| **CPU per stream** | Negligible (proxy only) | 30-50% of one core (ffmpeg) |
| **Disk usage** | None | ~200MB per 2h video (temp) |
| **Code complexity** | Low | High (ffmpeg lifecycle, cleanup) |
| **ffmpeg dependency** | None | Yes (~40MB ffmpeg-static) |
| **Premium feature path** | Limited | Quality tiers, multi-language, etc. |

## Cleanup and Resource Management

The HLS approach requires careful resource cleanup:

1. **On play / unmount**: Kill ffmpeg child process, delete temp directory
2. **On error**: Same as unmount, ensure no zombie processes
3. **On user navigation**: Same as unmount
4. **On process exit**: Cleanup registered in `process.on("exit")` handlers

The current architecture already has a shutdown mechanism — it would be extended to:
- `ffmpeg.kill("SIGTERM")`
- `fs.rmSync(tempDir, { recursive: true })`

## Implementation Order (High-Level)

1. Install `hls.js` and `ffmpeg-static` npm dependencies
2. Refactor `stream-parser.ts` to spawn ffmpeg instead of acting as byte-range proxy
3. Serve the HLS output directory via a new HTTP route handler
4. Extend server start response type to include `hlsPlaylist` URL and `tracks` array
5. Update `Player.tsx` to:
   - Load master.m3u8 via hls.js (or Vidstack HLS provider)
   - Show loading state during ffmpeg startup
   - Listen for audio/subtitle track events
   - Build a track selector UI overlay
   - Show available tracks when server responds
   - Allow mid-playback switching
6. Implement cleanup: kill ffmpeg + delete segments on unmount/error
7. Handle race conditions: what if user navigates before ffmpeg finishes startup?
8. Profile CPU/memory usage for concurrent streams

## Open Questions

1. **How many concurrent streams are expected?** At ~40% CPU per stream, a dual-core machine tops out at ~3-4 simultaneous transcodes.
2. **Do we need more quality variants?** 720p + 360p is a good starting point. 1080p and 480p could be added as a premium feature.
3. **Should we cache segments across plays of the same content?** If same video is watched multiple times, cached segments would skip the startup delay entirely.
4. **Vidstack HLS provider compatibility** — needs verification with `@vidstack/react` v1.12.13. Fallback: use hls.js directly with a `<video>` element.
