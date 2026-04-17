/**
 * Bluetooth printer: transport via react-native-bluetooth-classic (SPP),
 * ESC/POS payload via expo-escpos (HTML → raster ESC/POS).
 */

import { renderHtmlToImages } from 'expo-escpos';
import type { PrinterModel } from 'expo-escpos';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import type { BluetoothDevice } from 'react-native-bluetooth-classic';

export interface BluetoothPrinter {
  id: string;
  name: string;
  address: string;
  type: 'thermal_58mm' | 'thermal_80mm' | 'other';
  connected?: boolean;
}

export interface PrinterState {
  connected: boolean;
  printer: BluetoothPrinter | null;
  printing: boolean;
}

type ConnectionStateChangeCallback = (state: PrinterState) => void;

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function looksLikePrinter(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes('printer') ||
    n.includes('print') ||
    n.includes('xprinter') ||
    n.includes('gainscha') ||
    n.includes('iware') ||
    n.includes('epson') ||
    n.includes('rpp') ||
    n.includes('pos') ||
    n.includes('thermal') ||
    n.includes('esc')
  );
}

function printerModelFromType(type: BluetoothPrinter['type']): PrinterModel {
  return type === 'thermal_80mm' ? '80' : '58';
}

class BluetoothPrinterManager {
  private static instance: BluetoothPrinterManager;
  private state: PrinterState = {
    connected: false,
    printer: null,
    printing: false,
  };
  private listeners: ConnectionStateChangeCallback[] = [];
  private connectedDevice: BluetoothDevice | null = null;

  private constructor() {}

  static getInstance(): BluetoothPrinterManager {
    if (!BluetoothPrinterManager.instance) {
      BluetoothPrinterManager.instance = new BluetoothPrinterManager();
    }
    return BluetoothPrinterManager.instance;
  }

