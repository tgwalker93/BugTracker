import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import { BugListTableRow } from "../../components/BugListTableRow";
import { Input, Button, TextArea } from "../../components/Form";
import {BugCommentContainer, BugCommentPanel } from "../../components/BugCommentContainer";
import Cookies from 'universal-cookie';
import API from "../../utils/API";
import "./bug-view.css";
import { Link } from "react-router-dom";
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
            isNewBug: false,
            selectedBug: "",
            currentModalTitle: "Edit Bug",
            currentBugIndex: 0,
            showModal: false,
            showModal2: false,
            sampleBugViewTableData: [{ id: "1", bugTitle: "Title A", bugDescription: "Test A" }, { id: "2", bugTitle: "Title B", bugDescription: "Test B" }, { id: "3", bugTitle: "Title C", bugDescription: "Test C"}],
            bugData: [],
            filteredBugData: [],
            bugTitleInModal: "",
            bugCommentsInModal: [],
            users: [{text: 'Tyler', id: '1'}, {text: 'Tawny', id: '2'}, {text: 'Anthony', id: '3'}, {text: 'Arthur', id:'4'}],
            currentBugCommentInModal:"",
            bugDescriptionInModal: "",
            bugStatusInModal: "",
            bugUserAssignedInModal: "",
            userFilter: "",
            statusFilter: ""
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


    //************************** DB METHODS ************** THESE METHODS SAVE, EDIT, GET BUGS FROM DB *******************************************
    saveNewBugInDB = () => {

        console.log("Im in saveNewBugIn DB");
    

        let bugObj = {
            id: this.state.bugData.length,
            mongoID: this.state.bugData.length,
            currentBugIndex: this.state.bugData.length,
            bugTitle: this.state.bugTitleInModal,
            bugDescription: this.state.bugDescriptionInModal,
            userAssigned: this.state.bugUserAssignedInModal,
            status: this.state.bugStatusInModal
        }
        console.log(bugObj);
        API.saveBug(bugObj)
            .then(response => {



                if (!response.data.error) {
                    console.log("I WAS SUCCESSFUL Saving Bug FROM Bug View PAGE");

                    //Grabbing new ID from DB
                    bugObj.mongoID = response.data.doc._id;

                    console.log(bugObj);


                    this.setState({ showModal: false });
                    this.state.bugData.push(bugObj);
                    this.forceUpdate();
                } else {
                    this.setState({ errorResponse: response })
                }
            })
    }

    updateBugInDB = () => {
        console.log("I'm in the update bug in DB");
        console.log(this.state.selectedBug);
        API.updateBug(this.state.selectedBug)
            .then(response => {

                if (!response.data.error) {
                    console.log("I WAS SUCCESSFUL Saving Bug FROM Bug View PAGE");

                    this.setState({ showModal: false });
                    this.state.bugData[this.state.currentBugIndex] = this.state.selectedBug;
                    this.forceUpdate();
                } else {
                    this.setState({ errorResponse: response })
                }
            })
    }
    getBugsFromDB() {
        API.getAllBugs()
            .then(response => {
                if (!response.data.error) {
                    console.log("SUCCESSFULLY GOT BUGS FROM DB");
                    var bugs = [];
                    //Loop through bug data received from the server.
                    for (var i = 0; i < response.data.length; i++) {
                        console.log("bug " + i);
                        bugs.push({
                            mongoID: response.data[this.state.currentBugIndex]._id,
                            id: this.state.currentBugIndex,
                            bugTitle: response.data[this.state.currentBugIndex].bugTitle,
                            bugDescription: response.data[this.state.currentBugIndex].bugDescription,
                            userAssigned: response.data[this.state.currentBugIndex].userAssigned,
                            status: response.data[this.state.currentBugIndex].status
                        })
                        this.setState({ currentBugIndex: this.state.currentBugIndex + 1 });
                        console.log(bugs);
                    }
                    this.setState({ bugData: bugs });
                    console.log("IF IM HEre THEN THE DATA JUST UPDATED!!!!");
                    this.forceUpdate();
                    console.log("Here is bug data from inside callback of API.getAllBugs in bug-view page!");
                    console.log(bugs);

                    //At default, we want to show all bugs in the table
                    this.putAllBugsIntoFilteredArray();
                    this.forceUpdate();
                } else {
                    this.setState({ errorResponse: response })
                }
            }).catch(err => console.log(err));

            console.log("I am here");
    }

    deleteBugInDB(bugClickedOn) {
        console.log("I'm in delete bug in DB method. Here is the bug that was clicked on");
        console.log(bugClickedOn);
        API.deleteBug(bugClickedOn)
            .then(response => {

                if (!response.data.error) {
                    console.log("I WAS SUCCESSFUL DELETING THE Bug FROM Bug View PAGE. Here is the response.");
                    console.log(response);

                     if(response.data.deletedCount > 0){
                         //Removing the bug from the UI
                         const index = this.state.bugData.indexOf(bugClickedOn);
                         if (index > -1) {
                             this.state.bugData.splice(index, 1);
                         }
                     } else {
                         console.log("Deleting the bug failed for some reason!");
                     }

                     this.forceUpdate();
                } else {
                    this.setState({ errorResponse: response })
                }
            })
    }


    // Below methods are related to bug comments
    addBugComment() {
        let currentBug = this.state.bugData[this.state.currentBugIndex];
        if(currentBug){
            currentBug.text = this.state.currentBugCommentInModal;
       

        console.log("Im in the addBugComment Method on bugview page. Below is currentBug");
        console.log(currentBug);
        if (this.state.currentBugCommentInModal) {
            API.saveBugComment(currentBug)
                .then(res => this.renderBugComments(currentBug))
                .catch(err => console.log(err));
        }

         }

    };
    renderBugComments(bugData) {

        console.log("im in the render bug data on the front end");
        console.log(bugData);
        API.getBugComments(bugData)
            .then(res => {
                console.log("I got my res from render bug comments");
                console.log(res);
                //var bugCommentsArr = [];
                // if(res.data.bugComment == null){
                //     bugCommentsArr = [];
                // }
                this.setState({
                    bugCommentsInModal: res.data.bugComments
                })
            })
            .catch(err => console.log(err));
    }

    deleteBugComment(bugComment) {
        API.deleteBugComment(bugComment)
            .then(res => {
                this.renderBugComments(this.state.bugData[this.state.currentBugIndex]);
            })
            .catch(err => console.log(err));

    }
    // ****************** END OF DB METHODS*******************************************


    //************************THESE METHODS ARE CALLED FROM BUTTONS WITHIN THE MODAL*********************
    updateOrCreateBug = () => {
        if (this.state.isNewBug){
            this.saveNewBugInDB();
        } else {
            //UPDATE THE BUG DATA LOCALLY BEFORE PUSHING TO DB
            this.state.bugData[this.state.currentBugIndex].bugTitle = this.state.bugTitleInModal;
            this.state.bugData[this.state.currentBugIndex].bugDescription = this.state.bugDescriptionInModal;
            this.state.bugData[this.state.currentBugIndex].userAssigned = this.state.bugUserAssignedInModal;
            this.state.bugData[this.state.currentBugIndex].status = this.state.bugStatusInModal;


            this.setState({selectedBug: this.state.bugData[this.state.currentBugIndex]});
            this.updateBugInDB();
        }
    }
    closeModal = () => {
        this.setState({ showModal: false, bugTitleInModal:"", bugDescriptionInModal: "" });
        console.log("I'm in closemodal!! Below is the bug object");
        console.log(this.state.bugData[this.state.currentIndex]);
        console.log(this.state.bugUserAssignedInModal);
        console.log(this.state.bugStatusInModal);
    }
    //*********************** END OF MODAL BUTTON CLICK METHODS ****************************


    // ******************** THESE METHODS ARE CALLED WHEN CREATE/EDIT BUTTONS ARE FIRST CLICKED ******************
    editBugButton(bugClickedOn) {
        console.log("Edit bug clicked on !!!");
        console.log(bugClickedOn);
        this.setState({ showModal: true, 
            currentModalTitle: "Edit Bug",
            currentBugIndex: bugClickedOn.id,
            bugTitleInModal: bugClickedOn.bugTitle, 
            bugDescriptionInModal: bugClickedOn.bugDescription, 
            isNewBug: false, 
            selectedBug: bugClickedOn });
        this.renderBugComments(bugClickedOn);
    }
    deleteBugButton(bugClickedOn){ 
        console.log("Delete Bug Clicked on!!! ");
        this.deleteBugInDB(bugClickedOn);
        this.renderBugComments(bugClickedOn);
    }

    createNewBugButton = () => {
        this.setState({ showModal: true, currentModalTitle: "Create Bug", isNewBug: true, bugTitleInModal: "", bugDescriptionInModal: "" });
    }
    // ******************** END OF INITIAL BUTTON CLICK METHODS ******************



    //CALLS THIS WHEN THE COMPONENT MOUNTS, basically "on page load"
    componentDidMount() {
        console.log("Component Did Mount has been called");
        this.getBugsFromDB();
        
    } 

    putAllBugsIntoFilteredArray() {
        this.setState({filteredBugData: []});
        this.state.bugData.map(bug => {
            return this.state.filteredBugData.push(bug);
        });
    }

    render() {


        if (this.state.userFilter !== "" || this.state.statusFilter !== ""){
            this.state.filteredBugData  = [];
            this.state.bugData.map(bug => {
                console.log("status filter is " + this.state.statusFilter);
                console.log("bug.status is " + bug.status);
                console.log("user filter is " + this.state.userFilter);
                console.log("bug.userFilter is " + bug.userAssigned);
                
               var assigneeFilterIsActive = false;
                var statusFilterIsActive = false;
                //APPLY THE FILTERS
            if (this.state.statusFilter === bug.status && this.state.statusFilter !== "")  {

                statusFilterIsActive = true;
            }
            
            if(this.state.userFilter === bug.userAssigned && this.state.userFilter !== "") {
                assigneeFilterIsActive = true;
            }

            console.log("statusFilterIsActive: " + statusFilterIsActive);
            console.log("AssigneeFilterIsActive: " + assigneeFilterIsActive);

                if (statusFilterIsActive && assigneeFilterIsActive){
                    console.log("StatusFilter and Assigneefilter active");
                return this.state.filteredBugData.push(bug);
                } else if (statusFilterIsActive && this.state.userFilter === ""){
                    
                    console.log("Just statusfilter is active");
                    return this.state.filteredBugData.push(bug);
                }
                else if (assigneeFilterIsActive && this.state.statusFilter === "") {
                    console.log("Just assignee filter is active");
                    return this.state.filteredBugData.push(bug);
                }
                console.log("_------------------");
        });

        console.log("Before RENDER() return, here is the filtered data!!!");
        console.log(this.state.filteredBugData);
          } else {
            this.state.filteredBugData = [];
            this.state.bugData.map(bug => {
                console.log("status filter is " + this.state.statusFilter);
                console.log("bug.status is " + bug.status);
                console.log("user filter is " + this.state.userFilter);
                console.log("bug.userAssigned is " + bug.userAssigned);
                    return this.state.filteredBugData.push(bug);

            });

          }
        return (
             <Container id="containerViewBugs" fluid="true">
                <Row id="mainRow">
                    <Col size="sm-12">
                        <div className="jumbotron jumbotron-fluid">
                            <Container id="container" fluid="true">
                                <h1 className="display-4 BugTrackerTitle">View Bugs</h1>
                            </Container>
                        </div>
                        <Link to="/profile" className="log" ><Button>View Profile</Button></Link>
                        <br />
                        <br />
                        <Row>
                            <Col size="sm-3">
                                <p><strong>Assignee </strong> </p>
                                <select value={this.state.userFilter} onChange={this.handleChange.bind(this)} id="userFilter" name="userFilter">
                                    <option className="dropdown-item" href="#" value=""></option>
                                    <option className="dropdown-item" href="#" value="Tyler">Tyler</option>
                                    <option className="dropdown-item" href="#" value="Tawny">Tawny</option>
                                    <option className="dropdown-item" href="#" value="Anthony">Anthony</option>
                                    <option className="dropdown-item" href="#" value="Arthur">Arthur</option>
                                </select>
                            </Col>
                            <Col size="sm-3">
                                <p><strong>Status</strong></p>
                                <select value={this.state.statusFilter} onChange={this.handleChange.bind(this)} id="statusFilter" name="statusFilter">
                                    <option className="dropdown-item" href="#" value=""></option>
                                    <option className="dropdown-item" href="#" value="Open">Open</option>
                                    <option className="dropdown-item" href="#" value="In Development">In Development</option>
                                    <option className="dropdown-item" href="#" value="Needs Testing">Needs Testing</option>
                                </select>
                            </Col>
                        </Row>
                            <br />
                                <br />
                        {this.state.bugData.length ? (
                        <table id="bugViewTable_Table" className="table table-hover bugViewTable_Table">
                            <thead id="bugViewTable_head" className="thead-dark">
                                            <tr>
                                    <th className="bugViewTable_th" scope="col">Title</th>
                                    <th className="bugViewTable_th" scope="col">User Assigned</th>
                                    <th className="bugViewTable_th" scope="col">Status</th>
                                    <th className="bugViewTable_th" scope="col"></th>
                                    <th className="bugViewTable_th" scope="col"></th>
                                            </tr>
                                </thead>
                                        <tbody>  
                                            {console.log("here is the filtered data")}
                                            {console.log(this.state.filteredBugData)}                                       
                                    {this.state.filteredBugData.map(bug => {
                                            return(
                                                <tr className="bugViewTable_tr" key={bug.id}>
                                                    {console.log("I'm in filteredBudata MAP, below is current BUG")}
                                                    {console.log(bug)}
                                                    <td className="bugViewTable_td">{bug.bugTitle}</td>
                                                    <td className="bugViewTable_td">{bug.userAssigned}</td>
                                                    <td className="bugViewTable_td">{bug.status}</td>
                                                    <td id="editColumn" className="bugViewTable_td">                            
                                                        <Button variant="primary" onClick={() => this.editBugButton(bug)}>
                                                            Edit
                                                    </Button>
                                                    </td>
                                                    <td id="deleteColumn" className="bugViewTable_td"> <Button variant="primary" onClick={() => this.deleteBugButton(bug)}>Delete</Button></td>
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


                                <Input label="Bug Title" onBlur={this.formatInput.bind(this)} value={this.state.bugTitleInModal} id="bugTitleInModal" onChange={this.handleChange.bind(this)} name="bugTitleInModal" />


                                <TextArea label="Bug Description" onBlur={this.formatInput.bind(this)} value={this.state.bugDescriptionInModal} id="bugDescriptionInModal" onChange={this.handleChange.bind(this)} name="bugDescriptionInModal" />
                                <br />
                                <br />
                                <label><strong>Assignee</strong></label>
                                <select value={this.state.bugUserAssignedInModal} onChange={this.handleChange.bind(this)} id="bugUserAssignedInModal" name="bugUserAssignedInModal">
                                    <option className="dropdown-item" href="#" value=""></option>
                                    <option className="dropdown-item" href="#" value="Tawny">Tawny</option>
                                    <option className="dropdown-item" href="#" value="Anthony">Anthony</option>
                                    <option className="dropdown-item" href="#" value="Tyler">Tyler</option>
                                    <option className="dropdown-item" href="#" value="Arthur">Arthur</option>
                                </select>

                                <br />

                                <br />
                                <label><strong>Status</strong></label>
                                <select value={this.state.bugStatusInModal} onChange={this.handleChange.bind(this)} id="bugStatusInModal" name="bugStatusInModal">
                                    <option className="dropdown-item" href="#" value=""></option>
                                    <option className="dropdown-item" href="#" value="Open">Open</option>
                                    <option className="dropdown-item" href="#" value="In Development">In Development</option>
                                    <option className="dropdown-item" href="#" value="Needs Testing">Needs Testing</option>
                                    <option className="dropdown-item" href="#" value="Completed">Completed</option>
                                </select>


                                <br />
                                <br />
                                {/* BUG COMMENT SECTION */}

                                {this.state.isNewBug ? 

                                    "": <div>


                                        <hr />
                                        {this.state.bugCommentsInModal.length ? (
                                            <BugCommentContainer>
                                                <div className="bugCommentContainer">
                                                    {this.state.bugCommentsInModal.map(bugComment => {
                                                        let boundBugCommentClick = this.deleteBugComment.bind(this, bugComment);
                                                        return (
                                                            <BugCommentPanel key={bugComment._id} text={bugComment.text}>
                                                                <div>
                                                                    <button className='btn btn-danger bugComment-delete insideNote' onClick={boundBugCommentClick}> X </button>
                                                                </div>

                                                            </BugCommentPanel>
                                                        );
                                                    })}
                                                </div>
                                            </BugCommentContainer>
                                        ) : (
                                                <h3> There are no comments! </h3>
                                            )}


                                        <Input placeholder='Bug Comment'
                                            id="currentBugCommentInModal"
                                            onBlur={this.formatInput.bind(this)}
                                            value={this.state.currentBugCommentInModal}
                                            onChange={this.handleChange.bind(this)}
                                            name="currentBugCommentInModal"
                                        />
                                        <Button className='btn btn-success save' onClick={() => this.addBugComment()}>Save Comment</Button>
                                        <Button className='btn btn-danger note-delete noteModal' onClick={() => this.closeModal()}>X</Button>

                                    </div>
                                }

                                {/* END OF BUG COMMENT SECTION */}



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
