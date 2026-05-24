import { api } from "./client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KdsBoardOrderItem {
  menuId: string;
  name: string;
  qty: number;
  unitPrice: number;
  note?: string;
  modifiers: Array<{ label: string; extraPrice: number }>;
}

export interface KdsBoardQueueRecord {
  id: string;
  branchId: string;
  shiftId: string;
  tableLabel: string | null;
  customerName: string | null;
  items: KdsBoardOrderItem[];
  createdAt: string;
}

export interface KdsBoardProcessingRecord {
  id: string;
  sourceOrderId: string | null;
  branchId: string;
  shiftId: string;
  tableLabel: string | null;
  customerName: string | null;
  items: KdsBoardOrderItem[];
  startedCookingAt: string;
  createdAt: string;
}

export interface KdsBoardReadyRecord {
  id: string;
  orderId: string | null;
  branchId: string;
  shiftId: string;
  tableLabel: string | null;
  customerName: string | null;
  items: KdsBoardOrderItem[];
  canMarkDelivered: boolean;
  readyAt: string;
  createdAt: string;
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

export async function fetchKdsBoardQueue(): Promise<KdsBoardQueueRecord[]> {
  const { data } = await api.get<{ data: KdsBoardQueueRecord[] }>("/kds/queue");
  return data.data ?? [];
}

export async function fetchKdsBoardProcessing(): Promise<KdsBoardProcessingRecord[]> {
  const { data } = await api.get<{ data: KdsBoardProcessingRecord[] }>("/kds/processing");
  return data.data ?? [];
}

export async function fetchKdsBoardReady(): Promise<KdsBoardReadyRecord[]> {
  const { data } = await api.get<{ data: KdsBoardReadyRecord[] }>("/kds/ready");
  return data.data ?? [];
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function takeKdsBoardOrder(id: string): Promise<void> {
  await api.patch(`/kds/queue/${id}/take`);
}

export async function finishKdsBoardOrder(id: string): Promise<void> {
  await api.patch(`/kds/processing/${id}/done`);
}

export async function deliverKdsBoardOrder(id: string): Promise<void> {
  await api.post(`/kds/ready/${id}/deliver`);
}