  subscribe(callback: ConnectionStateChangeCallback): () => void {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  getState(): PrinterState {
    return { ...this.state };
  }

  private async requestBluetoothPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version < 31) return true;

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);

    return (
      granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  async scanPrinters(): Promise<BluetoothPrinter[]> {
    try {
      const hasPermission = await this.requestBluetoothPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Izin Bluetooth Diperlukan',
          'Berikan izin Bluetooth untuk memindai printer.',
          [{ text: 'OK' }],
        );
        return [];
      }

      const available = await RNBluetoothClassic.isBluetoothAvailable();
      if (!available) {
        Alert.alert('Bluetooth Tidak Tersedia', 'Perangkat tidak mendukung Bluetooth Classic.', [{ text: 'OK' }]);
        return [];
      }

      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        const requested = await RNBluetoothClassic.requestBluetoothEnabled();
        if (!requested) {
          Alert.alert('Bluetooth Dinonaktifkan', 'Aktifkan Bluetooth untuk memindai printer.', [{ text: 'OK' }]);
          return [];
        }
      }

      const bonded = await RNBluetoothClassic.getBondedDevices();

      const mapped = bonded.map((d) => ({
        id: d.address,
        name: d.name || 'Unknown',
        address: d.address,
        type: 'thermal_58mm' as const,
        connected: false,
      }));

      const filtered = mapped.filter((p) => looksLikePrinter(p.name));
      return filtered.length > 0 ? filtered : mapped;
    } catch (error: unknown) {
      console.error('Error scanning printers:', error);
      const message = error instanceof Error ? error.message : 'Tidak dapat memindai printer Bluetooth';
      Alert.alert('Scan Gagal', message, [{ text: 'OK' }]);
      return [];
    }
  }

  async connectPrinter(printer: BluetoothPrinter): Promise<boolean> {
    try {
      this.setState({ printing: false, connected: false, printer });

      const bonded = await RNBluetoothClassic.getBondedDevices();
      const device = bonded.find((d) => d.address === printer.address);

      if (!device) {
        Alert.alert(
          'Printer Tidak Ditemukan',
          'Pastikan printer sudah dipasangkan (paired) di pengaturan Bluetooth.',
          [{ text: 'OK' }],
        );
        this.setState({ connected: false, printer: null, printing: false });
        return false;
      }

      await device.connect();
      this.connectedDevice = device;
      this.setState({ connected: true, printer, printing: false });
      Alert.alert('Berhasil', `Printer ${printer.name} terhubung`);
      return true;
    } catch (error: unknown) {
      console.error('Error connecting to printer:', error);
      this.connectedDevice = null;
      this.setState({ connected: false, printer: null, printing: false });
      const message = error instanceof Error ? error.message : 'Tidak dapat menghubungkan ke printer';
      Alert.alert('Koneksi Gagal', message, [{ text: 'OK' }]);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connectedDevice || !this.state.connected) return;
    try {
      await this.connectedDevice.disconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      this.connectedDevice = null;
      this.setState({ connected: false, printer: null, printing: false });
    }
  }

  /**
   * Send ESC/POS bytes from expo-escpos (or any Uint8Array) to the printer.
   */
  async printEscPosBytes(data: Uint8Array): Promise<boolean> {
    if (!this.connectedDevice) {
      Alert.alert('Printer Tidak Tersedia', 'Modul Bluetooth printer tidak tersedia.', [{ text: 'OK' }]);
      return false;
    }

    if (!this.state.connected || !this.state.printer) {
      Alert.alert(
        'Printer Tidak Terhubung',
        'Silakan hubungkan ke printer Bluetooth terlebih dahulu.',
        [{ text: 'OK' }],
      );
      return false;
    }

    try {
      this.setState({ printing: true });
      // Encode raw bytes as base64 so the SPP socket receives the exact binary payload
      const b64 = uint8ArrayToBase64(data);
      await this.connectedDevice.write(b64, 'base64');
      this.setState({ printing: false });
      return true;
    } catch (error: unknown) {
      console.error('Error printing:', error);
      this.setState({ printing: false });
      const message = error instanceof Error ? error.message : 'Tidak dapat mencetak ke printer';
      Alert.alert('Cetak Gagal', message, [{ text: 'OK' }]);
      return false;
    }
  }

  /**
   * Render HTML with expo-escpos then send to printer (thermal image pipeline).
   */
  async printReceiptHtml(html: string, model?: PrinterModel): Promise<boolean> {
    const m: PrinterModel = model ?? printerModelFromType(this.state.printer?.type ?? 'thermal_58mm');
    try {
      const escPos = await renderHtmlToImages(html, {
        model: m,
        maxHeightToBreak: 1600,
      });
      // ESC @ (init) + raster + LF*5 (feed paper past tear bar) + GS V 1 (partial cut)
      const init = new Uint8Array([0x1b, 0x40]);
      const feed = new Uint8Array([0x0a, 0x0a, 0x0a, 0x0a, 0x0a]);
      const cut = new Uint8Array([0x1d, 0x56, 0x01]);
      const payload = new Uint8Array(init.length + escPos.length + feed.length + cut.length);
      payload.set(init, 0);
      payload.set(escPos, init.length);
      payload.set(feed, init.length + escPos.length);
      payload.set(cut, init.length + escPos.length + feed.length);
      return this.printEscPosBytes(payload);
    } catch (error: unknown) {
      console.error('renderHtmlToImages failed:', error);
      const message = error instanceof Error ? error.message : 'Gagal merender struk';
      Alert.alert('Cetak Gagal', message, [{ text: 'OK' }]);
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
    const model = printerModelFromType(this.state.printer?.type ?? 'thermal_58mm');
    const widthPx = model === '80' ? 576 : 384;
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
      <p>${new Date().toLocaleString('id-ID')}</p>
      <hr/>
      <p>Printer berfungsi baik!</p>
    </body></html>`;
    const ok = await this.printReceiptHtml(html);
    if (ok) {
      Alert.alert('Berhasil', 'Test print berhasil!');
    }
    return ok;
  }

  private setState(newState: Partial<PrinterState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const bluetoothPrinterManager = BluetoothPrinterManager.getInstance();
