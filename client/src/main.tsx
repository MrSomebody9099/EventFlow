import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Initialize Whop SDK if it is present on the page (added by Whop environment)
declare global {
  interface Window { Whop?: { init?: () => void } }
}

if (typeof window !== 'undefined') {
  try {
    window.Whop?.init?.();
  } catch {
    // ignore if not available
  }
}

createRoot(document.getElementById("root")!).render(<App />);
