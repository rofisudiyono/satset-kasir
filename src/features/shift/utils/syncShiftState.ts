import type { ShiftData } from "@/features/shift/store/shift.store";
import type { KasirShift } from "@/lib/api/types";

import { kasirShiftToShiftData } from "./mapShift";

function isSameShiftData(
  prev: ShiftData | null,
  next: ShiftData | null,
): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;

  return (
    prev.shiftId === next.shiftId &&
    prev.openedAt === next.openedAt &&
    prev.slot === next.slot &&
    prev.openingCash === next.openingCash &&
    prev.startTime === next.startTime &&
    prev.cashierName === next.cashierName &&
    prev.note === next.note
  );
}

export function buildShiftSyncState(shift: KasirShift | null): {
  isShiftStarted: boolean;
  shiftData: ShiftData | null;
} {
  if (!shift) {
    return {
      isShiftStarted: false,
      shiftData: null,
    };
  }

  return {
    isShiftStarted: true,
    shiftData: kasirShiftToShiftData(shift),
  };
}

export function shouldUpdateShiftState(params: {
  currentIsShiftStarted: boolean;
  nextIsShiftStarted: boolean;
  currentShiftData: ShiftData | null;
  nextShiftData: ShiftData | null;
}): boolean {
  const {
    currentIsShiftStarted,
    nextIsShiftStarted,
    currentShiftData,
    nextShiftData,
  } = params;

  return (
    currentIsShiftStarted !== nextIsShiftStarted ||
    !isSameShiftData(currentShiftData, nextShiftData)
  );
}
