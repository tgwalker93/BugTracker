import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { BugListTableRow } from "../../components/BugListTableRow";
import { Input, Button, TextArea } from "../../components/Form";
import Cookies from 'universal-cookie';
import API from "../../utils/API";
import "./create-bug.css";
import Modal from "react-bootstrap/Modal";
// import "bootstrap/dist/css/bootstrap.min.css";

class BugViewPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            bugTitle: "",
            bugDescription: "",
            sampleBugViewTableData: [{ id: "1", BugTitle: "Title A", BugDescription: "Test A" }, { id: "2", BugTitle: "Title B", BugDescription: "Test B" }, { id: "3", BugTitle: "Title C", BugDescription: "Test C" }]
        };
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

    render() {
        return (
            <Container id="containerViewBugs" fluid="true">

                <Row id="mainRow">
                    <Col size="sm-12">
                        <div className="jumbotron jumbotron-fluid">
                            <Container id="container" fluid="true">
                                <h1 className="display-4 BugTrackerTitle">Create Bug Task</h1>
                            </Container>
                        </div>
                        
                        <p>Bug Title</p>
                        <Input onBlur={this.formatInput.bind(this)} value={this.state.emailAddress} id="BugTitle" onChange={this.handleChange.bind(this)} name="BugTitle" />

                        
                        <TextArea label="Bug Description" onBlur={this.formatInput.bind(this)} value={this.state.emailAddress} id="BugDescription" onChange={this.handleChange.bind(this)} name="BugDescription"/>

                        <Button>Save Bug</Button><Button>View Bugs</Button>


                    </Col>
                </Row>

            </Container>
        );
    }
}

export default BugViewPage;