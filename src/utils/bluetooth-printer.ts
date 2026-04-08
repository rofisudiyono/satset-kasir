/**
 * Bluetooth Printer Manager
 * Handles Bluetooth printer discovery, connection, and printing
 */

import { Alert } from 'react-native';

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

class BluetoothPrinterManager {
  private static instance: BluetoothPrinterManager;
  private state: PrinterState = {
    connected: false,
    printer: null,
    printing: false,
  };
  private listeners: ConnectionStateChangeCallback[] = [];
  private nativeModule: any = null;

  private constructor() {
    // Try to load native Bluetooth module (if available)
    try {
      // This will be set when the native module is linked
      // this.nativeModule = require('react-native-bluetooth-escpos-printer');
    } catch {
      console.warn('Bluetooth ESC/POS printer module not available');
    }
  }

  static getInstance(): BluetoothPrinterManager {
    if (!BluetoothPrinterManager.instance) {
      BluetoothPrinterManager.instance = new BluetoothPrinterManager();
    }
    return BluetoothPrinterManager.instance;
  }

  /**
   * Subscribe to printer state changes
   */
  subscribe(callback: ConnectionStateChangeCallback): () => void {
    this.listeners.push(callback);
    // Immediately notify of current state
    callback(this.state);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Get current printer state
   */
  getState(): PrinterState {
    return { ...this.state };
  }

  /**
   * Scan for available Bluetooth printers
   */
  async scanPrinters(timeout: number = 10000): Promise<BluetoothPrinter[]> {
    if (!this.nativeModule) {
      Alert.alert(
        'Bluetooth Tidak Tersedia',
        'Modul Bluetooth printer belum diinstal. Silakan instal react-native-bluetooth-escpos-printer.',
        [{ text: 'OK' }]
      );
      return [];
    }

    try {
      // Request Bluetooth permission
      await this.nativeModule.BluetoothManager.enableBluetooth();
      
      // Scan for devices
      const devices = await this.nativeModule.BluetoothManager.getBondedDevices();
      
      // Filter to only printer-like devices
      const printers: BluetoothPrinter[] = (devices || [])
        .filter((device: any) => {
          // Filter by common printer name patterns or known brands
          const name = device.name?.toLowerCase() || '';
          return (
            name.includes('printer') ||
            name.includes('print') ||
            name.includes('xprinter') ||
            name.includes('gainscha') ||
            name.includes('epson') ||
            name.includes('rpp') ||
            name.includes('pos')
          );
        })
        .map((device: any) => ({
          id: device.address,
          name: device.name || 'Unknown Printer',
          address: device.address,
          type: 'thermal_58mm', // Default to 58mm
          connected: false,
        }));

      return printers;
    } catch (error: any) {
      console.error('Error scanning printers:', error);
      Alert.alert(
        'Scan Gagal',
        error.message || 'Tidak dapat memindai printer Bluetooth',
        [{ text: 'OK' }]
      );
      return [];
    }
  }

  /**
   * Connect to a Bluetooth printer
   */
  async connectPrinter(printer: BluetoothPrinter): Promise<boolean> {
    if (!this.nativeModule) {
      Alert.alert(
        'Bluetooth Tidak Tersedia',
        'Modul Bluetooth printer belum diinstal.',
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      this.setState({ printing: false, connected: false, printer });
      
      // Connect to printer
      await this.nativeModule.BluetoothManager.connect(printer.address);
      
      this.setState({ connected: true, printer, printing: false });
      
      Alert.alert('Berhasil', `Printer ${printer.name} terhubung`);
      return true;
    } catch (error: any) {
      console.error('Error connecting to printer:', error);
      this.setState({ connected: false, printer: null, printing: false });
      
      Alert.alert(
        'Koneksi Gagal',
        error.message || 'Tidak dapat menghubungkan ke printer',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  /**
   * Disconnect from current printer
   */
  async disconnect(): Promise<void> {
    if (!this.nativeModule || !this.state.connected) {
      return;
    }

    try {
      await this.nativeModule.BluetoothManager.disconnect();
      this.setState({ connected: false, printer: null, printing: false });
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  /**
   * Print ESC/POS data to printer
   */
  async printESCPOS(data: string): Promise<boolean> {
    if (!this.nativeModule) {
      Alert.alert(
        'Printer Tidak Tersedia',
        'Modul Bluetooth printer belum diinstal.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (!this.state.connected || !this.state.printer) {
      Alert.alert(
        'Printer Tidak Terhubung',
        'Silakan hubungkan ke printer Bluetooth terlebih dahulu.',
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      this.setState({ printing: true });
      
      // Convert string to base64 for native module
      const base64Data = btoa(data);
      
      // Print data
      await this.nativeModule.BluetoothEscposPrinter.printerPrintText(base64Data, {
        encoding: 'GBK',
        codepage: 0,
        widthtimes: 0,
        heigthtimes: 0,
      });

      this.setState({ printing: false });
      return true;
    } catch (error: any) {
      console.error('Error printing:', error);
      this.setState({ printing: false });
      
      Alert.alert(
        'Cetak Gagal',
        error.message || 'Tidak dapat mencetak ke printer',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  /**
   * Test print to verify connection
   */
  async testPrint(): Promise<boolean> {
    const testData = '\x1B@\x1Ba\x01\x1BE\x01Test Print\x1BE\x00\n';
    const success = await this.printESCPOS(testData);
    
    if (success) {
      Alert.alert('Berhasil', 'Test print berhasil!');
    }
    
    return success;
  }

  /**
   * Update printer state and notify listeners
   */
  private setState(newState: Partial<PrinterState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const bluetoothPrinterManager = BluetoothPrinterManager.getInstance();
