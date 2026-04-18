import { storeInfo } from "@/features/payment/api/receipt.data";
import type { KasirOrderDetail, KasirOrderPayment } from "@/lib/api/types";
import type { ESCPOSReceipt } from "@/utils/esc-pos-formatter";
import { formatPrice } from "@/utils";

export type PrintableReceiptItem = {
  name: string;
  qty: number;
  price: number;
};

export type PrintableReceiptOrder = {
  orderNumber: string;
  dateTime: string;
  items: PrintableReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  amountPaid: number;
  totalPaid: number;
  remaining: number;
  cashReceived?: number;
  change?: number;
};

function formatReceiptDate(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function getKasirPaymentMethodLabel(method: string) {
  switch (method) {
    case "CASH":
      return "Tunai";
    case "QRIS":
      return "QRIS";
    case "TRANSFER":
      return "Transfer";
    case "DEBIT":
      return "Kartu Debit";
    case "CREDIT":
      return "Kartu Kredit";
    case "EWALLET":
      return "E-Wallet";
    case "VA":
      return "Virtual Account";
    default:
      return method;
  }
}

function getReceiptItemsFromOrder(order: KasirOrderDetail): PrintableReceiptItem[] {
  return order.items.map((item) => {
    const modifierSuffix = item.modifiers?.length
      ? ` (${item.modifiers.map((modifier) => modifier.labelSnapshot).join(", ")})`
      : item.variantNameSnapshot
        ? ` (${item.variantNameSnapshot})`
        : "";

    return {
      name: `${item.nameSnapshot}${modifierSuffix}`,
      qty: item.qty,
      price: item.unitPriceSnapshot * item.qty,
    };
  });
}

function getPrimaryPayment(payments: KasirOrderPayment[]) {
  return payments[0];
}

export function buildPrintableReceiptOrderFromKasirOrder(
  order: KasirOrderDetail,
): PrintableReceiptOrder {
  const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const primaryPayment = getPrimaryPayment(order.payments);
  const amountPaid = primaryPayment?.amountPaid ?? totalPaid;
  const amountReceived = primaryPayment?.amountReceived ?? amountPaid;

  return {
    orderNumber: order.id,
    dateTime: formatReceiptDate(order.paidAt ?? order.createdAt),
    items: getReceiptItemsFromOrder(order),
    subtotal: order.subtotal,
    discount: order.discountAmount,
    tax: order.taxAmount,
    grandTotal: order.grandTotal,
    paymentMethod: primaryPayment
      ? getKasirPaymentMethodLabel(primaryPayment.method)
      : "Pembayaran",
    amountPaid,
    totalPaid,
    remaining: Math.max(0, order.grandTotal - totalPaid),
    cashReceived: primaryPayment?.method === "CASH" ? amountReceived : undefined,
    change:
      primaryPayment?.method === "CASH"
        ? Math.max(0, amountReceived - amountPaid)
        : undefined,
  };
}

export function buildReceiptHtml(receipt: PrintableReceiptOrder, printerWidthPx = 384) {
  const itemsHtml = receipt.items
    .map(
      (item) =>
        `<tr><td>${item.name} x${item.qty}</td><td style="text-align:right">${formatPrice(item.price)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body { font-family: monospace; width: ${printerWidthPx}px; padding: 8px; font-size: 20px; color: #000; background: #fff; }
      h2 { text-align: center; margin: 4px 0; font-size: 24px; }
      p { text-align: center; margin: 2px 0; font-size: 18px; }
      hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 3px 0; vertical-align: top; font-size: 20px; }
      .total td { font-weight: bold; font-size: 22px; }
    </style>
  </head>
  <body>
    <h2>${storeInfo.name}</h2>
    <p>${storeInfo.address}</p>
    <p>${storeInfo.phone}</p>
    <hr/>
    <p>No. Order: ${receipt.orderNumber.slice(0, 16)}</p>
    <p>${receipt.dateTime} WIB</p>
    <hr/>
    <table>${itemsHtml}</table>
    <hr/>
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">${formatPrice(receipt.subtotal)}</td></tr>
      ${receipt.discount > 0 ? `<tr><td>Diskon</td><td style="text-align:right">-${formatPrice(receipt.discount)}</td></tr>` : ""}
      <tr><td>Pajak</td><td style="text-align:right">${formatPrice(receipt.tax)}</td></tr>
      <tr class="total"><td>TOTAL</td><td style="text-align:right">${formatPrice(receipt.grandTotal)}</td></tr>
      <tr><td>Metode</td><td style="text-align:right">${receipt.paymentMethod}</td></tr>
      <tr><td>Total Dibayar</td><td style="text-align:right">${formatPrice(receipt.totalPaid)}</td></tr>
      ${receipt.remaining > 0 ? `<tr><td>Sisa</td><td style="text-align:right">${formatPrice(receipt.remaining)}</td></tr>` : ""}
      ${receipt.cashReceived !== undefined ? `<tr><td>Uang Diterima</td><td style="text-align:right">${formatPrice(receipt.cashReceived)}</td></tr>` : ""}
      ${receipt.change !== undefined ? `<tr><td>Kembalian</td><td style="text-align:right">${formatPrice(receipt.change)}</td></tr>` : ""}
    </table>
    <hr/>
    <p style="margin-top:8px">Terima kasih!</p>
  </body>
</html>`;
}

export function buildEscPosReceiptData(
  receipt: PrintableReceiptOrder,
): ESCPOSReceipt {
  return {
    storeName: storeInfo.name,
    storeAddress: storeInfo.address,
    storePhone: storeInfo.phone,
    orderNumber: receipt.orderNumber,
    dateTime: `${receipt.dateTime} WIB`,
    items: receipt.items,
    subtotal: receipt.subtotal,
    discount: receipt.discount,
    tax: receipt.tax,
    grandTotal: receipt.grandTotal,
    paymentMethod: receipt.paymentMethod,
    amountPaid: receipt.amountPaid,
    totalPaid: receipt.totalPaid,
    remaining: receipt.remaining,
    cashReceived: receipt.cashReceived,
    change: receipt.change,
  };
}
