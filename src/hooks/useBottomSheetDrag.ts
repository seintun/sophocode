'use client';

import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type SheetHeight = 'peek' | 'half' | 'large' | 'full';

interface UseBottomSheetDragOptions {
  currentHeight: SheetHeight;
  setCurrentHeight: (height: SheetHeight) => void;
  height: SheetHeight; // the base height
  onClose: () => void;
  snapHeights: Record<SheetHeight, string>;
  animDuration: number;
  transitionStyle: string;
  reducedMotion: boolean;
  sheetRef: React.RefObject<HTMLDivElement | null>;
  backdropRef: React.RefObject<HTMLDivElement | null>;
  closeThresholdFraction: number;
  vhToPx: (vh: string) => number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBottomSheetDrag({
  currentHeight,
  setCurrentHeight,
  height,
  onClose,
  snapHeights,
  animDuration,
  transitionStyle,
  reducedMotion,
  sheetRef,
  backdropRef,
  closeThresholdFraction,
  vhToPx,
}: UseBottomSheetDragOptions) {
  const pointerStartY = useRef(0);
  const isDragging = useRef(false);
  const animatingRef = useRef(false);

  const dragStartHeightPx = useRef(0);
  const dragMaxHeightPx = useRef(0);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest('[data-bottomsheet-drag="true"]')) {
        return;
      }

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (animatingRef.current) return;
      const sheet = sheetRef.current;
      if (!sheet) return;

      isDragging.current = true;
      pointerStartY.current = e.clientY;

      const currentH = vhToPx(snapHeights[currentHeight]);
      const maxH = vhToPx(snapHeights.full);
      dragStartHeightPx.current = currentH;
      dragMaxHeightPx.current = maxH;

      // Prepare for transform-only drag:
      sheet.style.transition = 'none';
      sheet.style.height = `${maxH}px`;
      sheet.style.transform = `translateY(${maxH - currentH}px)`;

      if (backdropRef.current) {
        backdropRef.current.style.transition = 'none';
      }

      const dragTarget = e.currentTarget as HTMLDivElement;
      dragTarget.setPointerCapture(e.pointerId);
    },
    [currentHeight, snapHeights, sheetRef, backdropRef, vhToPx],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      const sheet = sheetRef.current;
      if (!sheet) return;

      const deltaY = pointerStartY.current - e.clientY; // positive = dragging up
      const targetHeight = dragStartHeightPx.current + deltaY;

      // Clamp
      const clampedHeight = Math.max(0, Math.min(targetHeight, dragMaxHeightPx.current));
      const translatePx = dragMaxHeightPx.current - clampedHeight;

      sheet.style.transform = `translateY(${translatePx}px)`;

      if (backdropRef.current) {
        const baseH = vhToPx(snapHeights[height]);
        const progress = Math.min(Math.max(clampedHeight / baseH, 0), 1);
        backdropRef.current.style.opacity = String(progress);
      }
    },
    [height, snapHeights, sheetRef, backdropRef, vhToPx],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      const sheet = sheetRef.current;
      if (!sheet) return;

      const dragTarget = e.currentTarget as HTMLDivElement;
      dragTarget.releasePointerCapture(e.pointerId);

      const deltaY = pointerStartY.current - e.clientY;
      const endHeight = dragStartHeightPx.current + deltaY;

      const baseH = vhToPx(snapHeights[height]);
      const fullH = vhToPx(snapHeights.full);

      sheet.style.transition = transitionStyle;
      if (backdropRef.current) {
        backdropRef.current.style.transition = reducedMotion ? 'none' : 'opacity 0.3s ease';
      }

      // Snap logic
      if (endHeight < baseH - baseH * closeThresholdFraction) {
        // Close
        sheet.style.transform = `translateY(${dragMaxHeightPx.current}px)`;
        if (backdropRef.current) backdropRef.current.style.opacity = '0';
        animatingRef.current = true;
        setTimeout(() => {
          animatingRef.current = false;
          onClose();
        }, animDuration);
      } else if (endHeight > baseH + (fullH - baseH) * 0.25) {
        // Expand to full
        setCurrentHeight('full');
        sheet.style.transform = `translateY(0px)`;
        if (backdropRef.current) backdropRef.current.style.opacity = '1';
        animatingRef.current = true;
        setTimeout(() => {
          animatingRef.current = false;
          sheet.style.height = snapHeights.full;
        }, animDuration);
      } else {
        // Snap back to base
        setCurrentHeight(height);
        const targetTranslate = dragMaxHeightPx.current - baseH;
        sheet.style.transform = `translateY(${targetTranslate}px)`;
        if (backdropRef.current) backdropRef.current.style.opacity = '1';
        animatingRef.current = true;
        setTimeout(() => {
          animatingRef.current = false;
          sheet.style.height = snapHeights[height];
          sheet.style.transform = 'translateY(0px)';
        }, animDuration);
      }
    },
    [
      height,
      snapHeights,
      onClose,
      reducedMotion,
      transitionStyle,
      animDuration,
      closeThresholdFraction,
      setCurrentHeight,
      sheetRef,
      backdropRef,
      vhToPx,
    ],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    animatingRef,
  };
}
