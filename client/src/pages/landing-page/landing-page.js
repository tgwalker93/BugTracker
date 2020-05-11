import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { Input, Button } from "../../components/Form";
import Cookies from 'universal-cookie';
import API from "../../utils/API";
import { Redirect } from 'react-router-dom'
import { withRouter } from 'react-router';

import "./landing-page.css";
class LandingPage extends Component {
    constructor(props){
    super(props)
    this.state = {
        firstName: "",
        lastName: "",
        emailAddress: "",
        password: "",
        formErrors: {firstName: "", lastName: "", emailAddress:"", password:""},
          redirectTo: null,
        firstNameValid: false,
        lastNameValid: false,
        passwordValid: false,
        emailAddressValid: false,
        loginOrCreateAccountButtonClicked: false,
        loginButtonClicked: true,
        forgotPasswordButtonClicked: false,
        successMessage: "",
        serverErrorMessage: ""
    };
    }

    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value });
    } 


    componentWillReceiveProps(nextProps) {
        this.setState({ serverErrorMessage: this.props.serverErrorMessage });
    }
    validateFields() {
        let fieldValidationErrors = this.state.formErrors;
        let emailAddressValid = this.state.emailAddressValid;
        let firstNameValid = this.state.firstNameValid;
        let lastNameValid = this.state.lastNameValid;
        let passwordValid = this.state.passwordValid;

        //Validating email using Regex
        let regex = /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i;
         emailAddressValid = new RegExp(regex).test(this.state.emailAddress);
        
        fieldValidationErrors.emailAddress = emailAddressValid ? "" : "Please provide a valid email";

        //Validating First Name by checking if there is anything there.
        firstNameValid = this.state.firstName.length > 0;
        fieldValidationErrors.firstName = firstNameValid ? "": "Please provide your first name";

        //Validating Last Name by checking if there is anything there.
        lastNameValid = this.state.lastName.length > 0;
        fieldValidationErrors.lastName = lastNameValid ? "":"Please provide your last name";


        if (!this.state.loginButtonClicked)
        {
        //validating password
        passwordValid = this.state.password.length >= 6;
        fieldValidationErrors.password = passwordValid ? "" : "Please provide a password of atleast 8 characters";
        }


        this.setState({
            formErrors: fieldValidationErrors,
            emailAddressValid: emailAddressValid,
            firstNameValid: firstNameValid,
            lastNameValid: lastNameValid,
            passwordValid: passwordValid
        }, () => {
            console.log("validate fields");
            console.log(this.state.emailAddress);
            console.log(this.state.emailAddressValid);
            if(this.state.loginButtonClicked && emailAddressValid){
                //If the login button is clicked then we want submit LOGIN request, which is different than Create Account request
                this.props._login(this.state.emailAddress, this.state.password);

            }else if(this.state.loginOrCreateAccountButtonClicked && !this.state.loginButtonClicked && emailAddressValid && firstNameValid && lastNameValid && passwordValid){
                //If Create Account button was clicked, then we want to post the user to the database.
                this.saveUser();
            }else if(this.state.forgotPasswordButtonClicked){
                //If forgot password button was clicked.
                this.sendForgotPasswordEmail();
            }
        });    
    }

    //Here we check if the field has an error. If it does, it will add the "has-error" class to the field.
    //"has-error" is a default bootstrap class that will nicely color the outline of the field red to indicate an error for the user. 
    errorClass(error) {
        return (error.length === 0 ? "" : "has-error");
    }

    //This is used onBlur in order to trim the values. 
    formatInput = (event) => {
        const attribute = event.target.getAttribute('name')
        this.setState({ [attribute]: event.target.value.trim() })
    }

    //Below are all the button click methods - Just to set it up so before I actually submit data to DB ----------------------------------
    handleFormSubmit = event => {
        event.preventDefault();
        console.log("i'm in login submit form");
        this.setState({
            emailAddressValid: true, firstNameValid: true, lastNameValid: true, passwordValid: true,
            formErrors: { firstName: "", lastName: "", emailAddress: "", password: "" }
        }, () => {
                this.validateFields();
        });

    };

    handleLoginButtonClick = event => {
        event.preventDefault();
        this.setState({ loginOrCreateAccountButtonClicked: true, loginButtonClicked: true, forgotPasswordButtonClicked: false,
                        emailAddressValid: true, firstNameValid: true, lastNameValid: true, passwordValid: true,
            formErrors: { firstName: "", lastName: "", emailAddress: "", password: "", serverErrorMessage: "" }
        })
        
    }
    handleCreateAccountButtonClick = event => {
        event.preventDefault();
        this.setState({ loginOrCreateAccountButtonClicked: true, loginButtonClicked: false, forgotPasswordButtonClicked: false,
                        emailAddressValid: true, firstNameValid: true, lastNameValid: true, passwordValid: true,
            formErrors: { firstName: "", lastName: "", emailAddress: "", password: "", serverErrorMessage: "" }        
        })
    }

    handleForgotPasswordButtonClick = event => {
        event.preventDefault();
        this.setState({ loginOrCreateAccountButtonClicked: false, loginButtonClicked: false, forgotPasswordButtonClicked: true,
                        emailAddressValid: true, firstNameValid: true, lastNameValid: true, passwordValid: true,
                        formErrors: { firstName: "", lastName: "", emailAddress: "", password: "", serverErrorMessage:"" }       
        })
    }
    // END of BUTTON CLICK METHODS

    sendForgotPasswordEmail() {
        let userObj = {
            email: this.state.emailAddress
        }

        console.log("I'm in SEND FORGOT PASSWROD EMAIL METHOD ON landing-page js");

        API.sendForgotPasswordEmail(userObj)
            .then(response => {



                if (!response.data.error) {
                    console.log("send forgot password was successful, i'm back at landing-page.js, in API.sendForgotPasswordEmail");
                    console.log(response);
                    this.setState({ serverErrorMessage: "An email has been sent."});
                } else {
                    console.log("error found!!!");
                    console.log(response);
                    this.setState({ serverErrorMessage: response.data.error })
                }
            })
    }

    saveUser() {
        console.log(this.state.passwordValid + " passwordvalid?");
        // if (this.state.passwordValid && this.state.firstNameValid && this.state.lastNameValid) {

            console.log("Called saveUser() from LandingPage  .... BELOW IS THE STATE");
            console.log(this.state);
            let userObj = {
                userId: null,
                username: this.state.emailAddress,
                password: this.state.password,
                email: this.state.emailAddress,
                user_email: this.state.email,
                firstName: this.state.firstName,
                lastName: this.state.lastName
            }
            API.saveUser(userObj)
                .then(response => {



                    if (!response.data.error) {
                        //userObj.userId = response.data.doc._id;


                        //Now that the user account is created, let's automatically login the user in
                         this.props._login(this.state.emailAddress, this.state.password, userObj);

        
                    } else {
                        //Usually this happens when an email address was already used.
                        this.setState({ serverErrorMessage: response.data.error })
                    }
                })

    }

    componentDidMount() {
        console.log("component has mounted");
        console.log(this);
    }
    componentDidUpdate() {

    }
    render() {

        if (this.props.redirectTo) {
            console.log("THIS . PROPS. REDIRECT EXISTS IN LANDING PAGE!!!");
            console.log(this.props.redirectTo);
            return <Redirect to={{ pathname: this.props.redirectTo }} />
        } else {
        return (
            <Container id="container" fluid="true">

                <Row id="mainRow">

                    <hr id="hline"></hr>
                    <Col id="formCol" size="sm-6">
                        <h1 id="loginBugSlayerTitle">BugSlayer</h1>
                        {this.state.loginOrCreateAccountButtonClicked ?
                            <div>
                                {this.state.loginButtonClicked ?
                                    <h3 id="formHeader">Login</h3>
                                    :
                                    <h3 id="formHeader">Create Account</h3>

                                }
                                <form>
                                    

                                    {this.state.loginButtonClicked ?

                                        ""
                                        :

                                        <div>
                                           
                                            <Input label="First Name" onBlur={this.formatInput.bind(this)} isvalid={this.state.firstNameValid.toString()} fielderror={this.state.formErrors.firstName} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.firstName)}`} value={this.state.firstName} id="firstName" onChange={this.handleChange.bind(this)} name="firstName"></Input>


                                    
                                            <Input label="Last Name" onBlur={this.formatInput.bind(this)} isvalid={this.state.lastNameValid.toString()} fielderror={this.state.formErrors.lastName} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.lastName)}`} value={this.state.lastName} id="lastName" onChange={this.handleChange.bind(this)} name="lastName"></Input>

                                        </div>

                                    }

                               
                                    <Input label="Email Address" onBlur={this.formatInput.bind(this)} isvalid={this.state.emailAddressValid.toString()} fielderror={this.state.formErrors.emailAddress} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.emailAddress)}`} value={this.state.emailAddress} id="emailAddress" onChange={this.handleChange.bind(this)} name="emailAddress"></Input>

                              
                                    <Input label="Password" type="password" onBlur={this.formatInput.bind(this)} isvalid={this.state.passwordValid.toString()} fielderror={this.state.formErrors.password} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.password)}`} value={this.state.password} id="password" onChange={this.handleChange.bind(this)} name="password"></Input>

                                    <Button onClick={this.handleFormSubmit.bind(this)}> Submit </Button>

                                    {this.state.loginButtonClicked ?
                                        <div>
                                            <h3 id="formFooterLink" className="formFooterLink" 
                                            onClick={this.handleCreateAccountButtonClick.bind(this)}>Create Account instead?</h3>
                                            <h3 id="formFooterLink" className="formFooterLink" onClick={this.handleForgotPasswordButtonClick.bind(this)}>Forgot Password?</h3>
                                        </div>
                                        :
                                        <div>
                                        <h3 id="formFooterLink" onClick={this.handleLoginButtonClick.bind(this)}>Login instead?</h3>
                                        <h3 id="formFooterLink" onClick={this.handleForgotPasswordButtonClick.bind(this)}>Forgot Password?</h3>
                                        </div>

                                    }
                                </form>
                                <span className="help-block serverErrorMessage">{this.state.serverErrorMessage}</span>
                                <br />
                            </div>
                            : 

                            <div>

                                {
                                    this.state.forgotPasswordButtonClicked ?
                                        <div>

                                            <p><strong>Please enter your email address. If correct, we will send you an email!</strong></p>
                                            <p>Email Address</p>
                                            <Input onBlur={this.formatInput.bind(this)} isvalid={this.state.emailAddressValid.toString()} fielderror={this.state.formErrors.emailAddress} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.emailAddress)}`} value={this.state.emailAddress} id="emailAddress" onChange={this.handleChange.bind(this)} name="emailAddress"></Input>
                                            <Button onClick={this.handleFormSubmit.bind(this)}> Submit </Button>
                                            
                                            <h3 id="formFooterLink" className="formFooterLink" onClick={this.handleLoginButtonClick.bind(this)}>Login instead?</h3>
                                            <h3 id="formFooterLink" className="formFooterLink" onClick={this.handleCreateAccountButtonClick.bind(this)}>Create Account instead?</h3>
                                        </div>
                                            :                                                                                
                                             <div>                                
                                            <Button onClick={this.handleLoginButtonClick.bind(this)}> Login </Button>
                                            <Button onClick={this.handleCreateAccountButtonClick.bind(this)}> Create Account </Button>
                                            <Button onClick={this.handleForgotPasswordButtonClick.bind(this)}>Forgot Password?</Button>      
                                            </div>


                                }
                                <span className="help-block serverErrorMessage">{this.state.serverErrorMessage}</span>

                            </div>
                              
                        }
                        
                    </Col>
                </Row>

            </Container>
        );

                }
    
            }
}

// export default LandingPage;
export default withRouter(LandingPage)
