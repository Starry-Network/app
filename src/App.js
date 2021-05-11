import { HashRouter as Router, Switch, Route } from "react-router-dom";

import NavBar from "./components/navbar";
import Layout from "./components/layout";
import Home from "./pages/Home";
import CreateNFT from "./pages/CreateNFT";
import NFTDetail from "./pages/NFTDetail";
import GraphNFT from "./pages/GraphNFT";
import CreateSplitNFT from "./pages/CreateSplitNFT";
import SplitNFT from "./pages/SplitNFT";
import DAOs from "./pages/DAOs";
import DAODetail from "./pages/DAODetail";
import SummonDAO from "./pages/SummonDAO";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <NavBar />
      <Layout>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/createNFT">
            <CreateNFT />
          </Route>
          <Route exact path="/NFTDetail/:nftId/:orderId">
            <NFTDetail />
          </Route>
          <Route exact path="/graphNFT">
            <GraphNFT />
          </Route>
          <Route exact path="/createSplitNFT">
            <CreateSplitNFT />
          </Route>
          <Route exact path="/splitNFT">
            <SplitNFT />
          </Route>
          <Route exact path="/DAOs">
            <DAOs />
          </Route>
          <Route exact path="/DAODetail/:daoId">
            <DAODetail />
          </Route>
          <Route exact path="/profile">
            <Profile />
          </Route>
          <Route exact path="/summonDAO">
            <SummonDAO />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}

export default App;
