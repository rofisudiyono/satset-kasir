/**
 * Bluetooth printer: transport via react-native-bluetooth-classic (SPP),
 * ESC/POS payload via expo-escpos (HTML → raster ESC/POS).
 */

import type { PrinterModel } from "expo-escpos";
import { renderHtmlToImages } from "expo-escpos";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import type { BluetoothDevice } from "react-native-bluetooth-classic";
import RNBluetoothClassic from "react-native-bluetooth-classic";

import { appStorage } from "@/store/storage";

export interface BluetoothPrinter {
  id: string;
  name: string;
  address: string;
  type: "thermal_58mm" | "thermal_80mm" | "other";
  connected?: boolean;
}

export interface PrinterState {
  connected: boolean;
  printer: BluetoothPrinter | null;
  printing: boolean;
  reconnecting: boolean;
}

type ConnectionStateChangeCallback = (state: PrinterState) => void;
type ConnectOptions = {
  persist?: boolean;
  silent?: boolean;
};

const LAST_PRINTER_STORAGE_KEY = "bluetooth:lastPrinter";

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function looksLikePrinter(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes("printer") ||
    n.includes("print") ||
    n.includes("xprinter") ||
    n.includes("gainscha") ||
    n.includes("iware") ||
    n.includes("epson") ||
    n.includes("rpp") ||
    n.includes("pos") ||
    n.includes("thermal") ||
    n.includes("esc")
  );
}

function printerModelFromType(type: BluetoothPrinter["type"]): PrinterModel {
  return type === "thermal_80mm" ? "80" : "58";
}

class BluetoothPrinterManager {
  private static instance: BluetoothPrinterManager;
  private state: PrinterState = {
    connected: false,
    printer: null,
    printing: false,
    reconnecting: false,
  };
  private listeners: ConnectionStateChangeCallback[] = [];
  private connectedDevice: BluetoothDevice | null = null;
  private reconnectPromise: Promise<boolean> | null = null;

  private constructor() {
    const lastPrinter = this.getStoredPrinter();
    if (lastPrinter) {
      this.state = { ...this.state, printer: lastPrinter };
    }
  }

  static getInstance(): BluetoothPrinterManager {
    if (!BluetoothPrinterManager.instance) {
      BluetoothPrinterManager.instance = new BluetoothPrinterManager();
    }
    return BluetoothPrinterManager.instance;
  }

  subscribe(callback: ConnectionStateChangeCallback): () => void {
    this.listeners.push(callback);
    callback(this.state);
    void this.autoReconnectLastPrinter();

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  getState(): PrinterState {
    return { ...this.state };
  }

  private getStoredPrinter(): BluetoothPrinter | null {
    const raw = appStorage.getItem(LAST_PRINTER_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<BluetoothPrinter>;
      if (!parsed.id || !parsed.address || !parsed.name) return null;

      return {
        id: parsed.id,
        name: parsed.name,
        address: parsed.address,
        type: parsed.type ?? "thermal_58mm",
      };
    } catch {
      appStorage.removeItem(LAST_PRINTER_STORAGE_KEY);
      return null;
    }
  }

  private rememberPrinter(printer: BluetoothPrinter): void {
    appStorage.setItem(
      LAST_PRINTER_STORAGE_KEY,
      JSON.stringify({
        id: printer.id,
        name: printer.name,
        address: printer.address,
        type: printer.type,
      }),
    );
  }

  private forgetPrinter(): void {
    appStorage.removeItem(LAST_PRINTER_STORAGE_KEY);
  }

  private async requestBluetoothPermissions(silent = false): Promise<boolean> {
    if (Platform.OS !== "android") return true;
    if (Platform.Version < 31) return true;

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);

    const allowed =
      granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED;

    if (!allowed && !silent) {
      Alert.alert(
        "Izin Bluetooth Diperlukan",
        "Berikan izin Bluetooth untuk memindai printer.",
        [{ text: "OK" }],
      );
    }

    return allowed;
  }

