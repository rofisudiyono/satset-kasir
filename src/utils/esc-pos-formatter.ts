/**
 * ESC/POS Receipt Formatter
 * Converts receipt data to ESC/POS commands for thermal printers
 */

export interface ESCPOSReceipt {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  orderNumber: string;
  dateTime: string;
  items: {
    name: string;
    qty: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  payments: {
    method: string;
    label?: string | null;
    amountPaid: number;
    cashReceived?: number;
    change?: number;
  }[];
  totalPaid: number;
  remaining: number;
}

// ESC/POS Control Commands
const ESC = '\x1B';
const GS = '\x1D';
const INIT = ESC + '@'; // Initialize printer
const ALIGN_LEFT = ESC + 'a' + '\x00';
const ALIGN_CENTER = ESC + 'a' + '\x01';
const ALIGN_RIGHT = ESC + 'a' + '\x02';
const BOLD_ON = ESC + 'E' + '\x01';
const BOLD_OFF = ESC + 'E' + '\x00';
const DOUBLE_ON = GS + '!' + '\x11'; // Double height and width
const DOUBLE_OFF = GS + '!' + '\x00'; // Normal size
const CUT_PAPER = GS + 'V' + '\x01'; // Full cut
const LINE_FEED = '\n';

/**
 * Format text line with left and right parts (for receipt items)
 */
function formatLine(left: string, right: string, width: number = 32): string {
  const padding = Math.max(0, width - left.length - right.length);
  return left + ' '.repeat(padding) + right + LINE_FEED;
}

/**
 * Format a separator line
 */
function formatSeparator(width: number = 32): string {
  return '-'.repeat(width) + LINE_FEED;
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

/**
 * Build ESC/POS receipt commands
 */
export function buildESCPOSReceipt(receipt: ESCPOSReceipt): string {
  const width = 32; // Standard 58mm printer width (characters)
  let output = '';

  // Initialize printer
  output += INIT;

  // Store header (centered, bold, double size)
  output += ALIGN_CENTER;
  output += DOUBLE_ON;
  output += BOLD_ON;
  output += receipt.storeName + LINE_FEED;
  output += BOLD_OFF;
  output += DOUBLE_OFF;

  // Store info
  output += receipt.storeAddress + LINE_FEED;
  output += receipt.storePhone + LINE_FEED;

  // Separator
  output += LINE_FEED;
  output += formatSeparator(width);

  // Order info
  output += formatLine('No. Nota', receipt.orderNumber, width);
  output += formatLine('', receipt.dateTime, width);
  output += formatSeparator(width);

  // Items
  for (const item of receipt.items) {
    const itemLine = `${item.name} x${item.qty}`;
    const itemPrice = formatCurrency(item.price);
    output += formatLine(itemLine, itemPrice, width);
  }

  output += formatSeparator(width);

  // Financial summary
  output += formatLine('Subtotal', formatCurrency(receipt.subtotal), width);
  
  if (receipt.discount > 0) {
    output += formatLine('Diskon', `-${formatCurrency(receipt.discount)}`, width);
  }
  
  output += formatLine('PPN 11%', formatCurrency(receipt.tax), width);
  
  // Total (bold)
  output += BOLD_ON;
  output += formatLine('TOTAL', formatCurrency(receipt.grandTotal), width);
  output += BOLD_OFF;

  output += formatSeparator(width);

  // Payment info
  for (const p of receipt.payments) {
    const methodLabel = p.label ? `${p.method} (${p.label})` : p.method;
    output += formatLine(methodLabel, formatCurrency(p.amountPaid), width);
    if (p.cashReceived !== undefined) {
      output += formatLine('  Uang Diterima', formatCurrency(p.cashReceived), width);
    }
    if (p.change !== undefined) {
      output += formatLine('  Kembalian', formatCurrency(p.change), width);
    }
  }
  if (receipt.payments.length > 1) {
    output += formatLine('Total Dibayar', formatCurrency(receipt.totalPaid), width);
  }
  if (receipt.remaining > 0) {
    output += formatLine('Sisa', formatCurrency(receipt.remaining), width);
  }

  // Footer
  output += LINE_FEED;
  output += formatSeparator(width);
  output += ALIGN_CENTER;
  output += 'Terima kasih atas kunjungan Anda' + LINE_FEED;
  output += LINE_FEED + LINE_FEED;

  // Cut paper
  output += CUT_PAPER;

  return output;
}

/**
 * Build a simplified receipt for small orders
 */
export function buildSimpleESCPOSReceipt(
  storeName: string,
  orderNumber: string,
  items: { name: string; qty: number; price: number }[],
  total: number,
  paymentMethod: string,
  amountPaid: number
): string {
  const width = 32;
  let output = '';

  output += INIT;
  output += ALIGN_CENTER;
  output += BOLD_ON;
  output += storeName + LINE_FEED;
  output += BOLD_OFF;
  output += ALIGN_LEFT;
  output += formatSeparator(width);

  for (const item of items) {
    output += formatLine(`${item.name} x${item.qty}`, formatCurrency(item.price), width);
  }

  output += formatSeparator(width);
  output += BOLD_ON;
  output += formatLine('TOTAL', formatCurrency(total), width);
  output += BOLD_OFF;
  output += formatLine('Bayar', formatCurrency(amountPaid), width);
  output += formatLine('Metode', paymentMethod, width);
  output += LINE_FEED + LINE_FEED;
  output += CUT_PAPER;

  return output;
}
