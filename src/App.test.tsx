import React from "react";
import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./test/render";

test("renders header on non-home routes", () => {
  renderWithProviders(<App />, { route: "/about" });
  expect(screen.getByText("BOXCARS")).toBeInTheDocument();
});
