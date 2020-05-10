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
            setPasswordFieldsActiveInModal: false,
            setCreateOrganizationFieldsActiveInModal: false,
            setJoinOrganizationFieldsActiveInModal: false,
            setEditOrganizationFieldsActiveInModal: false,
            formErrors: { oldPassword: "", newPassword1and2:"", organizationName:"", organizationID:"" },
            oldPassword: "",
            newPassword1: "",
            newPassword2: "",
            organizationNameInModal: "",
            organizationIDInModal: "",
            organizationMongoIDInModal: "",
            oldPasswordValid: false,
            newPassword1and2Valid: false,
            organizationNameValid: false,
            organizationIDValid: false,
            showModal: false,
            currentModalTitle: "",
            userData: [],
            organizations: []
        };
    }

    componentDidMount() {
      
        console.log("Component mounted in Profile, below is MongoID");
        console.log(this.props.mongoID);
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
        let oldPasswordValid = this.state.oldPassword;
        let newPassword1and2Valid = this.state.newPassword1Valid;


        //Validating that old password is greater than 6 characters. We'll check the DB to see if this is accurate. Password is NEVER sent to client. 
        oldPasswordValid = this.state.oldPassword >= 6;
        fieldValidationErrors.oldPassword = oldPasswordValid ? "" : "Old password must be atleast 6 characters long.";


        //Validating between the new password field and "confirm password" field that they match and are greather than or equal to 6 characters
        newPassword1and2Valid = this.state.newPassword1 === this.state.newPassword2 && this.state.newPassword1.length >= 6;
        fieldValidationErrors.newPassword1and2Valid = "New password doesn't match or your password is less than 6 characters long.";
   

        //TODO --- HANDLE FORM VALIDATION

        // this.setState({
        //     formErrors: fieldValidationErrors,
        //     oldPasswordValid: oldPasswordValid,
        //     newPassword1and2Valid: newPassword1and2Valid
        // }, () => {
        //     this.attemptToSavePasswordToDB();
        // });
    }


    
    handleChangePasswordButtonClick = event => {
        //event.preventDefault();

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
                    console.log("UpdatePassword successful in Profile Page, below is response.data");
                    console.log(response.data);

                } else {
                    console.log("Updating USER PASSWORD WAS A FAIL!!!! Below is the response.data");
                    console.log(response.data);
                    this.setState({ showModal: false });
                }
            })
        
    }
    closeModal = () => {
        this.setState({ showModal: false });
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
            setPasswordFieldsActiveInModal: false,
            organizationMongoIDInModal: organizationClickedOn._id,
            organizationNameInModal: organizationClickedOn.name,
            organizationIDInModal: organizationClickedOn.organizationID
        });
    }
    handleViewBugsOrganizationButtonClick(organizationClickedOn) {
        // console.log("Delete Bug Clicked on!!! ");
        // this.deleteBugInDB(bugClickedOn);
        // this.renderBugComments(bugClickedOn);
    }

    handleCreateOrganizationButtonClick = event => {
        this.setState({
            showModal: true,
            currentModalTitle: "Create Organization",
            setPasswordFieldsActiveInModal: false,
            setCreateOrganizationFieldsActiveInModal: true,
            setJoinOrganizationFieldsActiveInmodal: false,
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
            setJoinOrganizationFieldsActiveInModal: true
        })

    }

    //*** METHODS BELOW RELATED TO DB WITH ORGANIZATIONS */ */
    saveOrganizationInDB() {
        let userObj = {
            password: this.state.oldPassword,
            newPassword: this.state.newPassword1,
            username: this.props.username,
            mongoID: this.props.mongoID,
            organizationName: this.state.organizationNameInModal,
            organizationID: this.state.organizationIDInModal
        }

        API.saveOrganizationInDB(userObj)
            .then(response => {

                if (!response.data.error) {
                    console.log("SAVE ORGANIZATION successful in Profile Page, below is response.data");
                    console.log(response.data);
                    this.setState({ showModal: false });
                    this.getOrganizationsOfUserInDB();
                    this.forceUpdate();

                } else {
                    console.log("SAVE ORGANIZATION WAS A FAIL!!!! Below is the response.data");
                    console.log(response.data);
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
                    console.log("getOrganizationsOfUserInDB successful in Profile Page, below is response.data");
                    console.log(response.data);

                    this.setState({
                        organizations: response.data.organizations
                    })

                } else {
                    console.log("getOrganizationsOfUserInDB WAS A FAIL!!!! Below is the response.data");
                    console.log(response.data);
                    this.setState({ showModal: false });
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
            organizationID: this.state.organizationIDInModal
        }
        API.attachUserToOrganizationInDB(userObj)
            .then(response => {

                if (!response.data.error) {
                    //If we find no error, then we successful got the user's list of organizations. Update state with organizations.
                    console.log("attachUserToOrganizationInDB successful in Profile Page, below is response.data");
                    console.log(response.data);

                    this.setState({
                        organizations: response.data.organizations,
                        showModal: false
                    })
                    this.getOrganizationsOfUserInDB();
                    this.forceUpdate();

                } else {
                    console.log("attachUserToOrganizationInDB WAS A FAIL!!!! Below is the response.data");
                    console.log(response.data);
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
            isUserOrganizationOwner: isUserOrganizationOwner

        }
        API.deleteOrganizationInDB(organizationObj)
            .then(res => {

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
            organizationID: this.state.organizationIDInModal
        }

        API.updateOrganizationInDB(userObj)
            .then(response => {

                if (!response.data.error) {
                    console.log("SAVE ORGANIZATION successful in Profile Page, below is response.data");
                    console.log(response.data);
                    this.setState({ showModal: false });
                    this.getOrganizationsOfUserInDB();
                    this.forceUpdate();

                } else {
                    console.log("SAVE ORGANIZATION WAS A FAIL!!!! Below is the response.data");
                    console.log(response.data);
                }
            })
            .catch(err => console.log(err));
    }

    handleSubmitButtonInModalClick = () => {
        if(this.state.setJoinOrganizationFieldsActiveInModal)
        {
            //for JOIN organization
            this.attachUserToOrganizationInDB();
        }else if(this.state.setCreateOrganizationFieldsActiveInModal)
        {
            //For CREATE organization
            this.saveOrganizationInDB();
        }else if (this.state.setEditOrganizationFieldsActiveInModal) {
            //For UPDATE Organization
            this.updateOrganizationInDB();
        }else if(this.state.setPasswordFieldsActiveInModal)
        {
            //For UPDATE password
            this.updatePasswordInDB();
        }
    }
    
    
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
                                                <td className="organizationTable_td">{organization.name}</td>
                                                <td className="organizationTable_td">{organization.organizationID}</td>
                                                <td className="organizationTable_td">
                                                    
                                                    {/* <Button variant="primary" onClick={() => this.handleViewBugsOrganizationButtonClick(organization)}>
                                                    View Bugs
                                                    </Button> */}
                                                    
                                                    <Link to={{pathname: "/bug-view", state: {organizationMongoID: organization._id}}} className="log" ><Button>View Bugs</Button></Link>
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
                                                        <Button variant="primary" onClick={() => this.handleDeleteOrganizationInDB(organization)}>Delete</Button> 
                                                        : 
                                                        <Button variant="primary" onClick={() => this.handleDeleteOrganizationInDB(organization)}>Leave</Button> 
                                                    }
                                                     </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>


                        ) : (<h3> No Results to Display </h3>)}
                        <br />
                        <br />

                        {/* This modal will pop up for changing password! */}
                        <Modal show={this.state.showModal} animation={false}>
                            <Modal.Header>
                                <Modal.Title>{this.state.currentModalTitle}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                {this.state.setPasswordFieldsActiveInModal ?
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
                                    <div>
                                        {this.state.setJoinOrganizationFieldsActiveInModal ?
                                        <div>
                                            <p>Please enter the Organization ID of the organization you wish to join:</p>
                                            <Input onBlur={this.formatInput.bind(this)}
                                                isvalid={this.state.organizationIDValid.toString()}
                                                fielderror={this.state.formErrors.organizationIDInModal}
                                                formgroupclass={`form-group ${this.errorClass(this.state.formErrors.organizationID)}`}
                                                value={this.state.organizationIDInModal}
                                                id="organizationIDInModal" onChange={this.handleChange.bind(this)}
                                                name="organizationIDInModal"></Input>
                                            
                                        </div>
                                        :
                                        <div>
                                        <p>Organization Name</p>
                                        <Input onBlur={this.formatInput.bind(this)}
                                            isvalid={this.state.organizationNameValid.toString()}
                                            fielderror={this.state.formErrors.oldPassword}
                                            formgroupclass={`form-group ${this.errorClass(this.state.formErrors.organizationName)}`}
                                            value={this.state.organizationNameInModal}
                                            id="organizationNameInModal"
                                            onChange={this.handleChange.bind(this)}
                                            name="organizationNameInModal"></Input>

                                        <p>Organization ID (Use this number to invite people)</p>
                                        <Input onBlur={this.formatInput.bind(this)}
                                            isvalid={this.state.organizationIDValid.toString()}
                                            fielderror={this.state.formErrors.organizationIDInModal}
                                            formgroupclass={`form-group ${this.errorClass(this.state.formErrors.organizationID)}`}
                                            value={this.state.organizationIDInModal}
                                            id="organizationIDInModal" onChange={this.handleChange.bind(this)}
                                            name="organizationIDInModal"></Input>
                                        </div>

                                        }

                                    </div>
                                    
                                    
                                    
                                    
                                    }




                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={this.closeModal}>
                                    Close
                                  </Button>
                                <Button variant="primary" onClick={this.handleSubmitButtonInModalClick.bind(this)}>
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