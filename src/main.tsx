import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App";
import { createAppQueryClient } from "./query/queryClient";
import { store } from "./redux/store";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

const queryClient = createAppQueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ReduxProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
