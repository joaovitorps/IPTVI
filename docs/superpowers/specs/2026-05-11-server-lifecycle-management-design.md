# Server Lifecycle Management Design

Date: 2026-05-11
Branch: feat/server-lifecycle-management-wt
Status: Approved for implementation

## Context

The project contains a stream proxy process in `src/main/stream-parser.ts` (renamed from `streamParser.ts`) and previously commented server bootstrap logic in `src/main/main.ts`. The Player page currently does not own stream server lifecycle in a robust way.

## Goals

1. Start stream server automatically when Player route mounts.
2. Keep a single shared server process alive while Player is active.
3. Stop stream server on Player unmount and app termination.
4. Add explicit state management and cleanup to prevent zombie processes.
5. Add structured start/stop/error logging.
6. Implement use-case workflow (`start-server`, `stop-server`, `get-server-status`) for testability.

## Backend File Naming Convention

All backend files under `src/main/` and `src/core/` must use lowercase kebab-case names.

- Valid: `do-something.ts`
- Valid: `something.ts`
- Invalid: `doSomething.ts`
- Invalid: `Something.ts`

For this feature, rename `src/main/streamParser.ts` to `src/main/stream-parser.ts` and keep all newly added backend files kebab-case.

## Architecture

1. Add stream server lifecycle manager in main process that owns the child process and finite state transitions.
2. Add core use-cases for start/stop/status workflows.
3. Expose new start/stop/status IPC contracts from main to preload to renderer.
4. Connect Player mount/unmount events to stream server IPC methods.
5. Harden `stream-parser` shutdown logic for `SIGINT`, `SIGTERM`, parent disconnect, and unhandled runtime failures.
