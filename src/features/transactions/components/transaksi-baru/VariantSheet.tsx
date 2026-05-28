import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { XStack, YStack } from "tamagui";

import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/config/categoryStyles";
import { type CartItem, type CartItemModifier } from "@/features/cart/store/cart.store";
import { TextBodyLg, TextBodySm, TextH3 } from "@/components/atoms/Typography";
import { ColorBase, ColorNeutral, ColorPrimary } from "@/themes/Colors";
import { BrandColors } from "@/themes/brand";
import type { CatalogProduct } from "@/types";
import { formatPrice } from "@/utils";

type Props = {
  product: CatalogProduct | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "cartId">) => void;
};

export function VariantSheet({
  product,
  visible,
  onClose,
  onAddToCart,
}: Props) {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, string[]>
  >({});
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);

  React.useEffect(() => {
    if (product?.variants) {
      const defaults: Record<string, string> = {};
      product.variants.forEach((group) => {
        defaults[group.name] = group.options[0].id;
      });
      setSelectedVariants(defaults);
    }
    setSelectedModifiers({});
    setNote("");
    setQty(1);
  }, [product]);

  if (!product) return null;

  const totalAddon = product.variants
    ? product.variants.reduce((sum, group) => {
        const selectedId = selectedVariants[group.name];
        const opt = group.options.find((o) => o.id === selectedId);
        return sum + (opt?.priceAdd ?? 0);
      }, 0)
    : 0;

  const totalModifierPrice = product.modifierGroups
    ? product.modifierGroups.reduce((sum, group) => {
        const selectedIds = selectedModifiers[group.id] ?? [];
        return sum + group.options
          .filter((o) => selectedIds.includes(o.id))
          .reduce((s, o) => s + o.extraPrice, 0);
      }, 0)
    : 0;

  const unitPrice = product.basePrice + totalAddon + totalModifierPrice;
  const total = unitPrice * qty;

  const variantLabel = product.variants
    ? product.variants
        .map((g) => {
          const opt = g.options.find((o) => o.id === selectedVariants[g.name]);
          return opt?.label ?? "";
        })
        .filter(Boolean)
        .join(", ")
    : undefined;

  function handleAdd() {
    // opt.id for the first variant group = the backend menuVariantId UUID
    const firstGroup = product!.variants?.[0];
    const variantId = firstGroup ? selectedVariants[firstGroup.name] : undefined;

    const modifiers: CartItemModifier[] = product!.modifierGroups
      ? product!.modifierGroups.flatMap((group) => {
          const selectedIds = selectedModifiers[group.id] ?? [];
          return group.options
            .filter((o) => selectedIds.includes(o.id))
            .map((o) => ({
              modifierOptionId: o.id,
              label: o.label,
              extraPrice: o.extraPrice,
            }));
        })
      : [];

    // Validasi required modifier groups
    if (product!.modifierGroups) {
      for (const group of product!.modifierGroups) {
        if (group.isRequired) {
          const selectedIds = selectedModifiers[group.id] ?? [];
          if (selectedIds.length < group.minSelect) {
            Alert.alert(
              "Pilihan wajib",
              `Pilih minimal ${group.minSelect} opsi untuk "${group.name}"`,
            );
            return;
          }
        }
      }
    }

    onAddToCart({
      productId: product!.id,
      productName: product!.name,
      category: product!.category,
      variantId,
      variantLabel,
      modifiers: modifiers.length > 0 ? modifiers : undefined,
      quantity: qty,
      unitPrice,
      note: note.trim() || undefined,
    });
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <XStack gap="$3" alignItems="center" marginBottom="$2">
            <View
              style={[
                styles.sheetProductImage,
                { backgroundColor: CATEGORY_COLORS[product.category].bg },
              ]}
            >
              <Ionicons
                name={CATEGORY_ICONS[product.category]}
                size={28}
                color={CATEGORY_COLORS[product.category].color}
              />
            </View>
            <YStack gap={2}>
              <TextBodyLg fontWeight="700">{product.name}</TextBodyLg>
              <TextBodySm color="$colorSecondary">
                Mulai {formatPrice(product.basePrice)}
              </TextBodySm>
            </YStack>
          </XStack>

          {product.variants?.map((group) => (
            <YStack key={group.name} gap="$2" marginBottom="$3">
              <TextBodyLg fontWeight="700">{group.name}</TextBodyLg>
              <XStack flexWrap="wrap" gap="$2">
                {group.options.map((opt) => {
                  const isSelected = selectedVariants[group.name] === opt.id;
                  const optLabel =
                    opt.priceAdd > 0
                      ? `${opt.label} +${formatPrice(opt.priceAdd)}`
                      : opt.label;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.7}
                      onPress={() =>
                        setSelectedVariants((prev) => ({
                          ...prev,
                          [group.name]: opt.id,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.variantChip,
                          isSelected && styles.variantChipSelected,
                        ]}
                      >
                        <TextBodySm
                          fontWeight="600"
                          color={isSelected ? "$primary" : "$colorSecondary"}
                        >
                          {optLabel}
                        </TextBodySm>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </XStack>
            </YStack>
          ))}

          {product.modifierGroups?.map((group) => (
            <YStack key={group.id} gap="$2" marginBottom="$3">
              <XStack gap="$2" alignItems="center">
                <TextBodyLg fontWeight="700">{group.name}</TextBodyLg>
                {group.isRequired && (
                  <TextBodySm color="$red10">*wajib</TextBodySm>
                )}
              </XStack>
              <XStack flexWrap="wrap" gap="$2">
                {group.options.map((opt) => {
                  const selectedIds = selectedModifiers[group.id] ?? [];
                  const isSelected = selectedIds.includes(opt.id);
                  const optLabel =
                    opt.extraPrice > 0
                      ? `${opt.label} +${formatPrice(opt.extraPrice)}`
                      : opt.label;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedModifiers((prev) => {
                          const current = prev[group.id] ?? [];
                          if (isSelected) {
                            return { ...prev, [group.id]: current.filter((id) => id !== opt.id) };
                          }
                          if (group.maxSelect === 1) {
                            return { ...prev, [group.id]: [opt.id] };
                          }
                          if (current.length >= group.maxSelect) return prev;
                          return { ...prev, [group.id]: [...current, opt.id] };
                        });
                      }}
                    >
                      <View
                        style={[
                          styles.variantChip,
                          isSelected && styles.variantChipSelected,
                        ]}
                      >
                        <TextBodySm
                          fontWeight="600"
                          color={isSelected ? "$primary" : "$colorSecondary"}
                        >
                          {optLabel}
                        </TextBodySm>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </XStack>
            </YStack>
          ))}

          <TextBodyLg
            fontWeight="700"
            color="$primary"
            textAlign="center"
            fontSize={18}
            marginBottom="$3"
          >
            Total: {formatPrice(unitPrice)}
          </TextBodyLg>

          <View style={styles.noteInput}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Tambah catatan... (opsional)"
              placeholderTextColor={ColorNeutral.neutral400}
              style={styles.noteInputText}
            />
          </View>

          <XStack
            alignItems="center"
            justifyContent="center"
            gap="$5"
            marginVertical="$3"
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setQty((q) => Math.max(1, q - 1))}
            >
              <View style={styles.qtyButton}>
                <Ionicons
                  name="remove"
                  size={20}
                  color={ColorNeutral.neutral700}
                />
              </View>
            </TouchableOpacity>

            <TextH3 fontWeight="700" minWidth={32} textAlign="center">
              {qty}
            </TextH3>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setQty((q) => q + 1)}
            >
              <View style={[styles.qtyButton, styles.qtyButtonPrimary]}>
                <Ionicons name="add" size={20} color={ColorBase.white} />
              </View>
            </TouchableOpacity>
          </XStack>

          <TouchableOpacity activeOpacity={0.85} onPress={handleAdd}>
            <View style={styles.addToCartButton}>
              <TextBodyLg
                fontWeight="700"
                color={ColorBase.white}
                fontSize={16}
              >
                Tambah ke Keranjang • {formatPrice(total)}
              </TextBodyLg>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: ColorBase.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: ColorNeutral.neutral200,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetProductImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  variantChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: ColorNeutral.neutral200,
    backgroundColor: ColorBase.white,
  },
  variantChipSelected: {
    borderColor: BrandColors.buttonSolid,
    backgroundColor: ColorPrimary.primary50,
  },
  noteInput: {
    backgroundColor: ColorNeutral.neutral100,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  noteInputText: {
    fontSize: 14,
    color: ColorNeutral.neutral900,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: ColorNeutral.neutral200,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonPrimary: {
    backgroundColor: BrandColors.buttonSolid,
    borderColor: BrandColors.buttonSolid,
  },
  addToCartButton: {
    backgroundColor: BrandColors.buttonSolid,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
});