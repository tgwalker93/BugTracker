import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { BugListTableRow } from "../../components/BugListTableRow";
import { Redirect } from 'react-router-dom'
import { Input, Button, TextArea } from "../../components/Form";
import Cookies from 'universal-cookie';
import API from "../../utils/API";
import "./profile.css";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
// import "bootstrap/dist/css/bootstrap.min.css";

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            firstName:"",
            loggedIn: this.props.loggedIn,
            redirectTo: null,
            changePasswordFieldsActive: false,
            formErrors: { oldPassword: "", newPassword1and2:"" },
            oldPassword: "",
            newPassword1: "",
            newPassword2: "",
            oldPasswordValid: false,
            newPassword1and2Valid: false,
            showModal: false,
            currentModalTitle: "",
            userData: []
        };
    }

    componentDidMount() {
      
        console.log("Component mounted in Profile, below is MongoID");
        console.log(this.props.mongoID);
        
    }

    //This is used onBlur in order to trim the values. 
    formatInput = (event) => {
        const attribute = event.target.getAttribute('name')
        this.setState({ [attribute]: event.target.value.trim() })
    }

    //Standard method for constantly updating input, since UI is constantly refreshing
    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value });
    }

    errorClass(error) {
        return (error.length === 0 ? "" : "has-error");
    }

    validateFields() {
        let fieldValidationErrors = this.state.formErrors;
        let oldPasswordValid = this.state.oldPassword;
        let newPassword1and2Valid = this.state.newPassword1Valid;


        //Validating that old password is greater than 6 characters. We'll check the DB to see if this is accurate. Password is NEVER sent to client. 
        oldPasswordValid = this.state.oldPassword >= 6;
        fieldValidationErrors.oldPassword = oldPasswordValid ? "" : "Old password must be atleast 6 characters long.";


        //Validating between the new password field and "confirm password" field that they match and are greather than or equal to 6 characters
        newPassword1and2Valid = this.state.newPassword1 === this.state.newPassword2 && this.state.newPassword1.length >= 6;
        fieldValidationErrors.newPassword1and2Valid = "New password doesn't match or your password is less than 6 characters long.";

    

        this.setState({
            formErrors: fieldValidationErrors,
            oldPasswordValid: oldPasswordValid,
            newPassword1and2Valid: newPassword1and2Valid
        }, () => {
            this.attemptToSavePasswordToDB();
        });
    }


    
    handleChangePasswordButtonClick = event => {
        event.preventDefault();




        this.setState({
            showModal: true,
            currentModalTitle: "Change Password",
        });


        this.setState({
            changePasswordFieldsActive: true
        })
   

    }


    //************************THESE METHODS ARE CALLED FROM BUTTONS WITHIN THE MODAL*********************
    updateOrCreateBug = () => {
        if (this.state.isNewBug) {
            this.saveNewBugInDB();
        } else {
            //UPDATE THE BUG DATA LOCALLY BEFORE PUSHING TO DB
            this.state.bugData[this.state.currentBugIndex].bugTitle = this.state.bugTitleInModal;
            this.state.bugData[this.state.currentBugIndex].bugDescription = this.state.bugDescriptionInModal;
            this.setState({ selectedBug: this.state.bugData[this.state.currentBugIndex] });
            this.updateBugInDB();
        }
    }
    closeModal = () => {
        this.setState({ showModal: false });
    }
    //*********************** END OF MODAL BUTTON CLICK METHODS ****************************

    
    render() {
        return (
            <Container id="containerViewBugs" fluid="true">

                <Row id="mainRow">
                    <Col size="sm-12">
                        <div className="jumbotron jumbotron-fluid">
                            <Container id="container" fluid="true">
                                <h1 className="display-4 BugTrackerTitle">Welcome, {this.props.firstName}!</h1>
                            </Container>
                        </div>

                        <Link to="/bug-view" className="log" ><Button>View Bugs</Button></Link>
                        <Button onClick={this.handleChangePasswordButtonClick.bind(this)}>Change Password</Button>


                        

                        {/* This modal will pop up for changing password! */}
                        <Modal show={this.state.showModal} animation={false}>
                            <Modal.Header>
                                <Modal.Title>{this.state.currentModalTitle}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                {this.state.changePasswordFieldsActive ?
                                    <div>
                                        <p>Old Password</p>
                                        <Input onBlur={this.formatInput.bind(this)}
                                            isvalid={this.state.oldPasswordValid.toString()}
                                            fielderror={this.state.formErrors.oldPassword}
                                            formgroupclass={`form-group ${this.errorClass(this.state.formErrors.oldPassword)}`}
                                            value={this.state.oldPassword}
                                            id="oldPassword"
                                            onChange={this.handleChange.bind(this)}
                                            name="oldPassword"></Input>

                                        <p>New Password</p>
                                        <Input onBlur={this.formatInput.bind(this)}
                                            isvalid={this.state.newPassword1and2Valid.toString()}
                                            fielderror={this.state.formErrors.newPassword1}
                                            formgroupclass={`form-group ${this.errorClass(this.state.formErrors.newPassword1and2)}`}
                                            value={this.state.newPassword1}
                                            id="newPassword1" onChange={this.handleChange.bind(this)}
                                            name="newPassword1"></Input>

                                        <p>Confirm New Password</p>
                                        <Input onBlur={this.formatInput.bind(this)} isvalid={this.state.newPassword1and2Valid.toString()}
                                            fielderror={this.state.formErrors.newPassword2}
                                            formgroupclass={`form-group ${this.errorClass(this.state.formErrors.newPassword1and2)}`}
                                            value={this.state.newPassword2}
                                            id="newPassword2"
                                            onChange={this.handleChange.bind(this)}
                                            name="newPassword2"></Input>

                                    </div>
                                    :
                                    ""}

                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={this.closeModal}>
                                    Close
                                  </Button>
                                <Button variant="primary" onClick={this.updateOrCreateBug}>
                                    Save Changes
                              </Button>
                            </Modal.Footer>
                        </Modal>






                    </Col>
                </Row>

            </Container>
        );

    
}
}

// export default Profile;
export default withRouter(Profile);