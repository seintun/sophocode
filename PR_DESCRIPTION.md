## Summary

This PR significantly hardens the SophoCode mobile and desktop experience. Key improvements include a new mobile-first workspace architecture (bottom sheets + immersive mode), a more robust Pyodide execution pipeline with explicit function targeting, enhanced AI health monitoring, and a 100% clean lint state.

## Problem Statement

1.  **Mobile Usability**: The previous tab-based UI was rigid. Bottom bars were often clipped on browsers like Samsung Internet.
2.  **UI Jitter**: BottomSheets reset entrance animations on every re-render (e.g., during AI streaming), causing a "flashing" effect.
3.  **Execution Fragility**: Pyodide worker relied on brittle regex to find the entry point, leading to failures with helper functions or comments.
4.  **Layout/Scrolling Issues**: Nested scroll containers and missing height definitions (vh vs dvh) were causing scrolling to freeze or break sticky headers.
5.  **Monaco Crash**: A missing theme base property caused an "Illegal theme base!" error.

## Scope

- **Architecture**: Introduced `MobileWorkspace` with a bottom-sheet based layout and an "Immersive Mode" for distraction-free coding.
- **Reliability**: Hardened Pyodide worker with explicit `functionName` passing and JSON serialization.
- **Stability**: Implemented an "Entrance Guard" in BottomSheets to prevent animation resets.
- **Viewport**: Switched to `dvh` units across all critical mobile layouts to prevent UI clipping.
- **Quality**: Achieved a 100% clean lint state by replacing `!` assertions and `any` types with safe alternatives.
- **Performance**: Optimized AI health checks to use a lightweight GET endpoint.

## User Stories

- As a mobile user, I want to see Sophia's hints stream smoothly without the panel jumping or flashing.
- As a student, I want to use helper functions in my Python code without the test runner failing to find my main function.
- As a developer, I want a clean lint state and robust error logging to speed up debugging.

## Implementation Notes

- **Refactor**: Extracted pointer-event math to `useBottomSheetDrag.ts`.
- **Logic**: Added `prevOpenRef` to `BottomSheet.tsx` to guard entrance transitions.
- **Styling**: Ensured `flex flex-col h-full` consistency across layout wrappers to support internal panel scrolling and sticky headers.
- **Reliability**: Standardized worker results via `json.dumps()` in the Python sandbox.

## Edge Cases and Failure Modes

- **Worker Initialization**: Added detailed error messages if Pyodide fails to load (e.g., network issues).
- **Immersive Mode**: Disabled swipe gestures when the editor is focused to prevent accidental tab switches.
- **AI Outages**: Added console warnings and user-friendly fallback messages for AI health check failures.

## Test Plan

### Automated Tests

- [x] Unit (185/185 tests passing)
- [x] Lint (100% clean, 0 errors, 0 warnings)

Commands run:

```bash
npm run lint
vitest run
```

### Manual Verification

- [x] **Scrolling**: Verified that Problem, Results, and Coaching panels scroll correctly on both Mobile (iOS/Android) and Desktop (Chrome/Safari).
- [x] **Flicker**: Confirmed that Sophia's hint streaming no longer causes BottomSheet animation resets.
- [x] **Monaco**: Verified that the editor loads without "Illegal theme base" errors.
- [x] **Swipe**: Confirmed that swipe-to-tab works on mobile but is disabled when the keyboard is open (Immersive Mode).
