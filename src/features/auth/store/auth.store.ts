import { atomWithMMKV } from "@/store/storage";

import type { AuthSession } from "@/lib/api/types";

export const sessionAtom = atomWithMMKV<AuthSession | null>("authSession", null);
