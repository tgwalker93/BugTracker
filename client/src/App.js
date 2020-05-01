import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import landingpage from "./pages/landing-page";
import bugview from "./pages/bug-view";
import createbug from "./pages/create-bug";
import "./App.css";

const App = () => 
  <Router>
  <div>
    <Switch>
      <Route exact path="/landing-page" component={landingpage} />
      <Route exact path="/bug-view" component={bugview} />
      <Route exact path="/create-bug" component={createbug} />
      <Route exact path="/" render={() => (
        <Redirect to="/landing-page" />
      )} />
      <Route component={landingpage} />
    </Switch>
  </div>
  </Router>;

export default App;
