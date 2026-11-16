
  /// <reference types="vite/client" />

import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { CurrencyProvider } from "./features/currency/CurrencyContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <CurrencyProvider>
    <App />
  </CurrencyProvider>,
);
