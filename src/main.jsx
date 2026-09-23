import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")).render(
<BrowserRouter
  basename="/grp-03-39"
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
);