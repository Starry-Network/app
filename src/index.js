import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
// import { ColorModeScript } from "@chakra-ui/react"


import { ApiProvider } from "./utils/api";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

const colors = {
  purple: {
    550: "#6E1FFF"
  },
  brand: {
    100: "#f7fafc",
    // ...
    900: "#1a202c",
  },
}

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
}



const theme = extendTheme({ colors, config })


ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ApiProvider>
        {/* <ColorModeScript initialColorMode={theme.config.initialColorMode} /> */}
        <App />
      </ApiProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
