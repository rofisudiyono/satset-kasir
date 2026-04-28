import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  cartAtom,
  heldOrdersAtom,
  scannedBarcodeAtom,
  type CartItem,
} from "@/features/cart/store/cart.store";
import { isShiftStartedAtom } from "@/features/shift/store/shift.store";
import { API_BASE_URL } from "@/config/env";
import { useMenusQuery } from "@/hooks/api/use-kasir-api";
import type { KasirMenu } from "@/lib/api/types";
import type { CatalogProduct, CategoryFilter, ProductCategory } from "@/types";

type KasirMenuWithBarcode = KasirMenu & {
  barcode?: string | null;
};

function normalizeCategoryName(name: string): ProductCategory {
  const lower = name.toLowerCase();
  if (
    lower.includes("makanan") ||
    lower.includes("food") ||
    lower.includes("makan")
  ) {
    return "Makanan";
  }
  if (
    lower.includes("minuman") ||
    lower.includes("drink") ||
    lower.includes("minum")
  ) {
    return "Minuman";
  }
  if (
    lower.includes("snack") ||
    lower.includes("cemilan") ||
    lower.includes("camilan")
  ) {
    return "Snack";
  }
  return "Makanan";
}

function mapMenuToCatalogProduct(menu: KasirMenu): CatalogProduct {
  const menuWithBarcode = menu as KasirMenuWithBarcode;

  const variants =
    menu.hasVariants && menu.variants.length > 0
      ? [
          {
            name: "Pilihan",
            options: menu.variants.map((variant) => ({
              id: variant.id,
              label: variant.name,
              priceAdd: variant.price - menu.price,
            })),
          },
        ]
      : undefined;

  return {
    id: menu.id,
    name: menu.name,
    imageUrl: menu.imageUrl
      ? menu.imageUrl.startsWith("http")
        ? menu.imageUrl
        : `${API_BASE_URL}${menu.imageUrl}`
      : undefined,
    category: normalizeCategoryName(menu.categoryName),
    basePrice: menu.price,
    stockStatus: menu.isAvailable
      ? "normal"
      : menu.availabilityReason === "OUT_OF_STOCK"
        ? "empty"
        : "inactive",
    isAvailable: menu.isAvailable,
    availabilityReason: menu.availabilityReason,
    variants,
    sku: menu.sku ?? undefined,
    barcode: menuWithBarcode.barcode ?? undefined,
  };
}

function compareProductsByCashierPriority(
  a: CatalogProduct,
  b: CatalogProduct,
) {
  const aAvailable = a.isAvailable === true;
  const bAvailable = b.isAvailable === true;

  if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;

  return a.name.localeCompare(b.name, "id");
}

export function useTransactionEntry() {
  const router = useRouter();
  const [isShiftStarted] = useAtom(isShiftStartedAtom);
  const [categoryFilterState, setCategoryFilterState] =
    useState<CategoryFilter>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());
  const [cart, setCart] = useAtom(cartAtom);
  const [scannedBarcode, setScannedBarcode] = useAtom(scannedBarcodeAtom);
  const [heldOrders] = useAtom(heldOrdersAtom);
  const [variantProduct, setVariantProduct] = useState<CatalogProduct | null>(
    null,
  );
  const [isVariantSheetVisible, setVariantSheetVisible] = useState(false);
  const [isCartVisible, setCartVisible] = useState(false);

  const {
    data: apiMenus,
    isFetching: menusFetching,
    isLoading: menusLoading,
    refetch: refetchMenus,
  } =
    useMenusQuery(isShiftStarted);

  const catalogProducts = useMemo<CatalogProduct[]>(
    () =>
      (apiMenus ?? [])
        .map(mapMenuToCatalogProduct)
        .sort(compareProductsByCashierPriority),
    [apiMenus],
  );

  useEffect(() => {
    if (isShiftStarted) return;
    router.replace("/buka-shift" as never);
  }, [isShiftStarted, router]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "cartId">) => {
      const existing = cart.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.variantLabel === item.variantLabel,
      );

      if (existing) {
        setCart((prev) =>
          prev.map((cartItem) =>
            cartItem.cartId === existing.cartId
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem,
          ),
        );
        return;
      }

      setCart((prev) => [
        ...prev,
        { ...item, cartId: `${item.productId}-${Date.now()}` },
      ]);
    },
    [cart, setCart],
  );

  const handleAddProduct = useCallback(
    (product: CatalogProduct) => {
      if (product.variants) {
        setVariantProduct(product);
        setVariantSheetVisible(true);
        return;
      }

      addToCart({
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity: 1,
        unitPrice: product.basePrice,
      });
    },
    [addToCart],
  );

  useEffect(() => {
    if (!scannedBarcode) return;

    const found = catalogProducts.find(
      (product) => product.barcode === scannedBarcode,
    );

    if (found) {
      handleAddProduct(found);
    }

    setScannedBarcode(null);
  }, [catalogProducts, handleAddProduct, scannedBarcode, setScannedBarcode]);

  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((product) => {
      const matchesCategory =
        categoryFilterState === "Semua" ||
        product.category === categoryFilterState;
      const matchesSearch =
        deferredSearchQuery.length === 0 ||
        product.name.toLowerCase().includes(deferredSearchQuery) ||
        product.sku?.toLowerCase().includes(deferredSearchQuery) ||
        product.barcode?.toLowerCase().includes(deferredSearchQuery) ||
        product.category.toLowerCase().includes(deferredSearchQuery);

      return matchesCategory && matchesSearch;
    });
  }, [catalogProducts, categoryFilterState, deferredSearchQuery]);

  const cartTotalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );
  const cartTotalPrice = useMemo(
    () => cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const setCategoryFilter = useCallback((next: CategoryFilter) => {
    startTransition(() => {
      setCategoryFilterState(next);
    });
  }, []);

  return {
    menusLoading,
    menusRefreshing: menusFetching,
    refetchMenus,
    searchQuery,
    setSearchQuery,
    categoryFilter: categoryFilterState,
    setCategoryFilter,
    products: filteredProducts,
    handleAddProduct,
    heldOrdersCount: heldOrders.length,
    cartTotalItems,
    cartTotalPrice,
    openScanner: () => router.push("/barcode-scanner" as never),
    openHeldOrders: () => router.push("/pesanan-ditahan" as never),
    isVariantSheetVisible,
    variantProduct,
    addToCart,
    closeVariantSheet: () => setVariantSheetVisible(false),
    isCartVisible,
    openCart: () => setCartVisible(true),
    closeCart: () => setCartVisible(false),
  };
}
