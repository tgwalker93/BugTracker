import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { Input, Button } from "../../components/Form";
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
            setPasswordFieldsActiveInModal: false,
            setCreateOrganizationFieldsActiveInModal: false,
            setJoinOrganizationFieldsActiveInModal: false,
            setEditOrganizationFieldsActiveInModal: false,
            setConfirmationBoxActiveInModal: false,
            formErrors: { oldPassword: "", newPassword1and2:"", organizationName:"", organizationID:"" },
            oldPassword: "",
            newPassword1: "",
            newPassword2: "",
            organizationNameInModal: "",
            organizationIDInModal: "",
            organizationMongoIDInModal: "",
            oldPasswordValid: true,
            newPassword1And2Valid: false,
            organizationNameValid: false,
            organizationIDValid: false,
            showModal: false,
            formSubmitButtonText: "Submit",
            successMessage: "",
            serverErrorMessage:"",
            currentModalTitle: "",
            userFirstName: "",
            userLastName: "",
            userData: [],
            organizations: []
        };
    }

    componentDidMount() {
        this.setState({ userFirstName: this.props.firstName, userLastName: this.props.lastName});
        this.getOrganizationsOfUserInDB();
        
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
        let newPassword1And2Valid = this.state.newPassword1And2Valid;
        let organizationNameValid =  this.state.organizationNameValid;
        let organizationIDValid = this.state.organizationIDValid;

        //Validating between the new password field and "confirm password" field that they match and are greather than or equal to 6 characters
        newPassword1And2Valid = (this.state.newPassword1 === this.state.newPassword2) && this.state.newPassword1.length >= 6;
        fieldValidationErrors.newPassword1and2 = "New password doesn't match or your password is less than 8 characters long.";

        //Validating that organization is greater than 3 characters
        organizationNameValid = this.state.organizationNameInModal.length >= 3;
        fieldValidationErrors.organizationName = "Organization Name must have atleast three characters.";

        //Validating that organization ID is greater than 6 characters
        organizationIDValid = this.state.organizationIDInModal.length >= 6;
        fieldValidationErrors.organizationID = "Organization ID must have atleast six characters.";

        this.setState({
            formErrors: fieldValidationErrors,
            newPassword1And2Valid: newPassword1And2Valid,
            organizationIDValid: organizationIDValid,
            organizationNameValid: organizationNameValid
        }, () => {
                if (this.state.setJoinOrganizationFieldsActiveInModal) {
                    //for JOIN organization
                    if (organizationIDValid){
                     this.attachUserToOrganizationInDB();
                    }
                } else if (this.state.setCreateOrganizationFieldsActiveInModal) {
                    //For CREATE organization
                    if(organizationNameValid && organizationIDValid){
                        this.saveOrganizationInDB();
                    }
                } else if (this.state.setEditOrganizationFieldsActiveInModal) {
                    //For UPDATE Organization
                    if(organizationNameValid && organizationIDValid){

                        this.updateOrganizationInDB();
                    }
                } else if (this.state.setPasswordFieldsActiveInModal) {
                    //For UPDATE password
                    if (newPassword1And2Valid){     
                        this.updatePasswordInDB();
                    }
                }
        });
    }

    
    handleChangePasswordButtonClick = event => {
        this.setState({
            showModal: true,
            currentModalTitle: "Change Password",
            setPasswordFieldsActiveInModal: true
        });


    }


    //************************THESE METHODS ARE CALLED FROM BUTTONS WITHIN THE MODAL*********************
    updatePasswordInDB = () => {

        let userObj = {
            password: this.state.oldPassword,
            newPassword: this.state.newPassword1,
            username: this.props.username,
            mongoID: this.props.mongoID
        }
        API.updateUserInDB(userObj)
            .then(response => {

                if (!response.data.error) {
                    this.setState({ successMessage: "Successfully updated password."})
                    this.closeModal();

                } else {
                    this.setState({ serverErrorMessage: response.data.error, formErrors: { oldPassword: "", newPassword1and2: "", organizationName: "", organizationID: "", serverErrorMessage: "" }})
                }
            })
        
    }
    closeModal = () => {
        //Reset all the fields so they don't show up again when you try to open the modal again.
        this.setState({ showModal: false, organizationIDValid: true,
        organizationNameValid: true, oldPasswordValid: true, newPassword1Valid: true, newPassword2Valid: true,
            organizationNameInModal: "", organizationIDInModal: "", oldPassword: "", newPassword: "", newPassword2: "", serverErrorMessage:"",
            formErrors: { oldPassword: "", newPassword1and2: "", organizationName: "", organizationID: "", serverErrorMessage: "", formSubmitButtonText: "Submit" } });
    }
    //*********************** END OF MODAL BUTTON CLICK METHODS ****************************

    //*************************METHODS BELOW RELATED TO ORGANIZATION BUTTON CLICKS ******************/
    handleEditOrganizationButtonClick(organizationClickedOn) {
        //event.preventDefault();

        this.setState({
            showModal: true,
            currentModalTitle: "Edit Organization",
            setCreateOrganizationFieldsActiveInModal: false,
            setEditOrganizationFieldsActiveInModal: true,
            setJoinOrganizationFieldsActiveInModal: false,
            setPasswordFieldsActiveInModal: false,
            setConfirmationBoxActiveInModal: false,
            successMessage: "",
            organizationMongoIDInModal: organizationClickedOn._id,
            organizationNameInModal: organizationClickedOn.name,
            organizationIDInModal: organizationClickedOn.organizationID
        });
    }

    handleCreateOrganizationButtonClick = event => {
        this.setState({
            showModal: true,
            currentModalTitle: "Create Organization",
            setPasswordFieldsActiveInModal: false,
            setCreateOrganizationFieldsActiveInModal: true,
            setJoinOrganizationFieldsActiveInModal: false,
            setConfirmationBoxActiveInModal: false,
            successMessage: "",
            organizationIDInModal: "",
            organizationNameInModal: ""
        });

    }

    handleJoinOrganizationButtonClick = event => {
        this.setState({
            showModal: true,
            currentModalTitle: "Join Organization",
            setPasswordFieldsActiveInModal: false,
            setCreateOrganizationFieldsActiveInModal: false,
            setConfirmationBoxActiveInModal: false,
            successMessage: "",
            setJoinOrganizationFieldsActiveInModal: true
        })

    }
    handleDeleteOrLeaveButtonClick(organization) {
        this.setState({ setConfirmationBoxActiveInModal: true, showModal: true, currentOrganization: organization,
            currentModalTitle: "",
            setPasswordFieldsActiveInModal: false,
            setCreateOrganizationFieldsActiveInModal: false,
            setJoinOrganizationFieldsActiveInModal: false,
            formSubmitButtonText: "Confirm",
            successMessage: "",
            organizationIDInModal: "",
            organizationNameInModal: ""    
        });
    }

    //*** METHODS BELOW RELATED TO DB WITH ORGANIZATIONS */ */
    saveOrganizationInDB() {
        let userObj = {
            password: this.state.oldPassword,
            newPassword: this.state.newPassword1,
            username: this.props.username,
            mongoID: this.props.mongoID,
            organizationName: this.state.organizationNameInModal,
            organizationID: this.state.organizationIDInModal,
            userFirstName: this.props.firstName,
            userLastName: this.props.lastName
        }

        API.saveOrganizationInDB(userObj)
            .then(response => {

                if (!response.data.error) {
                    this.closeModal();
                    this.getOrganizationsOfUserInDB();
                    this.forceUpdate();

                } else {
                    //Now we set the error message in the modal.
                    this.setState({serverErrorMessage: response.data.error})
                }
            })
            .catch(err => console.log(err));

    }

    getOrganizationsOfUserInDB() {
        let userObj = {
            password: this.state.oldPassword,
            newPassword: this.state.newPassword1,
            username: this.props.username,
            mongoID: this.props.mongoID
        }

        API.getOrganizationsOfUserInDB(userObj)
            .then(response => {

                if (!response.data.error) {
                    //If we find no error, then we successful got the user's list of organizations. Update state with organizations.

                    this.setState({
                        organizations: response.data.organizations,
                    })

                }
            })
            .catch(err => console.log(err));
    }

    attachUserToOrganizationInDB() {
        let userObj = {
            password: this.state.oldPassword,
            newPassword: this.state.newPassword1,
            username: this.props.username,
            mongoID: this.props.mongoID,
            organizationID: this.state.organizationIDInModal,
            userFirstName: this.props.firstName,
            userLastName: this.props.lastName
        }
        API.attachUserToOrganizationInDB(userObj)
            .then(response => {

                if (!response.data.error) {
                    //If we find no error, then we successful got the user's list of organizations. Update state with organizations.
                    this.setState({
                        organizations: response.data.organizations,
                        successMessage: "You successfully joined the organization!"
                    })
                    this.closeModal();
                    this.getOrganizationsOfUserInDB();
                    this.forceUpdate();

                } else {
                    //Now we set the error message in the modal.
                    this.setState({ serverErrorMessage: response.data.error });
                }
            })
            .catch(err => console.log(err));
    }

    handleDeleteOrganizationInDB(organizationClickedOn) {
        var isUserOrganizationOwner = false;
        if (this.props.mongoID === organizationClickedOn.userWhoCreatedOrgMongoID){
            isUserOrganizationOwner = true;
        }
        var organizationObj = {
            organizationMongoID: organizationClickedOn._id,
            userMongoID: this.props.mongoID,
            organizationData: organizationClickedOn,
            isUserOrganizationOwner: isUserOrganizationOwner,
            userFirstName: this.state.userFirstName,
            userLastName: this.state.userLastName
        }
        API.deleteOrganizationInDB(organizationObj)
            .then(res => {
                this.setState({currentOrganization: ""});
                this.getOrganizationsOfUserInDB();
                this.forceUpdate();
            })
            .catch(err => console.log(err));
    }

    updateOrganizationInDB() {
        let userObj = {
            password: this.state.oldPassword,
            newPassword: this.state.newPassword1,
            username: this.props.username,
            mongoID: this.props.mongoID,
            organizationMongoID: this.state.organizationMongoIDInModal,
            organizationName: this.state.organizationNameInModal,
            organizationID: this.state.organizationIDInModal,
            userFirstName: this.props.firstName,
            userLastName: this.props.lastName
        }

        API.updateOrganizationInDB(userObj)
            .then(response => {
                //If not error from server
                if (!response.data.error) {
                    this.closeModal();
                    this.getOrganizationsOfUserInDB();
                    this.forceUpdate();

                }
            })
            .catch(err => console.log(err));
    }

    handleSubmitButtonInModalClick = () => {
        if(this.state.setConfirmationBoxActiveInModal){
            //In this case we are confirming to delete or leave an organization.
            this.setState({setConfirmationBoxActiveInModal: false, showModal: false}, () => {
                    this.handleDeleteOrganizationInDB(this.state.currentOrganization);
            }
            )
        }else {
            this.validateFields();
        }
    }

    handleLogoutButtonClick = () => {

    }
    
    
    render() {
        return (
            <Container id="containerViewBugs" fluid="true">

                <Link to={{ pathname: "/landing-page", state: { userFirstName: this.state.userFirstName, userLastName: this.state.userLastName } }} className="logoutButton"><Button id="logoutButton" onClick={this.handleLogoutButtonClick.bind(this)}>Logout</Button> </Link>
                <Row id="mainRow">
                    <Col size="sm-12">
                        <div className="jumbotron jumbotron-fluid">
                            <Container id="container" fluid="true">
                                <h1 className="display-4 BugTrackerTitle">Welcome, {this.props.firstName}!</h1>
                                <h2 className="display-4 BugTrackerTitle" id="successMessage">{this.state.successMessage}</h2>
                            </Container>
                        </div>
                        <Button onClick={this.handleChangePasswordButtonClick.bind(this)}>Change Password</Button>
                        <Button onClick={this.handleCreateOrganizationButtonClick.bind(this)}>Create Organization</Button>
                        <Button onClick={this.handleJoinOrganizationButtonClick.bind(this)}>Join Organization</Button>
                        <br />
                        <br />
                        {this.state.organizations.length > 0 ? (
                            <table id="organizationTable_Table" className="table table-hover bugViewTable_Table">
                                <thead id="organizationTable_head" className="thead-dark">
                                    <tr>
                                        <th className="organizationTable_th" scope="col">Name</th>
                                        <th className="organizationTable_th" scope="col">Organization ID</th>
                                        <th className="organizationTable_th" scope="col"></th>
                                        <th className="organizationTable_th" scope="col"></th>
                                        <th className="organizationTable_th" scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.organizations.map(organization => {
                                        return (
                                            <tr className="organizationTable_tr" key={organization._id}>
                                                <td id="organizationNameColumn" className="organizationTable_td">{organization.name}</td>
                                                <td id="organizationIDColumn" className="organizationTable_td">{organization.organizationID}</td>
                                                <td id="viewBugColumn" className="organizationTable_td">
                                                    
                                                    <Link to={{pathname: "/bug-view", state: {organizationMongoID: organization._id, organizationName: organization.name, organizationUsers: organization.users, userFirstName: this.state.userFirstName, userLastName: this.state.userLastName}}} className="log" ><Button>View Bugs</Button></Link>
                                                    </td>
                                                <td id="editColumn" className="organizationTable_td">
                                                    {this.props.mongoID === organization.userWhoCreatedOrgMongoID ?
                                                        <Button variant="primary" onClick={() => this.handleEditOrganizationButtonClick(organization)}>
                                                            Edit
                                                        </Button> : ""

                                                    }
                                                </td>
                                                <td id="deleteColumn" className="organizationTable_td">
                                                    {this.props.mongoID === organization.userWhoCreatedOrgMongoID ?

                                                        < Button variant="primary" onClick={() => this.handleDeleteOrLeaveButtonClick(organization)}>Delete</Button> 
                                                        : 
                                                        <Button variant="primary" onClick={() => this.handleDeleteOrLeaveButtonClick(organization)}>Leave</Button> 
                                                    }
                                                     </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>


                        ) : (<h3 id="noResultsHeader"> No Results to Display </h3>)}
                        <br />
                        <br />

                        {/* This modal will pop up for changing password! */}
                        <Modal show={this.state.showModal} animation={false}>
                            <Modal.Header>
                                <Modal.Title><h3>{this.state.currentModalTitle}</h3></Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                {this.state.setConfirmationBoxActiveInModal ?
                                    <h1 id="confirmationHeader">Are you sure?</h1>   
                                :
                                    <div>
                                        {this.state.setPasswordFieldsActiveInModal ?
                                            <div>
                                                <Input type="password" label="Old Password" onBlur={this.formatInput.bind(this)}
                                                    isvalid={this.state.oldPasswordValid.toString()}
                                                    fielderror={this.state.formErrors.oldPassword}
                                                    formgroupclass={`form-group ${this.errorClass(this.state.formErrors.oldPassword)}`}
                                                    value={this.state.oldPassword}
                                                    id="oldPassword"
                                                    onChange={this.handleChange.bind(this)}
                                                    name="oldPassword"></Input>

                                                <Input type="password" label="New Password" onBlur={this.formatInput.bind(this)}
                                                    isvalid={this.state.newPassword1And2Valid.toString()}
                                                    fielderror={this.state.formErrors.newPassword1and2}
                                                    formgroupclass={`form-group ${this.errorClass(this.state.formErrors.newPassword1and2)}`}
                                                    value={this.state.newPassword1and2}
                                                    id="newPassword1" onChange={this.handleChange.bind(this)}
                                                    name="newPassword1"></Input>

                                                <Input type="password" label="Confirm New Password" onBlur={this.formatInput.bind(this)} isvalid={this.state.newPassword1And2Valid.toString()}
                                                    fielderror={this.state.formErrors.newPassword1and2}
                                                    formgroupclass={`form-group ${this.errorClass(this.state.formErrors.newPassword1and2)}`}
                                                    value={this.state.newPassword2}
                                                    id="newPassword2"
                                                    onChange={this.handleChange.bind(this)}
                                                    name="newPassword2"></Input>

                                            </div>
                                            :
                                            <div>
                                                {this.state.setJoinOrganizationFieldsActiveInModal ?
                                                    <div>
                                                        <Input label="Please enter the Organization ID of the organization you wish to join:" onBlur={this.formatInput.bind(this)}
                                                            isvalid={this.state.organizationIDValid.toString()}
                                                            fielderror={this.state.formErrors.organizationID}
                                                            formgroupclass={`form-group ${this.errorClass(this.state.formErrors.organizationID)}`}
                                                            value={this.state.organizationIDInModal}
                                                            id="organizationIDInModal" onChange={this.handleChange.bind(this)}
                                                            name="organizationIDInModal"></Input>

                                                    </div>
                                                    :
                                                    <div>
                                                        <Input label="Organization Name" onBlur={this.formatInput.bind(this)}
                                                            isvalid={this.state.organizationNameValid.toString()}
                                                            fielderror={this.state.formErrors.organizationName}
                                                            formgroupclass={`form-group ${this.errorClass(this.state.formErrors.organizationName)}`}
                                                            value={this.state.organizationNameInModal}
                                                            id="organizationNameInModal"
                                                            onChange={this.handleChange.bind(this)}
                                                            name="organizationNameInModal"></Input>

                                                        <Input label="Organization ID (Use this ID to invite people)" onBlur={this.formatInput.bind(this)}
                                                            isvalid={this.state.organizationIDValid.toString()}
                                                            fielderror={this.state.formErrors.organizationID}
                                                            formgroupclass={`form-group ${this.errorClass(this.state.formErrors.organizationID)}`}
                                                            value={this.state.organizationIDInModal}
                                                            id="organizationIDInModal" onChange={this.handleChange.bind(this)}
                                                            name="organizationIDInModal"></Input>
                                                    </div>

                                                }

                                            </div>

                                        }

                                    </div>
                                }
                        
                                <span className="help-block serverErrorMessage">{this.state.serverErrorMessage}</span>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={this.closeModal}>
                                    Cancel
                                  </Button>
                                <Button variant="primary" onClick={this.handleSubmitButtonInModalClick.bind(this)}>
                                {this.state.formSubmitButtonText}
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