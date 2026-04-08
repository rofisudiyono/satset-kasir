import { atomWithMMKV } from "@/store/storage";
import type { ShiftSlot } from "@/types";

export interface ShiftData {
  /**
   * Unique identifier for the current shift.
   * Used to scope transactions to a specific shift.
   */
  shiftId: string;
  openedAt: number; // epoch ms
  slot: ShiftSlot;
  openingCash: number;
  startTime: string;
  cashierName: string;
  note?: string;
}

export const isShiftStartedAtom = atomWithMMKV("isShiftStarted", false);

export const shiftDataAtom = atomWithMMKV<ShiftData | null>("shiftData", null);
