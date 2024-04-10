import React from "react";
import ReactDOM from "react-dom";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.render(
  <BrowserRouter>
    <React.StrictMode>
      <GoogleOAuthProvider clientId="904507807250-e41kfkes0qlhrur0j7k2gms6cvhdiibu.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  </BrowserRouter>,
  document.getElementById("root")
);
