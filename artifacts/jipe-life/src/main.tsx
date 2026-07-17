import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import {
  setAuthTokenGetter,
  setBaseUrl,
} from "@workspace/api-client-react";

import { getToken } from "@/lib/api";

setAuthTokenGetter(() => getToken());

setBaseUrl("http://200.97.172.74/api");

createRoot(document.getElementById("root")!).render(
  <App />
);