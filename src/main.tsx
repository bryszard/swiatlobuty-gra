import React from "react";
import { createRoot } from "react-dom/client";
import "./font";
import { App } from "./App";
createRoot(document.getElementById("root")!).render(<App />);
import { audio } from "./audio"; (window as unknown as { __audio: unknown }).__audio = audio;
