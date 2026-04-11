import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { queryClient } from "./query-client";

type Props = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
