import { storage } from "@/store/storage";

const QUEUE_COUNT_KEY = "offlineSync.queueCount";
const LAST_ERROR_KEY = "offlineSync.lastError";
const RETRY_COUNT_KEY = "offlineSync.retryCount";
const THRESHOLD = 3;

export type OfflineSyncSnapshot = {
  queueCount: number;
  lastError: string | null;
};

export function recordOfflineSyncRetry(error: unknown, queueCount: number): void {
  const retryCount = (storage.getNumber(RETRY_COUNT_KEY) ?? 0) + 1;
  storage.set(RETRY_COUNT_KEY, retryCount);

  if (retryCount < THRESHOLD) return;

  storage.set(QUEUE_COUNT_KEY, Math.max(1, queueCount));
  storage.set(
    LAST_ERROR_KEY,
    error instanceof Error ? error.message : String(error),
  );
}

export function clearOfflineSyncFailure(): void {
  storage.remove(QUEUE_COUNT_KEY);
  storage.remove(LAST_ERROR_KEY);
  storage.remove(RETRY_COUNT_KEY);
}

export function getOfflineSyncSnapshot(): OfflineSyncSnapshot {
  return {
    queueCount: storage.getNumber(QUEUE_COUNT_KEY) ?? 0,
    lastError: storage.getString(LAST_ERROR_KEY) ?? null,
  };
}
