import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App.jsx";
import store from "./app/store";
import "./index.css";
import { registerLogoutCallback } from "./api/client";
import { logout } from "./features/auth/authSlice";

registerLogoutCallback(() => {
  store.dispatch(logout());
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
