import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import LandingPage from "./pages/landing-page";
import BugView from "./pages/bug-view";
import CreateBug from "./pages/create-bug";
import Profile from "./pages/profile";
import API from "./utils/API"

import "./App.css";

class App extends Component {

  constructor() {
    super()
    this.state = {
      loggedIn: false,
      user: null,
      password: null
    }
    this._login = this._login.bind(this)
  }
  componentDidMount() {
    API.user().then(response => {
      if (!!response.data.user) {
        console.log("Attempt to login on App.js from componentDidMount");
        console.log(response.data);
        this.setState({
          loggedIn: true,
          user: response.data.user,
          userId: response.data.user._id,
        });
        console.log("login passed!! User is not authenticated. (App.js - componentDidMount)");
      } else {
        console.log("Login failed!!! User is not authenticated. (App.js - componentDidMount)");
        this.setState({
          loggedIn: false,
          user: null
        })
      }
    })
  }

  _login(username, password) {
    console.log("I called _login from App.js");
    var userData = {
      username: username,
      password: password,
    }
    API
      .login(userData)
      .then(response => {
        console.log("attempt to login from app.js _login");
        console.log(response);
        if (response.status === 200) {
          console.log("ATTEMPTING TO CONSOLE LOG EMAIL IN _LOGIN IN App.js");
          //var data = JSON.parse(response.data);
          console.log(response);
          // update the state
          this.setState({
            loggedIn: true,
            username: response.data.username,
            password: response.data.password
          })
        }
      })
  }

    render() {

      return (
        <div className="App">
      <Router>
        <div>
          <Switch>
            <Route exact path="/landing-page" 
                  render={() =>
                    <LandingPage
                      _login={this._login}

                    />} />
                <Route exact path="/bug-view" component={BugView} />
                <Route exact path="/create-bug" component={CreateBug} />
                <Route exact path="/profile" render={() => <Profile loggedIn={this.state.loggedIn} user={this.state.username} />}/>

                <Route exact path="/" render={() => (
                  <Redirect to="/landing-page" />
                )} />

            {/* <Route exact path="/" render={() => (
              <Redirect to="/landing-page" render={() => <landingpage _login={this._login} /> }/>
            )} /> */}
                {/* <Route
                  exact
                  path="/landing-page"
                  render={() =>
                    <landingpage
                      _login={this._login}

                    />}
                /> */}
          </Switch>
        </div>
      </Router>
        </div>
      )       
    }
  }

export default App;
