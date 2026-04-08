import type { PosOrder } from "../pos.types";

const now = Date.now();

export const posSeedOrders: PosOrder[] = [
  // ── ACTIVE WEB ORDERS (PENDING, <30 menit) ────────────────────────────────

  {
    id: "#ORD-WEB-3001",
    createdAt: now - 5 * 60 * 1000, // 5 menit lalu
    source: "WEB",
    status: "PENDING",
    fulfillment: "QUEUED",
    customerName: "Raka",
    tableLabel: "Meja 05",
    serviceMode: "DINE_IN",
    items: [
      {
        id: "w3001-1",
        productId: "espresso",
        name: "Espresso",
        qty: 1,
        unitPrice: 25000,
      },
      {
        id: "w3001-2",
        productId: "avocado-toast",
        name: "Avocado Toast",
        qty: 1,
        unitPrice: 30000,
      },
    ],
    payments: [],
    subtotal: 55000,
    discountAmount: 0,
    taxAmount: 5500,
    grandTotal: 60500,
  },

  {
    id: "#ORD-WEB-3002",
    createdAt: now - 12 * 60 * 1000, // 12 menit lalu
    source: "WEB",
    status: "PENDING",
    fulfillment: "QUEUED",
    customerName: "Sinta",
    tableLabel: "Meja 02",
    serviceMode: "DINE_IN",
    items: [
      {
        id: "w3002-1",
        productId: "kopi-susu",
        name: "Kopi Susu Gula Aren",
        qty: 2,
        unitPrice: 22000,
      },
      {
        id: "w3002-2",
        productId: "croissant",
        name: "Croissant",
        qty: 1,
        unitPrice: 28000,
      },
    ],
    payments: [],
    subtotal: 72000,
    discountAmount: 0,
    taxAmount: 7200,
    grandTotal: 79200,
  },

  {
    id: "#ORD-WEB-3003",
    createdAt: now - 8 * 60 * 1000, // 8 menit lalu
    source: "WEB",
    status: "PENDING",
    fulfillment: "QUEUED",
    customerName: "Budi",
    tableLabel: "Takeaway",
    serviceMode: "TAKEAWAY",
    items: [
      {
        id: "w3003-1",
        productId: "nasi-goreng-spesial",
        name: "Nasi Goreng Spesial",
        qty: 1,
        unitPrice: 35000,
      },
      {
        id: "w3003-2",
        productId: "es-teh",
        name: "Es Teh Manis",
        qty: 2,
        unitPrice: 8000,
      },
    ],
    payments: [],
    subtotal: 51000,
    discountAmount: 0,
    taxAmount: 5100,
    grandTotal: 56100,
  },

  // ── EXPIRED WEB ORDERS (>30 menit) ────────────────────────────────────────

  {
    id: "#ORD-WEB-1001",
    createdAt: now - 45 * 60 * 1000, // 45 menit lalu → expired
    source: "WEB",
    status: "PENDING",
    fulfillment: "QUEUED",
    customerName: "Nadia Putri",
    tableLabel: "Takeaway",
    serviceMode: "TAKEAWAY",
    items: [
      {
        id: "web-item-1",
        productId: "kopi-susu",
        name: "Kopi Susu",
        qty: 2,
        unitPrice: 22000,
      },
    ],
    payments: [],
    subtotal: 44000,
    discountAmount: 0,
    taxAmount: 4840,
    grandTotal: 48840,
  },

  {
    id: "#ORD-WEB-1002",
    createdAt: now - 55 * 60 * 1000, // 55 menit lalu → expired
    source: "WEB",
    status: "PENDING",
    fulfillment: "QUEUED",
    customerName: "Arif",
    tableLabel: "Takeaway",
    serviceMode: "TAKEAWAY",
    items: [
      {
        id: "web-item-2",
        productId: "nasi-goreng",
        name: "Nasi Goreng",
        qty: 1,
        unitPrice: 32000,
      },
    ],
    payments: [],
    subtotal: 32000,
    discountAmount: 0,
    taxAmount: 3520,
    grandTotal: 35520,
  },

  // ── WALK-IN ORDERS (untuk KDS / Siap Antar) ───────────────────────────────

  {
    id: "#ORD-READY-2001",
    createdAt: now - 18 * 60 * 1000,
    source: "WALK_IN",
    status: "PAID",
    fulfillment: "READY",
    customerName: "Meja 7",
    tableLabel: "Meja 7",
    serviceMode: "DINE_IN",
    items: [
      {
        id: "ready-item-1",
        productId: "mie-ayam",
        name: "Mie Ayam",
        qty: 2,
        unitPrice: 18000,
      },
    ],
    payments: [
      {
        id: "ready-payment-1",
        method: "qris",
        amountPaid: 39960,
        paidAt: now - 16 * 60 * 1000,
      },
    ],
    subtotal: 36000,
    discountAmount: 0,
    taxAmount: 3960,
    grandTotal: 39960,
  },

  {
    id: "#ORD-KDS-2002",
    createdAt: now - 8 * 60 * 1000,
    source: "WALK_IN",
    status: "PAID",
    fulfillment: "PREPARING",
    customerName: "Takeaway - Arif",
    tableLabel: "Takeaway",
    serviceMode: "TAKEAWAY",
    items: [
      {
        id: "ready-item-2",
        productId: "ayam-geprek",
        name: "Ayam Geprek",
        qty: 1,
        unitPrice: 28000,
      },
    ],
    payments: [
      {
        id: "ready-payment-2",
        method: "tunai",
        amountPaid: 31080,
        amountReceived: 50000,
        paidAt: now - 7 * 60 * 1000,
      },
    ],
    subtotal: 28000,
    discountAmount: 0,
    taxAmount: 3080,
    grandTotal: 31080,
  },
];
