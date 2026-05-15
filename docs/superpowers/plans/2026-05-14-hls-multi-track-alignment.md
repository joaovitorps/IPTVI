# HLS multi-audio/subtitle alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make packaged HLS expose alternate audio and subtitle renditions in `master.m3u8` (so Vidstack/hls.js can list them), filter out non-WebVTT-convertible subtitle codecs, and drive the Player audio/subtitle UI from the tracks the player actually loads—not from an optimistic ffprobe-only list.

**Architecture:** Extend `buildFfmpegArgs` to use the HLS muxer’s explicit variant/rendition mapping (`-var_stream_map`, and related `-master_pl_publish_rate` / stream group options as needed for your FFmpeg build). Return `HlsTrackInfo[]` that matches only streams included in that map. On the renderer, subscribe to Vidstack’s `MediaPlayer` audio/text track APIs (and relevant load events) to populate selectors and apply selection via `audioTracks[n].selected` and `textTrack.mode`.

**Tech Stack:** Electron main (`ffmpeg`/`ffprobe`), Vitest, React, `@vidstack/react`, HLS.js (via Vidstack HLS provider).

**References:**
- [Vidstack audio tracks](https://vidstack.io/docs/player/api/audio-tracks/)
- [ffplayout multi-audio HLS (var_stream_map examples)](https://github.com/ffplayout/ffplayout/blob/master/docs/multi_audio.md)
- FFmpeg docs: `ffmpeg-all.html` → muxers → `hls` → `var_stream_map`, `master_pl_name`, `hls_group_id`

---

## File map

| File | Responsibility |
|------|----------------|
| `src/main/ffmpeg-builder.ts` | Build correct `-map` / encode / `-var_stream_map` / HLS output paths; emit accurate `tracks` metadata (video + packaged audio + packaged subtitles only). |
| `src/main/ffprobe-prober.ts` | Already exposes `codec_name` per stream; may add a tiny helper or export a constant list of **text** subtitle codecs safe for `-c:s webvtt` (or implement filter in builder only—YAGNI). |
| `tests/unit/ffmpeg-builder.spec.ts` | Assertions for new args (`-var_stream_map`, output segment naming), skipped bitmap subs, and revised `tracks` lengths/labels. |
| `src/renderer/pages/Player.tsx` | Audio/subtitle menus from live `playerRef` track lists; handlers index into those lists; visibility when `audioTracks.length > 1` or usable text tracks exist. |
| `docs/superpowers/specs/2026-05-12-hls-transcoding-design.md` | Optional follow-up: correct the example command to mention `-var_stream_map` (only if you keep design docs in sync with behavior). |

---

### Task 1: Define subtitle packaging policy (text vs bitmap)

**Files:**
- Modify: `src/main/ffmpeg-builder.ts`
- Test: `tests/unit/ffmpeg-builder.spec.ts`

- [ ] **Step 1: Add a pure helper to classify subtitle streams**

Add a function (same file or `ffmpeg-subtitle-codecs.ts` if you prefer separation) that, given `codec_name` from ffprobe, returns whether the stream may be encoded to WebVTT for HLS. **Include** common text codecs: `subrip`, `ass`, `ssa`, `mov_text`, `webvtt`, `srt` (alias), etc. **Exclude** bitmap / HDMV / VobSub style: `hdmv_pgs_subtitle`, `dvd_subtitle`, `dvb_subtitle`, `xsub`, `bin_data` when reported as subtitle, etc.

```typescript
/** Subtitle streams we attempt to package as WebVTT for HLS. Bitmap-based codecs are skipped. */
export function isWebVttPackagableSubtitleCodec(codecName: string | undefined): boolean {
  if (!codecName) return false;
  const c = codecName.toLowerCase();
  const bitmap = new Set([
    "hdmv_pgs_subtitle",
    "dvd_subtitle",
    "dvb_subtitle",
    "xsub",
    "dvdsub",
    "pgssub",
  ]);
  if (bitmap.has(c)) return false;
  const textish = new Set([
    "subrip",
    "srt",
    "ass",
    "ssa",
    "mov_text",
    "webvtt",
    "text",
    "eia_608",
  ]);
  return textish.has(c);
}
```

- [ ] **Step 2: Write failing tests for skipped PGS / VobSub**

In `tests/unit/ffmpeg-builder.spec.ts`, add a probe with `codec_name: "hdmv_pgs_subtitle"` (and optionally `dvd_subtitle`). Assert: no `-map` for that stream, no matching `HlsTrackInfo` with `type: "subtitle"` for it, and `tracks` subtitle count excludes it.

Run:

```bash
cd /Users/joao/Projects/IPTVI && npx vitest run tests/unit/ffmpeg-builder.spec.ts -t "PGS"
```

Expected: FAIL until Task 2 implements filtering.

---

### Task 2: FFmpeg HLS — `var_stream_map` and aligned `tracks`

**Files:**
- Modify: `src/main/ffmpeg-builder.ts`
- Modify: `tests/unit/ffmpeg-builder.spec.ts`

- [ ] **Step 1: Filter subtitle streams before mapping**

Build `subtitleStreamsPackagable` = `subtitleStreams.filter(s => isWebVttPackagableSubtitleCodec(s.codec_name))`. Use **stream-relative** indices for `-map` (same as today: `0:s:<idx>` where `idx` is the index among **all** subtitle streams in the file, not the filtered list). Easiest approach: iterate **all** subtitles with a running `subtitleStreamIndex`, only `-map` when packagable; push `HlsTrackInfo` only for mapped ones. Alternatively remap only packagable streams by storing `inputSubtitleIndex` on each candidate—pick one approach and keep tests explicit.

- [ ] **Step 2: Design `var_stream_map` for this project’s layout**

Target layout (must match generated master):

- **Two video variants** (720p + 360p), both from the same source video (current behavior: two `-map 0:v:...` encodes).
- **N audio streams** → alternate renditions in a **single audio group** so each video variant references the group (not N×M duplicate variant rows unless you intentionally choose that model).
- **M text subtitles** → `SUBTITLES` group; each video variant references the same subtitle group.

Concrete pattern to implement (verify with your installed `ffmpeg -version`; adjust comma quoting for shell vs `spawn` args array):

1. After all `-map` and codec options, append `-var_stream_map` with a string built from:
   - For each audio stream `i`: `a:<i>,agroup:audio,name:<label>,language:<lang>,default:yes|no` (escape commas in `name` if needed—prefer sanitizing labels to `[A-Za-z0-9 _-]+`).
   - For each packaged subtitle `j`: `s:<j>,sgroup:subs,name:<label>,language:<lang>` (subtitle output stream indices `s:0`, `s:1` are **output** subtitle indices in order of mapped subtitle encodes—align with FFmpeg’s ordering).
   - For each video variant `k` in `{0,1}`: `v:<k>,agroup:audio,sgroup:subs` (if no subtitles, omit `sgroup:subs` entirely).

Example shape (illustrative—**derive indices from your actual output stream order**):

```text
a:0,agroup:audio,name:English,language:eng,default:yes a:1,agroup:audio,name:Portuguese,language:por s:0,sgroup:subs,name:English,language:eng v:0,agroup:audio,sgroup:subs v:1,agroup:audio,sgroup:subs
```

2. Keep `-f hls`, `-hls_time`, `-hls_list_size`, `-master_pl_name master.m3u8`.
3. Replace single `%v` variant template with a pattern compatible with `var_stream_map` (often `%v` still works for variant indices; if FFmpeg warns, switch to explicit `stream_%%v.m3u8` or the pattern recommended in your FFmpeg build’s HLS docs). **Manual verification:** while transcoding, `curl -s "http://127.0.0.1:<port>/hls/<id>/master.m3u8"` must show `#EXT-X-MEDIA:TYPE=AUDIO` and, when subs exist, `#EXT-X-MEDIA:TYPE=SUBTITLES`.

- [ ] **Step 3: Update `tracks` to mirror packaged outputs only**

Order suggestion (stable for UI): all `video` entries first (720p, 360p), then all `audio`, then all `subtitle`—each with sequential `id`. Do **not** list subtitles that were skipped as non-packagable.

- [ ] **Step 4: Update unit tests for args and metadata**

Update existing tests that assert `stream_%v.m3u8` and absence/presence of `-var_stream_map`. Fix the first test’s audio map expectations: it should assert **both** `0:a:0` and `0:a:1` when two audio streams exist (current file only checks `0:a:1`).

Run:

```bash
cd /Users/joao/Projects/IPTVI && npx vitest run tests/unit/ffmpeg-builder.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main/ffmpeg-builder.ts tests/unit/ffmpeg-builder.spec.ts
git commit -m "fix(hls): var_stream_map and packagable subtitles for master playlist"
```

---

### Task 3: Player — drive audio/subtitle UI from Vidstack

**Files:**
- Modify: `src/renderer/pages/Player.tsx`
- (Types only if needed) `src/shared/types/ipc.ts` — **avoid** changing `HlsTrackInfo` unless you add optional fields; prefer internal UI types in `Player.tsx`.

- [ ] **Step 1: Introduce state for player-native tracks**

Replace `tracks`-based `audioTracks` / `subtitleTracks` **for the selector** with state derived from the player instance, e.g.:

```typescript
type PlayerAudioOption = { id: string; label: string; lang?: string; index: number };
type PlayerSubtitleOption = { id: string; label: string; lang?: string; index: number };
```

Populate in a `syncTracksFromPlayer()` that reads `playerRef.current` (cast or use Vidstack types if already available): `audioTracks` (list + `selected`), `textTracks` filtered to `kind === "subtitles" || kind === "captions"`.

- [ ] **Step 2: Call `syncTracksFromPlayer` on the right events**

Wire `MediaPlayer` props such as `onLoadedMetadata`, `onCanPlay`, and/or `onHlsManifestLoaded` / provider events (use Vidstack’s documented events for HLS variant/rendition updates). On each relevant event, refresh lists and set `activeAudioTrack` to the index/id of the currently `selected` audio track; set `activeSubtitleTrack` to the index of the track with `mode === "showing"` or `-1` for off.

- [ ] **Step 3: Change handlers to use player list indices**

`handleAudioTrackChange`: set `player.audioTracks[i].selected = true` where `i` matches the clicked **player** option’s `index` (not backend `HlsTrackInfo.id`).

`handleSubtitleTrackChange(null)`: disable all caption/subtitle text tracks. For a specific track: set `mode = "showing"` on the chosen track and `disabled` on others.

- [ ] **Step 4: Visibility condition**

Show the Languages control when `playerAudioOptions.length > 1` OR `playerSubtitleOptions.length > 0` (allow “subtitles only” and “audio only” cases).

- [ ] **Step 5: Optional — backend `tracks` usage**

Either remove `setTracks(trackList)` entirely or keep it only for debugging / future video-quality UI—**do not** use it for audio/subtitle buttons anymore.

- [ ] **Step 6: Lint**

```bash
cd /Users/joao/Projects/IPTVI && npm run lint
```

Expected: no new errors in `Player.tsx`.

- [ ] **Step 7: Commit**

```bash
git add src/renderer/pages/Player.tsx
git commit -m "fix(player): audio and subtitle menus follow Vidstack HLS tracks"
```

---

### Task 4: Manual end-to-end verification (required before claiming fixed)

- [ ] **Step 1: Master playlist check**

Start a stream with a file that has 2+ AAC (or transcodeable) audio tracks and at least one SRT/ASS subtitle. Confirm `master.m3u8` contains `#EXT-X-MEDIA:TYPE=AUDIO` entries (and `TYPE=SUBTITLES` when applicable).

- [ ] **Step 2: Player check**

In the running app, open DevTools and confirm `player.audioTracks.length` matches the UI and switches when selecting another language. Confirm subtitle entries appear only when `textTracks` lists them and toggling works.

- [ ] **Step 3: Bitmap subtitle file**

Use an MKV with PGS only: UI should not advertise fake text subtitles; FFmpeg stderr should not show repeated WebVTT encode failures for PGS.

---

## Self-review

**Spec coverage:** Backend `var_stream_map` + subtitle codec filter + Player track source → Tasks 1–4. Video quality UI unchanged (still two variants in HLS; selector could be extended later).

**Placeholder scan:** No TBD steps; FFmpeg string is illustrative—implementers must derive exact `var_stream_map` from output stream order and verify with a real `ffmpeg` run.

**Type consistency:** Player UI types use `id: string` or stable `index: number` consistently in handlers; avoid mixing backend numeric `HlsTrackInfo.id` with player indices.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-14-hls-multi-track-alignment.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration (`subagent-driven-development`).

2. **Inline Execution** — Run tasks in one session with checkpoints (`executing-plans`).

**Which approach do you want?**
