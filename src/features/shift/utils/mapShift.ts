import type { ShiftData } from "@/features/shift/store/shift.store";
import type { KasirShift } from "@/lib/api/types";
import type { ShiftSlot } from "@/types";

function slotFromApi(slot: KasirShift["shiftSlot"]): ShiftSlot {
  return slot as ShiftSlot;
}

export function kasirShiftToShiftData(shift: KasirShift): ShiftData {
  const openedAt = new Date(shift.openedAt).getTime();
  const startTime =
    new Date(shift.openedAt).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";

  return {
    shiftId: shift.id,
    openedAt,
    slot: slotFromApi(shift.shiftSlot),
    openingCash: shift.openingCash,
    startTime,
    cashierName: shift.cashierName,
    note: undefined,
  };
}
