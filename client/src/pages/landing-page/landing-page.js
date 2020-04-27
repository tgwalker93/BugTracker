import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { Input, FormBtn } from "../../components/Form";
import Cookies from 'universal-cookie';
import API from "../../utils/API";
import "./landing-page.css";
class LandingPage extends Component {
    constructor(props){
    super(props)
    this.state = {
        firstName: "",
        lastName: "",
        emailAddress: "",
        password: "",
        phoneNumber: "",
        guestCount: "",
        formErrors: {firstName: "", lastName: "", emailAddress:"", phoneNumber:"", guestCount:"", password:""},
        firstNameValid: false,
        lastNameValid: false,
        passwordValid: false,
        emailAddressValid: false,
        phoneNumberValid: false,
        guestCountValid: false,
        isLogin: true

    };
    }

    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value });
    } 

    validateFields() {
        let fieldValidationErrors = this.state.formErrors;
        let emailAddressValid = this.state.emailAddressValid;
        let firstNameValid = this.state.firstNameValid;
        let lastNameValid = this.state.lastNameValid;
        let phoneNumberValid = this.state.phoneNumberValid;
        let guestCountValid = this.state.guestCountValid;
        let passwordValid = this.state.passwordValid;

        //Validating email using Regex
        let matchArray = this.state.emailAddress.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        if(matchArray !== null) {
            emailAddressValid = true;
        }
        fieldValidationErrors.emailAddress = emailAddressValid ? "" : "Please provide a valid email";

        //Validating First Name by checking if there is anything there.
        firstNameValid = this.state.firstName.length >0;
        fieldValidationErrors.firstName = firstNameValid ? "": "Please provide your first name";

        //Validating Last Name by checking if there is anything there.
        lastNameValid = this.state.lastName.length > 0;
        fieldValidationErrors.lastName = lastNameValid ? "":"Please provide your last name";

        //Validating phone number by checking if there are 16 digits. (counting the special characters besides the digits.)
        phoneNumberValid = this.state.phoneNumber.length===16;
        fieldValidationErrors.phoneNumber = phoneNumberValid ? "":"Please provide a phone number";

        //validating password
        passwordValid = this.state.password.length === 2;
        fieldValidationErrors.password = passwordValid ? "" : "Please provide a password";

        //Validate guest count by checking if user made a selection.
        guestCountValid = true;
        if(this.state.guestCount === "" || this.state.guestCount==="Select"){
            guestCountValid = false;
        }
        fieldValidationErrors.guestCount = guestCountValid ? "": "Please provide guest count";

        this.setState({
            formErrors: fieldValidationErrors,
            emailAddressValid: emailAddressValid,
            firstNameValid: firstNameValid,
            lastNameValid: lastNameValid,
            phoneNumberValid: phoneNumberValid,
            guestCountValid: guestCountValid,
            passwordValid: passwordValid
        }, () => {
            this.setCookieAndChangePage();
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

    formatPhone(obj) {
        if(obj == null){
            return;
        }
        var numbers = obj.state.phoneNumber.replace(/\D/g, "").substring(0,10),
            char = { 0: "(", 3: ") ", 6: " - " };
        obj.state.phoneNumber = "";
        for (var i = 0; i < numbers.length; i++) { 
            obj.state.phoneNumber += (char[i] || "") + numbers[i];    
        }
    }

    handleFormSubmit = event => {
        event.preventDefault();    
        this.validateFields();
    };

    handleSaveUser = event => {
            event.preventDefault();
            this.saveUser();

   
    }

    createAccount = event => {
        event.preventDefault();
        this.setState({isLogin: false});

    };


    saveUser() {
        console.log("HELLO?!?!!?!");
        console.log(this.state.passwordValid + " passwordvalid?");
        // if (this.state.passwordValid && this.state.firstNameValid && this.state.lastNameValid) {

            console.log("we good");
            let userObj = {
                userId: null,
                username: this.state.username,
                password: this.state.password,
                email: this.state.emailAddress,
                user_email: this.state.email,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                user_address: this.state.address,
                user_city: this.state.city,
                user_state: this.state.state,
                user_zip: this.state.zip
            }
            API.saveUser(userObj)
                .then(response => {



                    if (!response.data.error) {
                        // userObj.userId = response.data.doc._id;
                        // this.props._login(this.state.username, this.state.password, userObj);
                        // this.setState({
                        //     redirectTo: '/profile'
                        // })
                        console.log("I WAS SUCCESSFUL FROM LANDING PAGE");
                    } else {
                        this.setState({ errorResponse: response })
                    }
                })

        // }
    }
    setCookieAndChangePage() {

        //This function will be called once all fields are validated. If any are not valid, the binary "valid" variable will be false.
        if (this.state.firstNameValid && this.state.lastNameValid && this.state.emailAddressValid && this.state.phoneNumberValid && this.state.guestCountValid) {

            const cookies = new Cookies();

            var userObj = {
                "firstName": this.state.firstName.charAt(0).toUpperCase() + this.state.firstName.slice(1),
                "lastName": this.state.lastName.charAt(0).toUpperCase() + this.state.lastName.slice(1),
                "emailAddress": this.state.emailAddress,
                "phoneNumber": this.state.phoneNumber,
                "guestCount": this.state.guestCount
            }

            cookies.set("demo-requested", userObj, { path: "/" });
            this.props.history.push("/thank-you");
        }
    }

    render() {
        return (
            <Container id="container" fluid="true">

                <Row id="mainRow">

                    <hr id="hline"></hr>
                    <Col id="formCol" size="sm-6">
                        <h1>BugSlayer</h1>
                        {/* <h1 id="formHeader">Login</h1> */}

                        {this.state.isLogin ?

                            <h1 id="formHeader">Login</h1>
                            :
                            
                            <h1 id="formHeader">Create Account</h1>

                        }
                        <form>

                        {this.state.isLogin ? 

                                ""
                        :
                        
                               <div>
                                    <p>First Name</p>
                                    <Input onBlur={this.formatInput.bind(this)} isvalid={this.state.firstNameValid.toString()} fielderror={this.state.formErrors.firstName} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.firstName)}`} value={this.state.firstName} id="firstName" onChange={this.handleChange.bind(this)} name="firstName"></Input>
                            
                            
                                    <p>Last Name</p>
                                    <Input onBlur={this.formatInput.bind(this)} isvalid={this.state.lastNameValid.toString()} fielderror={this.state.formErrors.lastName} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.lastName)}`} value={this.state.lastName} id="lastName" onChange={this.handleChange.bind(this)} name="lastName"></Input>
                            
                                </div>
   
                 }
                    

                    
                        <p>Email Address</p>
                        <Input onBlur={this.formatInput.bind(this)}isvalid={this.state.emailAddressValid.toString()} fielderror={this.state.formErrors.emailAddress} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.emailAddress)}`} value={this.state.emailAddress} id="emailAddress" onChange={this.handleChange.bind(this)} name="emailAddress"></Input>

                        <p>Password</p>
                            <Input onBlur={this.formatInput.bind(this)} isvalid={this.state.passwordValid.toString()} fielderror={this.state.formErrors.password} formgroupclass={`form-group ${this.errorClass(this.state.formErrors.password)}`} value={this.state.password} id="password" onChange={this.handleChange.bind(this)} name="password"></Input>

                        <FormBtn onClick={this.handleFormSubmit.bind(this)}> Login </FormBtn>
                        <FormBtn onClick={this.createAccount.bind(this)}> Create Account </FormBtn>
                        <FormBtn onClick={this.handleSaveUser.bind(this)}> Submit </FormBtn>
                        </form>
                    </Col>
                </Row>

            </Container>
        );
    }
}

export default LandingPage;
