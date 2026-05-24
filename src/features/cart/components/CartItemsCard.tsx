import { Ionicons } from "@expo/vector-icons";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import React, { useCallback, useState } from "react";
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { XStack, YStack } from "tamagui";

import type { CartItem } from "@/features/cart/store/cart.store";
import { TextBody, TextBodyLg, TextBodySm } from "@/components/atoms/Typography";
import { ColorBase, ColorNeutral, ColorSurface } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import { CartItemRow } from "./CartItemRow";

const CART_ITEM_ESTIMATED_HEIGHT = 120;

interface CartItemsCardProps {
  cart: CartItem[];
  onUpdateQty: (cartId: string, qty: number) => void;
  onRemove: (cartId: string) => void;
  onUpdateNote: (cartId: string, note: string) => void;
}

function CartDivider() {
  return <View style={styles.divider} />;
}

export function CartItemsCard({
  cart,
  onUpdateQty,
  onRemove,
  onUpdateNote,
}: CartItemsCardProps) {
  const [activeNoteCartId, setActiveNoteCartId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const activeItem = cart.find((i) => i.cartId === activeNoteCartId);

  const handleOpenNote = useCallback(
    (cartId: string) => {
      const item = cart.find((i) => i.cartId === cartId);
      setNoteInput(item?.note ?? "");
      setActiveNoteCartId(cartId);
    },
    [cart],
  );

  const handleCloseNote = useCallback(() => {
    setActiveNoteCartId(null);
    setNoteInput("");
  }, []);

  const handleSaveNote = useCallback(() => {
    if (activeNoteCartId) {
      onUpdateNote(activeNoteCartId, noteInput);
    }
    setActiveNoteCartId(null);
    setNoteInput("");
  }, [activeNoteCartId, noteInput, onUpdateNote]);

  const renderItem = useCallback<ListRenderItem<CartItem>>(
    ({ item, index }) => (
      <>
        <CartItemRow
          item={item}
          onUpdateQty={onUpdateQty}
          onRemove={onRemove}
          onOpenNote={handleOpenNote}
        />
        {index < cart.length - 1 ? <CartDivider /> : null}
      </>
    ),
    [cart.length, handleOpenNote, onRemove, onUpdateQty],
  );

  const keyExtractor = useCallback((item: CartItem) => item.cartId, []);

  return (
    <>
      <View style={styles.card}>
        {cart.length === 0 ? (
          <YStack alignItems="center" paddingVertical={24} gap={8}>
            <Ionicons
              name="bag-outline"
              size={40}
              color={ColorNeutral.neutral400}
            />
            <TextBody color="$colorSecondary">Keranjang masih kosong</TextBody>
          </YStack>
        ) : (
          <FlashList
            data={cart}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={CART_ITEM_ESTIMATED_HEIGHT}
            scrollEnabled={false}
          />
        )}
      </View>

      <Modal
        visible={activeNoteCartId !== null}
        transparent
        animationType="slide"
        onRequestClose={handleCloseNote}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={handleCloseNote}
          />
          <View style={styles.noteSheet}>
            <View style={styles.dragHandle} />
            <TextBodyLg fontWeight="700" marginBottom={12}>
              Catatan untuk {activeItem?.productName}
            </TextBodyLg>
            <TextInput
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="Contoh: Tidak pedas, kurangi gula..."
              placeholderTextColor={ColorNeutral.neutral400}
              style={styles.noteInputText}
              multiline
            />
            <XStack gap="$3">
              <TouchableOpacity
                style={styles.btnFlex}
                activeOpacity={0.8}
                onPress={handleCloseNote}
              >
                <View style={styles.btnCancel}>
                  <TextBodySm fontWeight="600" color="$color">
                    Batal
                  </TextBodySm>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnFlex}
                activeOpacity={0.8}
                onPress={handleSaveNote}
              >
                <View style={styles.btnSave}>
                  <TextBodySm fontWeight="600" color={ColorBase.white}>
                    Simpan
                  </TextBodySm>
                </View>
              </TouchableOpacity>
            </XStack>
          </View>
        </View>
      </Modal>
    </>
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
  divider: {
    height: 1,
    backgroundColor: ColorNeutral.neutral100,
    marginVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  noteSheet: {
    backgroundColor: ColorBase.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: ColorNeutral.neutral300,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  noteInputText: {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: ColorNeutral.neutral200,
    borderRadius: 10,
    backgroundColor: ColorNeutral.neutral50,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  btnFlex: {
    flex: 1,
  },
  btnCancel: {
    borderColor: ColorNeutral.neutral200,
    borderWidth: 1,
    backgroundColor: ColorBase.white,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnSave: {
    backgroundColor: BrandColors.buttonSolid,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
