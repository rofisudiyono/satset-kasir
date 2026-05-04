import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as authApi from "@/lib/api/auth.api";
import * as kasirApi from "@/lib/api/kasir.api";
import { getApiErrorMessage } from "@/lib/api/client";
import type {
  CloseShiftBody,
  CollectPaymentBody,
  OpenShiftBody,
  QueueOrderBody,
  PaymentEntry,
} from "@/lib/api/kasir.api";
import type { CheckoutOrderBody, GetOrderHistoryParams } from "@/lib/api/types";

import { kasirKeys } from "./query-keys";

export { getApiErrorMessage };

const orderHistoryPrefix = [...kasirKeys.all, "orders", "history"] as const;
const orderDetailPrefix = [...kasirKeys.all, "orders", "detail"] as const;

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

export function useDeliverOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => kasirApi.deliverPaidOrder(orderId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.readyOrders() });
      void qc.invalidateQueries({ queryKey: orderHistoryPrefix });
      void qc.invalidateQueries({ queryKey: orderDetailPrefix });
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

export function useTenantInfoQuery(enabled: boolean) {
  return useQuery({
    queryKey: kasirKeys.tenantInfo(),
    queryFn: kasirApi.getTenantInfo,
    enabled,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

export function useOrderHistoryQuery(enabled: boolean, params?: GetOrderHistoryParams) {
  return useQuery({
    queryKey: kasirKeys.orderHistory(params),
    queryFn: () => kasirApi.getOrderHistory(params),
    enabled,
    staleTime: 30_000,
    refetchInterval: enabled ? 60_000 : false,
  });
}

export function useOrderDetailQuery(enabled: boolean, orderId?: string | null) {
  return useQuery({
    queryKey: kasirKeys.orderDetail(orderId ?? undefined),
    queryFn: () => kasirApi.getOrderDetail(orderId!),
    enabled: enabled && !!orderId,
    staleTime: 30_000,
  });
}

export function useCheckoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckoutOrderBody) => kasirApi.checkoutOrder(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderHistoryPrefix });
      void qc.invalidateQueries({ queryKey: orderDetailPrefix });
      void qc.invalidateQueries({ queryKey: [...kasirKeys.all, "orders", "unpaid"] });
      void qc.invalidateQueries({ queryKey: kasirKeys.activeShift() });
    },
  });
}

export function useCancelPaidOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      kasirApi.requestCancelPaidOrder(orderId, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderHistoryPrefix });
      void qc.invalidateQueries({ queryKey: orderDetailPrefix });
      void qc.invalidateQueries({ queryKey: kasirKeys.activeShift() });
    },
  });
}

export function useRefundPaidOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      kasirApi.requestRefundPaidOrder(orderId, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderHistoryPrefix });
      void qc.invalidateQueries({ queryKey: orderDetailPrefix });
      void qc.invalidateQueries({ queryKey: kasirKeys.activeShift() });
    },
  });
}

export function usePendingWebOrdersQuery(enabled: boolean) {
  return useQuery({
    queryKey: kasirKeys.pendingWebOrders(),
    queryFn: kasirApi.getPendingWebOrders,
    enabled,
    staleTime: 15_000,
    refetchInterval: enabled ? 20_000 : false,
  });
}

export function useConfirmPendingWebOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      pendingId,
      payments,
    }: {
      pendingId: string;
      payments: PaymentEntry[];
    }) => kasirApi.confirmPendingWebOrder(pendingId, payments),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.pendingWebOrders() });
      void qc.invalidateQueries({ queryKey: orderHistoryPrefix });
      void qc.invalidateQueries({ queryKey: orderDetailPrefix });
    },
  });
}

export function useCancelPendingWebOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pendingId: string) => kasirApi.cancelPendingWebOrder(pendingId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kasirKeys.pendingWebOrders() });
    },
  });
}

// ─── Promos ───────────────────────────────────────────────────────────────────

export function useActivePromosQuery(enabled: boolean) {
  return useQuery({
    queryKey: kasirKeys.promos(),
    queryFn: kasirApi.getActivePromos,
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useValidatePromoMutation() {
  return useMutation({
    mutationFn: (payload: { code: string; subtotal: number; menuIds?: string[] }) =>
      kasirApi.validatePromoCode(payload),
  });
}

// ─── Tax Settings ─────────────────────────────────────────────────────────────

export function useTaxSettingsQuery(enabled: boolean) {
  return useQuery({
    queryKey: kasirKeys.taxSettings(),
    queryFn: kasirApi.getTaxSettings,
    enabled,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}

// ─── Post-Pay ─────────────────────────────────────────────────────────────────

export function useUnpaidOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: [...kasirKeys.all, "orders", "unpaid"],
    queryFn: kasirApi.getUnpaidOrders,
    enabled,
    refetchInterval: enabled ? 15_000 : false,
  });
}

export function useCollectPaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: string; body: CollectPaymentBody }) =>
      kasirApi.collectPayment(orderId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...kasirKeys.all, "orders", "unpaid"] });
    },
  });
}
