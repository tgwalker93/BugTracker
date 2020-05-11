import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import LandingPage from "./pages/landing-page";
import BugView from "./pages/bug-view";
import Profile from "./pages/profile";
import API from "./utils/API";

import "./App.css";

class App extends Component {

  constructor() {
    super()
    this.state = {
      loggedIn: false,
      user: null,
      userId: null,
      firstName: null,
      lastName: null,
      mongoID: null,
      password: null,
      redirectTo: null,
      serverErrorMessage: ""
    }
    this._login = this._login.bind(this)
  }
  componentDidMount() {
    API.user().then(response => {
      if (!!response.data.user) {
        this.setState({
          loggedIn: true,
          userId: response.data.user._id,
        });
      } else {
        this.setState({
          loggedIn: false,
          // redirectTo: "/landing-page",
          user: null
        })
      }
    })
  }

  _login(username, password) {
    var userData = {
      username: username,
      password: password,
    }
    API
      .login(userData)
      .then(response => {
        if (response.status === 200) {
          if (response.data.loggedInSuccess) {
            // update the state
            this.setState({
              loggedIn: true,
              // user: response.data.user,
              // userId: response.data.user._id,
              username: response.data.username,
              mongoID: response.data.mongoID,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              password: response.data.password,
              redirectTo: "/profile"
            })
            //this.props.history.push("/profile");


          } else {
            this.setState({
              loggedIn: false,
              serverErrorMessage: response.data.error
            }, () => {
              this.forceUpdate();
            })

          }
        }
      })
  }

  render() {
    //IF USER IS AUTHENTICATED RENDER THIS
    if (this.state.loggedIn) {
      return (

        <div className="App">
          <div>

            <Redirect exact to={{ pathname: this.state.redirectTo }} render={() =>
              <LandingPage
                _login={this._login}
                serverErrorMessage={this.state.serverErrorMessage}
              />} />


            <Route exact path="/landing-page"
              render={() =>
                <LandingPage
                  _login={this._login}
                  serverErrorMessage={this.state.serverErrorMessage}
                />} />
            <Route exact path="/bug-view" component={BugView} />
            <Route exact path="/profile" render={() => <Profile loggedIn={this.state.loggedIn} username={this.state.username} mongoID={this.state.mongoID} firstName={this.state.firstName} lastName={this.state.lastName} />} />

            <Route exact path="/" render={() => (
              <Redirect to="/landing-page" />
            )} />

          </div>
        </div>

      )
    }


    //IF USER IS NOT AUTHENTICATED, RENDER JUST THE LANDING PAGE
    return (
      <div className="App">
        <div>
          <Route exact path="/landing-page"
            render={() =>
              <LandingPage
                _login={this._login}
                serverErrorMessage={this.state.serverErrorMessage}
              />} />

          <Route exact path="/" render={() => (
            <Redirect to="/landing-page" />
          )} />

          <Redirect from="*" to="/landing-page" />

        </div>
      </div>
    )
  }

}
export default App;
// export default App;