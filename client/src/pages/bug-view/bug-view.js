import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { BugListTableRow } from "../../components/BugListTableRow";
import { Input, Button, TextArea } from "../../components/Form";
import Cookies from 'universal-cookie';
import API from "../../utils/API";
import "./bug-view.css";
import Modal from "react-bootstrap/Modal";
// import "bootstrap/dist/css/bootstrap.min.css";

class BugViewPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            firstName: "",
            lastName: "",
            emailAddress: "",
            password: "",
            phoneNumber: "",
            guestCount: "",
            formErrors: { firstName: "", lastName: "", emailAddress: "", phoneNumber: "", guestCount: "", password: "" },
            firstNameValid: false,
            lastNameValid: false,
            passwordValid: false,
            emailAddressValid: false,
            phoneNumberValid: false,
            guestCountValid: false,
            isLogin: true,
            currentModalTitle: "Edit Bug",
            currentBugIndex: 0,
            showModal: false,
            showModal2: false,
            sampleBugViewTableData: [{ id: "1", bugTitle: "Title A", bugDescription: "Test A" }, { id: "2", bugTitle: "Title B", bugDescription: "Test B" }, { id: "3", bugTitle: "Title C", bugDescription: "Test C"}],
            bugData: [],
            bugTitleInModal: "",
            bugDescriptionInModal: "",
        };

    }

    delta = () => {
        this.setState({
            count: this.state.count + 1
        });
    }
    handleChange(e) {
        this.setState({ [e.target.id]: e.target.value });
    }

    validateFields() {

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


    handleFormSubmit = event => {
        event.preventDefault();
        this.validateFields();
    };


    closeModal = () => {
        this.setState({ showModal: false });
    }


    // MAKE DB UPDATE ON EDIT BUTTOn. Currently, each edit modal is not bound to bug Object.
    editBugButton = () => {
        this.setState({ showModal: true, currentModalTitle: "Edit Bug" });
    }

    updateOrCreateBug = () => {

        let bugObj = {
            bugTitle: this.state.bugTitleInModal,
            bugDescription: this.state.bugDescriptionInModal
         }
        
        API.saveBug(bugObj)
            .then(response => {



                if (!response.data.error) {
                    console.log("I WAS SUCCESSFUL Saving Bug FROM Bug View PAGE");
                    this.setState({ showModal: false });
                    this.forceUpdate();
                } else {
                    this.setState({ errorResponse: response })
                }
            })
    }
    createNewBugButton = () => {
        this.setState({ showModal: true, currentModalTitle: "Create Bug", isCreateBug: true });
    }

    getBugsFromDB() {
        API.getAllBugs()
        .then(response => {
            if (!response.data.error) {
                console.log("SUCCESSFULLY GOT BUGS FROM DB");
                var bugs = [];
                //Loop through bug data received from the server.
                for(var i=0; i<response.data.length; i++){
                    bugs.push({
                        mongoID: response.data[this.state.currentBugIndex]._id,
                        id: this.state.currentBugIndex,     
                        bugTitle: response.data[this.state.currentBugIndex].properties.bugTitle, 
                        bugDescription: response.data[this.state.currentBugIndex].properties.bugDescription})
                         this.setState({ currentBugIndex: this.state.currentBugIndex+1 });
                }
                 this.setState({bugData: bugs});
                 console.log("Here is bug data!");
                 console.log(bugs);
            } else {
                this.setState({ errorResponse: response })
            }
        }).catch(err => console.log(err));
    }

    componentWillMount() {
        this.getBugsFromDB();
    } 


    render() {
        return (
             <Container id="containerViewBugs" fluid="true">
                <Row id="mainRow">
                    <Col size="sm-12">
                        <div className="jumbotron jumbotron-fluid">
                            <Container id="container" fluid="true">
                                <h1 className="display-4 BugTrackerTitle">View Bugs</h1>
                            </Container>
                        </div>
                        <p><strong>Assignee </strong> </p>
                         <select>
                            <option value=""></option>
                            <option value="Tyler">Tyler</option>
                            <option value="Brian">Tawny</option>
                            <option value="Brian">Anthony</option>
                            <option value="Brian">Arthur</option>
	                    </select>
                            <br />
                                <br />
                        {this.state.bugData.length ? (
                        <table id="bugViewTable_Table" className="table table-hover bugViewTable_Table">
                            <thead id="bugViewTable_head" className="thead-dark">
                                            <tr>
                                    <th className="bugViewTable_th" scope="col">Bug Title</th>
                                    <th className="bugViewTable_th" scope="col">Bug Description</th>
                                    <th className="bugViewTable_th" scope="col"></th>
                                            </tr>
                                </thead>
                                        <tbody>
                                    {this.state.bugData.map(bug => {
                                    return(
                                        <tr className="bugViewTable_tr" key={bug.mongoID}>
                                            <td className="bugViewTable_td">{bug.bugTitle}</td>
                                            <td className="bugViewTable_td">{bug.bugDescription}</td>
                                            <td id="editColumn" className="bugViewTable_td">                                
                                                <Button variant="primary" onClick={this.editBugButton}>
                                                    Edit
                                            </Button>
                                            </td>
                                            </tr>
                                    )
                                })}
                                    </tbody>
                                    </table>


                        ) : ( <h3> No Results to Display </h3>  )} 
                                <br />
                                    <br />
                        <Button type="button" className="btn btn-primary" onClick={this.createNewBugButton}>Create New Bug</Button>

                       
                       
                       
                
                        {/* This modal will pop up for editing bugs! */}
                        <Modal show={this.state.showModal} animation={false}>
                            <Modal.Header>
                                <Modal.Title>{this.state.currentModalTitle}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <p>Bug Title</p>
                                <Input onBlur={this.formatInput.bind(this)} value={this.state.bugTitleInModal} id="bugTitleInModal" onChange={this.handleChange.bind(this)} name="bugTitleInModal" />


                                <TextArea label="Bug Description" onBlur={this.formatInput.bind(this)} value={this.state.bugDescriptionInModal} id="bugDescriptionInModal" onChange={this.handleChange.bind(this)} name="bugDescriptionInModal" />

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

export default BugViewPage;
