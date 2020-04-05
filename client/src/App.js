import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import landingpage from "./pages/landing-page";
import thankyou from "./pages/thank-you";
import "./App.css";

const App = () => 
  <Router>
  <div>
    <Switch>
      <Route exact path="/landing-page" component={landingpage} />
      <Route exact path="/thank-you" component={thankyou} />
      <Route exact path="/" render={() => (
        <Redirect to="/landing-page" />
      )} />
      <Route component={landingpage} />
    </Switch>
  </div>
  </Router>;

export default App;
