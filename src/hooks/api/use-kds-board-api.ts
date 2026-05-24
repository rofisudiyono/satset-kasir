import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchKdsBoardQueue,
  fetchKdsBoardProcessing,
  fetchKdsBoardReady,
  takeKdsBoardOrder,
  finishKdsBoardOrder,
  deliverKdsBoardOrder,
} from "@/lib/api/kds.api";
import { getApiErrorMessage } from "@/lib/api/client";
import { kdsKeys } from "./query-keys";

export { getApiErrorMessage };

const POLL_INTERVAL = 15_000;

export type KdsBoardData = {
  queue: Awaited<ReturnType<typeof fetchKdsBoardQueue>>;
  processing: Awaited<ReturnType<typeof fetchKdsBoardProcessing>>;
  ready: Awaited<ReturnType<typeof fetchKdsBoardReady>>;
};

async function fetchKdsBoard(): Promise<KdsBoardData> {
  const [queue, processing, ready] = await Promise.all([
    fetchKdsBoardQueue(),
    fetchKdsBoardProcessing(),
    fetchKdsBoardReady(),
  ]);
  return { queue, processing, ready };
}

export function useKdsBoardQuery(enabled: boolean) {
  return useQuery({
    queryKey: kdsKeys.board(),
    queryFn: fetchKdsBoard,
    enabled,
    staleTime: POLL_INTERVAL,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  });
}

function useInvalidateKdsBoard() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: kdsKeys.board() });
  };
}

export function useTakeKdsBoardMutation() {
  const invalidate = useInvalidateKdsBoard();
  return useMutation({
    mutationFn: (id: string) => takeKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}

export function useFinishKdsBoardMutation() {
  const invalidate = useInvalidateKdsBoard();
  return useMutation({
    mutationFn: (id: string) => finishKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}

export function useDeliverKdsBoardMutation() {
  const invalidate = useInvalidateKdsBoard();
  return useMutation({
    mutationFn: (id: string) => deliverKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}
