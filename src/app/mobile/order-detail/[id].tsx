import { useLocalSearchParams } from "expo-router";

import { OrderDetailMobileScreen } from "@/features/orders/screens/mobile/OrderDetailMobileScreen";

export default function MobileOrderDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderDetailMobileScreen orderId={id ?? ""} />;
}
