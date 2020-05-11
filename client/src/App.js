import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import LandingPage from "./pages/landing-page";
import BugView from "./pages/bug-view";
import CreateBug from "./pages/create-bug";
import Profile from "./pages/profile";
import API from "./utils/API";
import { withRouter } from 'react-router';

import "./App.css";

class App extends Component {

  constructor() {
    super()
    this.state = {
      loggedIn: false,
      user: null,
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
          // redirectTo: "/landing-page",
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
          console.log(response.data);
            if(response.data.loggedInSuccess){

            
          //var data = JSON.parse(response.data);
         // console.log(response);
         console.log("_login from App.js is SUCCESSFUL, below is the response data");
         console.log(response.data);
          // update the state
          this.setState({
            loggedIn: true,
            username: response.data.username,
            mongoID: response.data.mongoID,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            password: response.data.password,
            redirectTo: "/profile"
          })
          //this.props.history.push("/profile");


        }else {
            console.log("logged in FAILED!!!");
            console.log(response);
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
        console.log("redirectTO has been called!!!");
        console.log(this.state.redirectTo);
        return(

            <div className="App">
              <div>

        <Redirect exact to={{ pathname: this.state.redirectTo }} render={() =>
          <LandingPage
            _login={this._login}
            serverErrorMessage={this.state.serverErrorMessage}
          />}/> 

          
          <Route exact path="/landing-page"
            render={() =>
              <LandingPage
                _login={this._login}
                serverErrorMessage={this.state.serverErrorMessage}
              />} />
          <Route exact path="/bug-view" component={BugView} />
          <Route exact path="/create-bug" component={CreateBug} />
              <Route exact path="/profile" render={() => <Profile loggedIn={this.state.loggedIn} username={this.state.username} mongoID={this.state.mongoID} firstName={this.state.firstName}/>} />

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
