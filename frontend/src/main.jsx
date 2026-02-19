import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppShell from "./layouts/AppShell";
import ToastContainer from "./components/ui/Toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppShell />
      <ToastContainer />
    </BrowserRouter>
  </StrictMode>
);
