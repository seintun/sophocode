## Summary

This PR hardens the SophoCode mobile and desktop experience, focusing on reliability, performance, and UI stability. It resolves critical flickering bugs, improves Pyodide execution, achieves a 100% clean lint state, and fixes layout/scrolling issues across all viewports.

## Problem Statement

1.  **UI Jitter**: BottomSheets were resetting entrance animations on every re-render (e.g., during AI streaming), causing a "flashing" effect.
2.  **Execution Fragility**: Pyodide worker relied on brittle regex to find the entry point, leading to failures with helper functions or comments.
3.  **Lint Debt**: Multiple non-null assertions and `any` types were triggering CI warnings.
4.  **Layout/Scrolling Issues**: Nested scroll containers and missing height definitions were causing scrolling to freeze or break sticky headers.
5.  **Monaco Crash**: A missing theme base property caused an "Illegal theme base!" error.

## Scope

- Hardened Pyodide worker with explicit `functionName` passing and JSON serialization.
- Modularized BottomSheet logic into a reusable `useBottomSheetDrag` hook.
- Implemented an "Entrance Guard" in BottomSheets to prevent animation resets.
- Achieved a 100% clean lint state by replacing `!` assertions and `any` types with safe alternatives.
- Fixed layout height issues in `SessionLayout` and `BottomSheet` to restore scrolling.
- Optimized AI health checks to use a lightweight GET endpoint.

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
