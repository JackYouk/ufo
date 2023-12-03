import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Canvas } from "@react-three/fiber";
import "./index.css";
import { Loader } from "@react-three/drei";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
  <Canvas shadows>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </Canvas>
  <Loader />
  </>
);