  private async ensureBluetoothReady(silent = false): Promise<boolean> {
    const hasPermission = await this.requestBluetoothPermissions(silent);
    if (!hasPermission) return false;

    const available = await RNBluetoothClassic.isBluetoothAvailable();
    if (!available) {
      if (!silent) {
        Alert.alert(
          "Bluetooth Tidak Tersedia",
          "Perangkat tidak mendukung Bluetooth Classic.",
          [{ text: "OK" }],
        );
      }
      return false;
    }

    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (enabled) return true;

    if (silent) return false;

    const requested = await RNBluetoothClassic.requestBluetoothEnabled();
    if (!requested) {
      Alert.alert(
        "Bluetooth Dinonaktifkan",
        "Aktifkan Bluetooth untuk memindai printer.",
        [{ text: "OK" }],
      );
      return false;
    }

    return await RNBluetoothClassic.isBluetoothEnabled();
  }

  async scanPrinters(): Promise<BluetoothPrinter[]> {
    try {
      const ready = await this.ensureBluetoothReady();
      if (!ready) return [];

      const bonded = await RNBluetoothClassic.getBondedDevices();

      const mapped = bonded.map((d) => ({
        id: d.address,
        name: d.name || "Unknown",
        address: d.address,
        type: "thermal_58mm" as const,
        connected: false,
      }));

      const filtered = mapped.filter((p) => looksLikePrinter(p.name));
      return filtered.length > 0 ? filtered : mapped;
    } catch (error: unknown) {
      console.error("Error scanning printers:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Tidak dapat memindai printer Bluetooth";
      Alert.alert("Scan Gagal", message, [{ text: "OK" }]);
      return [];
    }
  }

  async connectPrinter(
    printer: BluetoothPrinter,
    options: ConnectOptions = {},
  ): Promise<boolean> {
    const { persist = true, silent = false } = options;

    try {
      this.setState({
        printing: false,
        connected: false,
        printer,
        reconnecting: silent,
      });

      const ready = await this.ensureBluetoothReady(silent);
      if (!ready) {
        this.setState({
          connected: false,
          printer,
          printing: false,
          reconnecting: false,
        });
        return false;
      }

      const bonded = await RNBluetoothClassic.getBondedDevices();
      const device = bonded.find((d) => d.address === printer.address);

      if (!device) {
        if (!silent) {
          Alert.alert(
            "Printer Tidak Ditemukan",
            "Pastikan printer sudah dipasangkan (paired) di pengaturan Bluetooth.",
            [{ text: "OK" }],
          );
        }
        this.setState({
          connected: false,
          printer,
          printing: false,
          reconnecting: false,
        });
        return false;
      }

      await device.connect();
      this.connectedDevice = device;
      if (persist) this.rememberPrinter(printer);
      this.setState({
        connected: true,
        printer,
        printing: false,
        reconnecting: false,
      });
      if (!silent) {
        Alert.alert("Berhasil", `Printer ${printer.name} terhubung`);
      }
      return true;
    } catch (error: unknown) {
      console.error("Error connecting to printer:", error);
      this.connectedDevice = null;
      this.setState({
        connected: false,
        printer,
        printing: false,
        reconnecting: false,
      });
      if (!silent) {
        const message =
          error instanceof Error
            ? error.message
            : "Tidak dapat menghubungkan ke printer";
        Alert.alert("Koneksi Gagal", message, [{ text: "OK" }]);
      }
      return false;
    }
  }

  async autoReconnectLastPrinter(): Promise<boolean> {
    if (this.state.connected && this.connectedDevice) return true;
    if (this.reconnectPromise) return this.reconnectPromise;

    const printer = this.state.printer ?? this.getStoredPrinter();
    if (!printer) return false;

    this.reconnectPromise = this.connectPrinter(printer, {
      persist: true,
      silent: true,
    }).finally(() => {
      this.reconnectPromise = null;
    });

    return this.reconnectPromise;
  }

  async disconnect(): Promise<void> {
    const device = this.connectedDevice;
    this.forgetPrinter();

    if (!device || !this.state.connected) {
      this.connectedDevice = null;
      this.setState({
        connected: false,
        printer: null,
        printing: false,
        reconnecting: false,
      });
      return;
    }

    try {
      await device.disconnect();
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      this.connectedDevice = null;
      this.setState({
        connected: false,
        printer: null,
        printing: false,
        reconnecting: false,
      });
    }
  }

  /**
   * Send ESC/POS bytes from expo-escpos (or any Uint8Array) to the printer.
   */
  async printEscPosBytes(data: Uint8Array): Promise<boolean> {
    if (!this.connectedDevice || !this.state.connected || !this.state.printer) {
      const reconnected = await this.autoReconnectLastPrinter();
      if (!reconnected) {
        Alert.alert(
          "Printer Tidak Terhubung",
          "Silakan hubungkan ke printer Bluetooth terlebih dahulu.",
          [{ text: "OK" }],
        );
        return false;
      }
    }

    if (!this.connectedDevice) {
      Alert.alert(
        "Printer Tidak Tersedia",
        "Modul Bluetooth printer tidak tersedia.",
        [{ text: "OK" }],
      );
      return false;
    }

    try {
      this.setState({ printing: true });
      // Encode raw bytes as base64 so the SPP socket receives the exact binary payload
      const b64 = uint8ArrayToBase64(data);
      await this.connectedDevice.write(b64, "base64");
      this.setState({ printing: false });
      return true;
    } catch (error: unknown) {
      console.error("Error printing:", error);
      this.connectedDevice = null;
      this.setState({ connected: false, printing: false });
      const message =
        error instanceof Error
          ? error.message
          : "Tidak dapat mencetak ke printer";
      Alert.alert("Cetak Gagal", message, [{ text: "OK" }]);
      return false;
    }
  }

  /**
   * Render HTML with expo-escpos then send to printer (thermal image pipeline).
   */
  async printReceiptHtml(html: string, model?: PrinterModel): Promise<boolean> {
    const m: PrinterModel =
      model ?? printerModelFromType(this.state.printer?.type ?? "thermal_58mm");
    try {
      const escPos = await renderHtmlToImages(html, {
        model: m,
        maxHeightToBreak: 1600,
      });
      // ESC @ (init) + raster + GS V 1 (partial cut)
      const init = new Uint8Array([0x1b, 0x40]);
      const cut = new Uint8Array([0x1d, 0x56, 0x01]);
      const payload = new Uint8Array(init.length + escPos.length + cut.length);
      payload.set(init, 0);
      payload.set(escPos, init.length);
      payload.set(cut, init.length + escPos.length);
      return this.printEscPosBytes(payload);
    } catch (error: unknown) {
      console.error("renderHtmlToImages failed:", error);
      const message =
        error instanceof Error ? error.message : "Gagal merender struk";
      Alert.alert("Cetak Gagal", message, [{ text: "OK" }]);
      return false;
    }
  }

  /**
   * Legacy: ESC/POS built as a binary string (byte values in each char). Prefer printReceiptHtml.
   */
  async printESCPOS(data: string): Promise<boolean> {
    const bytes = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      bytes[i] = data.charCodeAt(i) & 0xff;
    }
    return this.printEscPosBytes(bytes);
  }

