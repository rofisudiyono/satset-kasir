import { useDeviceProfileContext } from "@/providers/DeviceProfileProvider";

export function useDeviceProfile() {
  return useDeviceProfileContext();
}
