import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ChanContextWrapper } from "./context/chan.context";
import { AuthProviderWrapper } from "./context/auth.context";


import { AuthProviderWrapper } from "./context/auth.context";
import { SocketProviderWrapper } from "./context/socket.context";
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProviderWrapper>
        <SocketProviderWrapper>
          <ChanContextWrapper>
          <App />
          </ChanContextWrapper>
        </SocketProviderWrapper>
      </AuthProviderWrapper>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
