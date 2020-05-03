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
            userData: []
        };
    }

    componentDidMount() {
      
        // if(!this.state.loggedIn){
        //     this.setState({
        //         redirectTo: '/'
        //     })
        // }
        
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
                                <h1 className="display-4 BugTrackerTitle">Welcome, {this.props.user}!</h1>
                            </Container>
                        </div>

                        <Link to="/bug-view" className="log" ><Button>View Bugs</Button></Link>
                        
                    </Col>
                </Row>

            </Container>
        );

    
}
}

// export default Profile;
export default withRouter(Profile)