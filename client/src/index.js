import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from 'react-router-dom'
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
ReactDOM.render(
 <BrowserRouter>   
   <Switch>
      <Route component={App} />
   </Switch>
 </BrowserRouter>

  , document.getElementById("root"));

