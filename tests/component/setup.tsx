import { render as rtlRender } from "@testing-library/react";
import React from "react";

export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <>{children}</>,
    ...options,
  });
}

export * from "@testing-library/react";
