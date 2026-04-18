import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { orderTypeOptions } from "@/features/payment/api/payment.data";
import { TextBodySm, TextCaption } from "@/components";
import { ColorBase, ColorNeutral, ColorPrimary, ColorSurface } from "@/themes/Colors";
import type { KasirTable } from "@/lib/api/types";
import type { OrderType } from "@/types";

interface CustomerInfoCardProps {
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  orderType: OrderType;
  onOrderTypeChange: (v: OrderType) => void;
  selectedTableId?: string;
  selectedTableLabel?: string;
  tables: KasirTable[];
  isTablesLoading: boolean;
  onSelectTable: (table: KasirTable) => void;
}

export function CustomerInfoCard({
  customerName,
  onCustomerNameChange,
  orderType,
  onOrderTypeChange,
  selectedTableId,
  selectedTableLabel,
  tables,
  isTablesLoading,
  onSelectTable,
}: CustomerInfoCardProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const isDineIn = orderType === "Dine In";
  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [selectedTableId, tables],
  );
  const displayTableLabel = selectedTable?.label || selectedTableLabel || "";

  return (
    <View style={styles.card}>
      <TextCaption color="$colorSecondary" marginBottom={6}>
        Nama Pelanggan
      </TextCaption>
      <TextInput
        value={customerName}
        onChangeText={onCustomerNameChange}
        placeholder="Opsional"
        placeholderTextColor={ColorNeutral.neutral400}
        style={styles.inputField}
      />

      <TextCaption color="$colorSecondary" marginBottom={8} marginTop={12}>
        Mode Layanan
      </TextCaption>
      <View style={styles.segmentControl}>
        {orderTypeOptions.map((type) => (
          <TouchableOpacity
            key={type}
            activeOpacity={0.8}
            style={[
              styles.segmentBtn,
              orderType === type && styles.segmentBtnActive,
            ]}
            onPress={() => onOrderTypeChange(type)}
          >
            <TextBodySm
              fontWeight="600"
              color={orderType === type ? ColorBase.white : "$colorSecondary"}
            >
              {type}
            </TextBodySm>
          </TouchableOpacity>
        ))}
      </View>

      <TextCaption color="$colorSecondary" marginBottom={6} marginTop={12}>
        {isDineIn ? "Pilih Meja" : "Label Pesanan"}
      </TextCaption>
      {isDineIn ? (
        <>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.selectorButton,
              !displayTableLabel && styles.selectorButtonEmpty,
            ]}
            onPress={() => setPickerVisible(true)}
          >
            <View style={styles.selectorContent}>
              <TextBodySm
                color={displayTableLabel ? "$colorPrimary" : ColorNeutral.neutral400}
                fontWeight={displayTableLabel ? "600" : "400"}
              >
                {displayTableLabel || "Pilih meja aktif"}
              </TextBodySm>
              {isTablesLoading ? (
                <ActivityIndicator size="small" color={ColorPrimary.primary600} />
              ) : (
                <TextBodySm color="$colorSecondary" fontWeight="600">
                  Ubah
                </TextBodySm>
              )}
            </View>
          </TouchableOpacity>
          <TextCaption color={displayTableLabel ? ColorNeutral.neutral500 : ColorPrimary.primary600} marginTop={6}>
            {displayTableLabel
              ? "Meja ini akan dikirim ke backend saat checkout."
              : "Dine In wajib memilih meja sebelum pembayaran."}
          </TextCaption>
        </>
      ) : (
        <View style={styles.infoBox}>
          <TextBodySm color="$colorSecondary">
            {orderType === "Take Away"
              ? "Order takeaway tidak membutuhkan meja."
              : "Order delivery tidak membutuhkan meja."}
          </TextBodySm>
        </View>
      )}

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TextBodySm fontWeight="700" color="$colorPrimary">
              Pilih meja aktif
            </TextBodySm>
            <TextCaption color={ColorNeutral.neutral500} marginTop={4} marginBottom={12}>
              Pilihan meja diambil dari data cabang aktif pada backend.
            </TextCaption>

            {isTablesLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="small" color={ColorPrimary.primary600} />
                <TextCaption color={ColorNeutral.neutral500}>
                  Memuat daftar meja...
                </TextCaption>
              </View>
            ) : tables.length === 0 ? (
              <View style={styles.emptyState}>
                <TextCaption color={ColorNeutral.neutral500} textAlign="center">
                  Belum ada meja aktif untuk cabang ini.
                </TextCaption>
              </View>
            ) : (
              <FlatList
                data={tables}
                keyExtractor={(item) => item.id}
                style={styles.tableList}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => {
                  const active = item.id === selectedTableId;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={[styles.tableRow, active && styles.tableRowActive]}
                      onPress={() => {
                        onSelectTable(item);
                        setPickerVisible(false);
                      }}
                    >
                      <View>
                        <TextBodySm
                          fontWeight="600"
                          color={active ? ColorPrimary.primary700 : "$colorPrimary"}
                        >
                          {item.label}
                        </TextBodySm>
                        <TextCaption color={ColorNeutral.neutral500}>
                          {item.capacity ? `Kapasitas ${item.capacity} orang` : "Kapasitas belum diatur"}
                        </TextCaption>
                      </View>
                      {active ? (
                        <TextCaption color={ColorPrimary.primary700}>Dipilih</TextCaption>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.closeButton}
              onPress={() => setPickerVisible(false)}
            >
              <TextBodySm fontWeight="600" color={ColorBase.white}>
                Tutup
              </TextBodySm>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ColorBase.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ColorSurface.border,
    shadowColor: ColorSurface.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  inputField: {
    backgroundColor: ColorNeutral.neutral50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: ColorNeutral.neutral900,
    fontFamily: "Poppins_400Regular",
  },
  segmentControl: {
    flexDirection: "row",
    backgroundColor: ColorNeutral.neutral100,
    borderRadius: 24,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 20,
  },
  segmentBtnActive: {
    backgroundColor: ColorPrimary.primary600,
  },
  selectorButton: {
    backgroundColor: ColorNeutral.neutral50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectorButtonEmpty: {
    borderColor: ColorPrimary.primary200,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoBox: {
    backgroundColor: ColorNeutral.neutral50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: ColorBase.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ColorSurface.border,
    padding: 16,
    maxHeight: "70%",
  },
  tableList: {
    maxHeight: 320,
  },
  tableRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tableRowActive: {
    backgroundColor: ColorPrimary.primary50,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 120,
  },
  closeButton: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: ColorPrimary.primary600,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
});
