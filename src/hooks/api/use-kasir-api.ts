import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as authApi from "@/lib/api/auth.api";
import * as kasirApi from "@/lib/api/kasir.api";
import { getApiErrorMessage } from "@/lib/api/client";
import type {
  CloseShiftBody,
  OpenShiftBody,
  QueueOrderBody,
  PaymentEntry,
} from "@/lib/api/kasir.api";
import type { CheckoutOrderBody } from "@/lib/api/types";

import { kasirKeys } from "./query-keys";

export function useActiveShiftQuery(enabled: boolean) {
  return useQuery({
    queryKey: kasirKeys.activeShift(),
    queryFn: kasirApi.getActiveShift,
    enabled,
    staleTime: 30_000,
  });
}

export function useReadyOrdersQuery(enabled: boolean) {
  return useQuery({
    queryKey: kasirKeys.readyOrders(),
    queryFn: kasirApi.getReadyOrders,
    enabled,
    staleTime: 15_000,
    refetchInterval: enabled ? 30_000 : false,
  });
}

export function useOpenShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OpenShiftBody) => kasirApi.openShift(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.activeShift() });
    },
  });
}

export function useCloseShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CloseShiftBody) => kasirApi.closeShift(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.activeShift() });
      void qc.invalidateQueries({ queryKey: kasirKeys.readyOrders() });
    },
  });
}

export function useQueueOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QueueOrderBody) => kasirApi.queueOrder(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.readyOrders() });
    },
  });
}

export function usePayReadyOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      readyOrderId,
      payments,
    }: {
      readyOrderId: string;
      payments: PaymentEntry[];
    }) => kasirApi.payReadyOrder(readyOrderId, payments),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.readyOrders() });
    },
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.loginRequest(email, password),
  });
}

export function useMenusQuery(enabled: boolean) {
  return useQuery({
    queryKey: kasirKeys.menus(),
    queryFn: kasirApi.getMenus,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useTablesQuery(enabled: boolean, branchId?: string) {
  return useQuery({
    queryKey: kasirKeys.tables(branchId),
    queryFn: () => kasirApi.getTables(branchId),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useOrderHistoryQuery(enabled: boolean) {
  return useQuery({
    queryKey: kasirKeys.orderHistory(),
    queryFn: kasirApi.getOrderHistory,
    enabled,
    staleTime: 30_000,
    refetchInterval: enabled ? 60_000 : false,
  });
}

export function useCheckoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckoutOrderBody) => kasirApi.checkoutOrder(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.orderHistory() });
      void qc.invalidateQueries({ queryKey: kasirKeys.activeShift() });
    },
  });
}

export function useCancelPaidOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      kasirApi.cancelPaidOrder(orderId, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.orderHistory() });
      void qc.invalidateQueries({ queryKey: kasirKeys.activeShift() });
    },
  });
}

export function useRefundPaidOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      kasirApi.refundPaidOrder(orderId, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.orderHistory() });
      void qc.invalidateQueries({ queryKey: kasirKeys.activeShift() });
    },
  });
}

export { getApiErrorMessage };
