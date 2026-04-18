import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { store } from "../redux/store";

export function renderWithProviders(
  ui: React.ReactElement,
  options?: { route?: string }
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[options?.route ?? "/"]}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </ReduxProvider>
  );

  return render(ui, { wrapper: Wrapper });
}

