import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { BugListTableRow } from "../../components/BugListTableRow";
import { Input, FormBtn } from "../../components/Form";
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
            showModal: false,
            sampleBugViewTableData: [{ id: "1", BugTitle: "Title A", BugDescription: "Test A" }, { id: "2", BugTitle: "Title B", BugDescription: "Test B" }, { id: "3", BugTitle:"Title C", BugDescription: "Test C"}]
 
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

    handleSaveUser = event => {
        event.preventDefault();
        this.saveUser();


    }

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
                            <option value="Brian">Brian</option>
	                    </select>
                            <br />
                                <br />
                        <table id="bugViewTable_Table" className="table table-hover bugViewTable_Table">
                            <thead id="bugViewTable_head" className="thead-dark">
                                            <tr>
                                    <th className="bugViewTable_th" scope="col">Bug Title</th>
                                    <th className="bugViewTable_th" scope="col">Bug Description</th>
                                            </tr>
                                </thead>
                                        <tbody>
                                           
                                    {console.log(this.state.sampleBugViewTableData)}
                                {this.state.sampleBugViewTableData.map(tableRowData => {
                                    return (
                                        <BugListTableRow key={tableRowData.id} BugTitle={tableRowData.BugTitle} BugDescription={tableRowData.BugDescription}>
                                        </BugListTableRow>
                                    );
                                })}


                                    </tbody>
                                    </table>
                                <br />
                                    <br />
                        <FormBtn type="button" className="btn btn-primary">Create New Bug</FormBtn>

                       
                       
                       
                       
                        <button variant="primary" onClick={this.openModal}>
                            Launch demo modal
                                </button> 

                        <Modal show={this.state.showModal} animation={false}>
                            <Modal.Header>
                                <Modal.Title>Modal heading</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                            <Modal.Footer>
                                <FormBtn variant="secondary" onClick={this.closeModal}>
                                    Close
                                  </FormBtn>
                                <FormBtn variant="primary" onClick={this.saveBug}>
                                    Save Changes
                              </FormBtn>
                            </Modal.Footer>
                        </Modal>

                    </Col>
                </Row>

            </Container>
        );
    }
}

export default BugViewPage;
