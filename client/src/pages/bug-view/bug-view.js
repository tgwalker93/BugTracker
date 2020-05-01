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
            bugData: [{ id: "empty", bugTitle: "empty", bugDescription: "empty" }],
            bugTitle: "",
            bugDescription: ""
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

    formatPhone(obj) {
        if (obj == null) {
            return;
        }
        var numbers = obj.state.phoneNumber.replace(/\D/g, "").substring(0, 10),
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


    createAccount = event => {
        event.preventDefault();
        this.setState({ isLogin: false });

    };


    closeModal = () => {
        this.setState({ showModal: false });
    }

    openModal = () => {
        this.setState({ showModal: true });
    }

    editBugButton = () => {
        this.setState({ showModal: true, currentModalTitle: "Edit Bug" });
    }

    updateBug = () => {
        console.log("hello: ");
        console.log(this.state.bugData[this.state.currentBugIndex]);
        this.state.bugData[this.state.currentBugIndex].bugDescription = "hello?"
        console.log(this.state.bugData[this.state.currentBugIndex])
        let bugObj = {
            bugTitle: this.state.bugTitle,
            bugDescription: this.state.bugDescription
        }
        console.log("I'm in updateBug");
        console.log("here is state");
        console.log(this.state);
        console.log("here is this");
        console.log(this);
        API.saveBug(bugObj)
            .then(response => {



                if (!response.data.error) {
                    // userObj.userId = response.data.doc._id;
                    // this.props._login(this.state.username, this.state.password, userObj);
                    // this.setState({
                    //     redirectTo: '/profile'
                    // })
                    console.log("I WAS SUCCESSFUL FROM Bug View PAGE");
                } else {
                    this.setState({ errorResponse: response })
                }
            })
    }
    createNewBugButton = () => {
        this.state.bugData.push({ id: "", bugTitle: "", bugDescription: ""})
        this.setState({ showModal: true, currentModalTitle: "Create Bug", currentBugIndex: this.state.bugData.length-1 });
        // console.log(this.state.this.state.currentBugIndex);
        // console.log(this.state.bugData[this.data.currentBugIndex]);
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
                        <table id="bugViewTable_Table" className="table table-hover bugViewTable_Table">
                            <thead id="bugViewTable_head" className="thead-dark">
                                            <tr>
                                    <th className="bugViewTable_th" scope="col">Bug Title</th>
                                    <th className="bugViewTable_th" scope="col">Bug Description</th>
                                    <th className="bugViewTable_th" scope="col"></th>
                                            </tr>
                                </thead>
                                        <tbody>
                                    {console.log(this.state.sampleBugViewTableData)}
                                {this.state.sampleBugViewTableData.map(tableRowData => {
                                    return(
                                            <tr className="bugViewTable_tr" key={tableRowData.id}>
                                                <td className="bugViewTable_td">{tableRowData.bugTitle}</td>
                                                <td className="bugViewTable_td">{tableRowData.bugDescription}</td>
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
                                <Input onBlur={this.formatInput.bind(this)} value={this.state.bugTitle} id="bugTitle" onChange={this.handleChange.bind(this)} name="bugTitle" />


                                <TextArea label="Bug Description" onBlur={this.formatInput.bind(this)} value={this.state.bugDescription} id="bugDescription" onChange={this.handleChange.bind(this)} name="bugDescription" />

                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={this.closeModal}>
                                    Close
                                  </Button>
                                <Button variant="primary" onClick={this.updateBug}>
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