  async testPrint(): Promise<boolean> {
    const connected = await this.autoReconnectLastPrinter();
    if (!connected) {
      Alert.alert(
        "Printer Tidak Terhubung",
        "Silakan hubungkan ke printer Bluetooth terlebih dahulu.",
        [{ text: "OK" }],
      );
      return false;
    }

    const model = printerModelFromType(
      this.state.printer?.type ?? "thermal_58mm",
    );
    const widthPx = model === "80" ? 576 : 384;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body { width: ${widthPx}px; font-family: monospace; text-align: center; padding: 8px; font-size: 20px; color: #000; background: #fff; }
      h2 { margin: 4px 0; font-size: 24px; }
      p { margin: 4px 0; }
      hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
    </style></head><body>
      <h2>*** TEST PRINT ***</h2>
      <p>Kasir — Koneksi OK</p>
      <hr/>
      <p>${new Date().toLocaleString("id-ID")}</p>
      <hr/>
      <p>Printer berfungsi baik!</p>
    </body></html>`;
    const ok = await this.printReceiptHtml(html);
    if (ok) {
      Alert.alert("Berhasil", "Test print berhasil!");
    }
    return ok;
  }

  private setState(newState: Partial<PrinterState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const bluetoothPrinterManager = BluetoothPrinterManager.getInstance();
