import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

function dispatchKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...opts }));
}

describe('useKeyboardShortcuts', () => {
  it('calls onRunTests on Cmd+Enter', () => {
    const onRunTests = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onRunTests }));

    dispatchKey('Enter', { metaKey: true });

    expect(onRunTests).toHaveBeenCalledTimes(1);
  });

  it('calls onGetHint on Cmd+H', () => {
    const onGetHint = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onGetHint }));

    dispatchKey('h', { metaKey: true });

    expect(onGetHint).toHaveBeenCalledTimes(1);
  });

  it('does not fire handlers for plain keys', () => {
    const onRunTests = vi.fn();
    const onGetHint = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onRunTests, onGetHint }));

    dispatchKey('Enter');
    dispatchKey('h');

    expect(onRunTests).not.toHaveBeenCalled();
    expect(onGetHint).not.toHaveBeenCalled();
  });

  it('removes listener on unmount', () => {
    const onRunTests = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcuts({ onRunTests }));

    unmount();

    dispatchKey('Enter', { metaKey: true });

    expect(onRunTests).not.toHaveBeenCalled();
  });

  it('uses updated handler after rerender', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(({ onRunTests }) => useKeyboardShortcuts({ onRunTests }), {
      initialProps: { onRunTests: first },
    });

    rerender({ onRunTests: second });

    dispatchKey('Enter', { metaKey: true });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleCoach on Cmd+Shift+S', () => {
    const onToggleCoach = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onToggleCoach }));

    dispatchKey('s', { metaKey: true, shiftKey: true });

    expect(onToggleCoach).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleCoach on Ctrl+Shift+S', () => {
    const onToggleCoach = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onToggleCoach }));

    dispatchKey('s', { ctrlKey: true, shiftKey: true });

    expect(onToggleCoach).toHaveBeenCalledTimes(1);
  });

  it('does not call onToggleCoach for S without modifiers', () => {
    const onToggleCoach = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onToggleCoach }));

    dispatchKey('s');
    dispatchKey('S');
    dispatchKey('s', { shiftKey: true });

    expect(onToggleCoach).not.toHaveBeenCalled();
  });
});
