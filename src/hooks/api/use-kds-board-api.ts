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

export function useKdsBoardQueueQuery(enabled: boolean) {
  return useQuery({
    queryKey: kdsKeys.queue(),
    queryFn: fetchKdsBoardQueue,
    enabled,
    staleTime: POLL_INTERVAL,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  });
}

export function useKdsBoardProcessingQuery(enabled: boolean) {
  return useQuery({
    queryKey: kdsKeys.processing(),
    queryFn: fetchKdsBoardProcessing,
    enabled,
    staleTime: POLL_INTERVAL,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  });
}

export function useKdsBoardReadyQuery(enabled: boolean) {
  return useQuery({
    queryKey: kdsKeys.ready(),
    queryFn: fetchKdsBoardReady,
    enabled,
    staleTime: POLL_INTERVAL,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  });
}

function useInvalidateAllKds() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: kdsKeys.queue() });
    void qc.invalidateQueries({ queryKey: kdsKeys.processing() });
    void qc.invalidateQueries({ queryKey: kdsKeys.ready() });
  };
}

export function useTakeKdsBoardMutation() {
  const invalidate = useInvalidateAllKds();
  return useMutation({
    mutationFn: (id: string) => takeKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}

export function useFinishKdsBoardMutation() {
  const invalidate = useInvalidateAllKds();
  return useMutation({
    mutationFn: (id: string) => finishKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}

export function useDeliverKdsBoardMutation() {
  const invalidate = useInvalidateAllKds();
  return useMutation({
    mutationFn: (id: string) => deliverKdsBoardOrder(id),
    onSuccess: invalidate,
  });
}
