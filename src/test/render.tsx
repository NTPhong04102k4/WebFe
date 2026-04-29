import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { createAppQueryClient } from "src/query/queryClient";
import { MemoryRouter } from "react-router-dom";

export function renderWithProviders(
  ui: React.ReactElement,
  options?: { route?: string }
) {
  const queryClient = createAppQueryClient();
  queryClient.setDefaultOptions({
    queries: { retry: false },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[options?.route ?? "/"]}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
}

