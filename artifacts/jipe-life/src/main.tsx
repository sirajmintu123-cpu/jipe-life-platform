import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import {
  setAuthTokenGetter,
  setBaseUrl,
} from "@workspace/api-client-react";

import { getToken } from "@/lib/api";

setAuthTokenGetter(() => getToken());

setBaseUrl("https://jipe-life-api.onrender.com");

createRoot(document.getElementById("root")!).render(
  <App />
);