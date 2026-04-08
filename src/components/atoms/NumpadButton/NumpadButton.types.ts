import type { StyleProp, ViewStyle } from "react-native";

export interface NumpadButtonProps {
  label: string;
  onPress: () => void;
  textColor?: string;
  bgColor?: string;
  isIcon?: boolean;
  compact?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}
