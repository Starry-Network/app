import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
// import { ColorModeScript } from "@chakra-ui/react"


import { ApiProvider } from "./hooks/api";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  QueryClient,
  QueryClientProvider,
} from "react-query";

const colors = {
  purple: {
    550: "#6E1FFF"
  },
  black: {
    500: "#171923"
  }
}

const config = {
  // initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme({ colors, config, })

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ApiProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ApiProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
