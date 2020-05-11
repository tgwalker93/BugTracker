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
            formErrors: { bugTitle: "" },
            bugTitleValid: false,
            isLogin: true,
            isNewBug: false,
            selectedBug: "",
            currentModalTitle: "Edit Bug",
            currentBugIndex: 0,
            currentCompletedBugIndex: 0,
            showModal: false,
            showModal2: false,
            bugData: [],
            filteredCompletedBugData: [],
            filteredBugData: [],
            bugTitleInModal: "",
            bugCommentsInModal: [],
            users: [{text: 'Tyler', id: '1'}, {text: 'Tawny', id: '2'}, {text: 'Anthony', id: '3'}, {text: 'Arthur', id:'4'}],
            organizationUsers: [],
            currentBugCommentInModal:"",
            bugDescriptionInModal: "",
            bugStatusInModal: "",
            bugUserAssignedInModal: "",
            userFilter: "",
            statusFilter: "",
            organizationMongoID: "",
            organizationNameInTitle: "",
            formSubmitButtonText: "Submit",
            userFirstName: "",
            userLastName: "",
            showActiveBugs: true,
            showCompletedBugs: false,
            isCurrentBugCompleted: false
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

        
            let fieldValidationErrors = this.state.formErrors;
            let bugTitleValid = this.state.bugTitleValid;


            bugTitleValid = this.state.bugTitleInModal.length > 0;
            fieldValidationErrors.bugTitle = bugTitleValid ? "" : "Please add Bug Title.";


            this.setState({
                formErrors: fieldValidationErrors,
                bugTitleValid: bugTitleValid
            }, () => {
                    this.updateOrCreateBug();
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


    handleFormSubmit = event => {
        event.preventDefault();
        this.validateFields();
    };


    //************************** DB METHODS ************** THESE METHODS SAVE, EDIT, GET BUGS FROM DB *******************************************
    saveNewBugInDB = () => {
        console.log("Im in saveNewBugIn DB");
        console.log(bugObj);

        var bugObj = {
            organizationMongoID: this.state.organizationMongoID,
            bugTitle: this.state.bugTitleInModal,
            bugDescription: this.state.bugDescriptionInModal,
            userAssigned: this.state.bugUserAssignedInModal,
            status: this.state.bugStatusInModal
        }

        API.saveBug(bugObj)
            .then(response => {

                if (!response.data.error) {
                    console.log("I WAS SUCCESSFUL Saving Bug FROM Bug View PAGE");
                    console.log(response.data.bugDoc._id);


                    bugObj.mongoID = response.data.bugDoc._id;
                    bugObj.newMongoID = response.data.bugDoc._id;
                    bugObj.id = this.state.currentBugIndex;
                    bugObj.isCompleted = response.data.isCompleted;

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
                    console.log("!!!!!!!!!!!!!!!I WAS SUCCESSFUL UPDATE Bug FROM Bug View PAGE!!!!!!!!!!!!!");
                    console.log(response.data);

                    this.setState({ showModal: false });

                    this.forceUpdate();
                } else {
                    this.setState({ errorResponse: response })
                }
            })
    }


    getBugsFromDB() {
        API.getAllBugs(this.state.organizationMongoID)
            .then(response => {
                if (!response.data.error) {
                    console.log("SUCCESSFULLY GOT BUGS FROM DB_____________________________________________________");
                    var bugs = [];
                    var completedBugs = [];
                    console.log(response.data);
                    var bugArrayFromDB = response.data.organizationDoc.bugs;
                    console.log("here are all the bugs I got back from DB **************************");
                    console.log(bugArrayFromDB);
                    //Loop through bug data received from the server.
                    for (var i = 0; i < bugArrayFromDB.length; i++) {


                           console.log("bug " + this.state.currentBugIndex);
                            console.log(bugArrayFromDB[i]);
                            bugs.push({
                                mongoID: bugArrayFromDB[i]._id,
                                id: this.state.currentBugIndex,
                                bugTitle: bugArrayFromDB[i].bugTitle,
                                bugDescription: bugArrayFromDB[i].bugDescription,
                                userAssigned: bugArrayFromDB[i].userAssigned,
                                status: bugArrayFromDB[i].status,
                                isCompleted: bugArrayFromDB[i].isCompleted
                            })



                        this.setState({ currentBugIndex: this.state.currentBugIndex + 1});




                   }

                    this.setState({ bugData: bugs});
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
        bugClickedOn.bugMongoID = bugClickedOn.mongoID;
        bugClickedOn.organizationMongoID = this.state.organizationMongoID;
        API.deleteBug(bugClickedOn)
            .then(response => {

                if (!response.data.error) {
                    console.log("I WAS SUCCESSFUL DELETING THE Bug FROM Bug View PAGE. Here is the response.");
                    console.log(response);

                    if (response.data.deletedBugDoc.deletedCount > 0){
                         //Removing the bug from the UI
                         const index = this.state.bugData.indexOf(bugClickedOn);
                         if (index > -1) {
                             this.state.bugData.splice(index, 1);
                         }
                         this.adjustBugDataOrder();
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
                if(res.data !== null){
                    this.setState({
                        bugCommentsInModal: res.data.bugComments
                    })
                }
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
        if(!this.state.bugTitleValid){
            return;
        }
        if (this.state.isNewBug){
            this.saveNewBugInDB();
        } else {
            console.log("I'm in the UPDATE OR CREATE BUG METHOD, below is the bug data");
            console.log(this.state.bugData);
            console.log("here is the currentBugIndex: " + this.state.currentBugIndex);
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
        this.setState({ showModal: false, bugTitleInModal: "", bugDescriptionInModal: "", currentBugCommentInModal: "", formErrors: {bugTitle: ""} });
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
        this.adjustBugDataOrder()
        this.setState({ showModal: true, 
            currentModalTitle: "Edit Bug",
            currentBugIndex: bugClickedOn.id,
            bugTitleInModal: bugClickedOn.bugTitle, 
            bugDescriptionInModal: bugClickedOn.bugDescription, 
            bugStatusInModal: bugClickedOn.status,
            bugUserAssignedInModal: bugClickedOn.userAssigned,
            isNewBug: false, 
            selectedBug: bugClickedOn });
        this.renderBugComments(bugClickedOn);
    }
    deleteBugButton(bugClickedOn){ 
        console.log("Delete Bug Clicked on!!! ");
        this.deleteBugInDB(bugClickedOn);
    }

    createNewBugButton = () => {
        this.setState({ showModal: true, currentModalTitle: "Create Bug", isNewBug: true, bugTitleInModal: "", bugDescriptionInModal: "" });
    }
    // ******************** END OF INITIAL BUTTON CLICK METHODS ******************



    //CALLS THIS WHEN THE COMPONENT MOUNTS, basically "on page load"
    componentDidMount() {
        console.log("Component Did Mount has been called in Bug View Page!!");
        console.log("BELOW IS THE PASSED users");
        console.log(this.props);

        var organizationUsersArray = [];
        for(var i =0; i<this.props.location.state.organizationUsers.length; i++){
            organizationUsersArray.push(
                {
                    text: this.props.location.state.organizationUsers[i],
                    id: i
                }
            )
        }
        this.setState({ organizationMongoID: this.props.location.state.organizationMongoID, organizationNameInTitle: this.props.location.state.organizationName,
            organizationUsers: organizationUsersArray,
        userFirstName: this.props.location.state.userFirstName, userLastName: this.props.location.state.userLastName }, () => {
            this.getBugsFromDB();
        });

        
    } 

    putAllBugsIntoFilteredArray() {
        this.setState({filteredBugData: []});
        this.state.bugData.map(bug => {
            return this.state.filteredBugData.push(bug);
        });
    }
    adjustBugDataOrder() {
        //Update the current page's id of the bug for UI purposes
        for (var i = 0; i < this.state.bugData.length; i++) {
            this.state.bugData[i].id = i;
        }
        // for(var j=0; j<this.state.completedBugData.length; j++){
        //     this.state.completedBugData[j].id = j;
        // }
    }

    //If you click "Show Completed Bugs" or "Hide Completed Bugs", this will show or hide.
    swapRenderCompletedBugs = () => {
        if(this.state.showCompletedBugs){
            this.setState({showCompletedBugs: false})
        }else {
            this.setState({ showCompletedBugs: true })
        }
        
    }
    //If you click "Show Active Bugs" or "Hide Active Bugs", this will show or hide.
    swapRenderActiveBugs = () => {
        if (this.state.showActiveBugs) {
            this.setState({ showActiveBugs: false })
        } else {
            this.setState({ showActiveBugs: true })
        }
    }

    completedCheck(bug){
        console.log("YOU JUST CLICKED COMPLETED CHECK");
        console.log(bug);

       if(bug.isCompleted){
           bug.isCompleted = false;
       }else {
           bug.isCompleted = true;
       }

        this.setState({ selectedBug: bug }, () => {
            //this.adjustBugDataOrder();
            this.updateBugInDB();
            //this.checkBothCompletedAndActiveBugData(this.state.bugData)
            this.forceUpdate();
        });

    }

    render() {


        if (this.state.userFilter !== "" || this.state.statusFilter !== ""){
            this.state.filteredBugData  = [];
            this.state.bugData.map(bug => {
                
               var assigneeFilterIsActive = false;
                var statusFilterIsActive = false;
                //APPLY THE FILTERS
            if (this.state.statusFilter === bug.status && this.state.statusFilter !== "")  {

                statusFilterIsActive = true;
            }          
            if(this.state.userFilter === bug.userAssigned && this.state.userFilter !== "") {
                assigneeFilterIsActive = true;
            }
            if (statusFilterIsActive && assigneeFilterIsActive && !bug.isCompleted){
            return this.state.filteredBugData.push(bug);
            } else if (statusFilterIsActive && this.state.userFilter === "" && !bug.isCompleted){
                
                return this.state.filteredBugData.push(bug);
            }
            else if (assigneeFilterIsActive && this.state.statusFilter === "" && !bug.isCompleted) {
                return this.state.filteredBugData.push(bug);
            }
        });
          } else {
            this.state.filteredBugData = [];
            this.state.bugData.map(bug => {
                    if(!bug.isCompleted){
                    return this.state.filteredBugData.push(bug);
                    }

            });

          }




          // NOW WE WILL DO THE SAME LOGIC FOR COMPLETED BUGS
        if (this.state.userFilter !== "" || this.state.statusFilter !== "") {
            this.state.filteredCompletedBugData = [];
            this.state.bugData.map(bug => {

                var assigneeFilterIsActive = false;
                var statusFilterIsActive = false;
                //APPLY THE FILTERS
                if (this.state.statusFilter === bug.status && this.state.statusFilter !== "") {

                    statusFilterIsActive = true;
                }
                if (this.state.userFilter === bug.userAssigned && this.state.userFilter !== "") {
                    assigneeFilterIsActive = true;
                }
                if (statusFilterIsActive && assigneeFilterIsActive && bug.isCompleted) {
                    return this.state.filteredCompletedBugData.push(bug);
                } else if (statusFilterIsActive && this.state.userFilter === "" && bug.isCompleted) {

                    return this.state.filteredCompletedBugData.push(bug);
                }
                else if (assigneeFilterIsActive && this.state.statusFilter === "" && bug.isCompleted) {
                    return this.state.filteredCompletedBugData.push(bug);
                }
            });
        } else {
            this.state.filteredCompletedBugData = [];
            this.state.bugData.map(bug => {
                if(bug.isCompleted){
                return this.state.filteredCompletedBugData.push(bug);
                }

            });

        }
        return (
             <Container id="containerViewBugs" fluid="true">
                <Row id="mainRow">
                    <Col size="sm-12">
                        <div className="jumbotron jumbotron-fluid">
                            <Container id="container" fluid="true">
                                <h1 className="display-4 BugtrackerTitle" id="organizationNameInBugTitle">{this.state.organizationNameInTitle}</h1>
                                <h2 className="display-4 BugTrackerTitle">View Bugs</h2>
                            </Container>
                        </div>
                        <br />
                        <br />
                        <Row>
                            <Col size="sm-1">
                                {this.state.organizationUsers ?
                                <div>
                                <label htmlFor="userFilter">Assignee </label>
                                <select value={this.state.userFilter} onChange={this.handleChange.bind(this)} id="userFilter" name="userFilter">
                                    <option className="dropdown-item" href="#" value=""></option>
                                        {this.state.organizationUsers.map(user => {
                                        return (
                                            <option className="dropdown-item" href="#" key={user.id} value={user.text}>{user.text}</option>
                                              )
                                        })
                                     }
                                </select>
                                    </div>
                                : 
                                ""}
                            </Col>
                            <Col size="sm-1">
                                <label htmlFor="statusFilter">Status</label>
                                <select value={this.state.statusFilter} onChange={this.handleChange.bind(this)} id="statusFilter" name="statusFilter">
                                    <option className="dropdown-item" href="#" value=""></option>
                                    <option className="dropdown-item" href="#" value="Open">Open</option>
                                    <option className="dropdown-item" href="#" value="In Development">In Development</option>
                                    <option className="dropdown-item" href="#" value="Needs Testing">Needs Testing</option>
                                </select>
                            </Col>
                            <Col size="sm-2">
                                <Link to="/profile" className="log" ><Button>View Profile</Button></Link>
                            </Col>
                            <Col size="sm-2">
                                <Button type="button" className="btn btn-primary" onClick={this.createNewBugButton}>Create New Bug</Button>
                            </Col>
                            <Col size="sm-2">
                                {this.state.showActiveBugs ?
                                    <Button type="button" className="btn btn-primary" onClick={this.swapRenderActiveBugs.bind(this)}>Hide Active Bugs</Button>
                                    :
                                    <Button type="button" className="btn btn-primary" onClick={this.swapRenderActiveBugs.bind(this)}>Show Active Bugs</Button>
                                }
                                
                            </Col>
                            <Col size="sm-2">
                                
                                {this.state.showCompletedBugs ?
                                    <Button type="button" className="btn btn-primary" onClick={this.swapRenderCompletedBugs.bind(this)}>Hide Completed Bugs</Button>
                                    :
                                    <Button type="button" className="btn btn-primary" onClick={this.swapRenderCompletedBugs.bind(this)}>Show Completed Bugs</Button>
                                }
                            </Col>
                                       
                        </Row>

                        {this.state.showActiveBugs ?                   
                       <div>
                                <h1 className="activeBugsTitle">Active Bugs</h1>
                                {this.state.bugData.length ? (
                                    <table id="bugViewTable_Table" className="table table-hover bugViewTable_Table">
                                        <thead id="bugViewTable_head" className="thead-dark">
                                            <tr>
                                                <th className="bugViewTable_th" scope="col">Complete</th>
                                                <th className="bugViewTable_th" scope="col">Title</th>
                                                <th className="bugViewTable_th" scope="col">User Assigned</th>
                                                <th className="bugViewTable_th" scope="col">Status</th>
                                                <th className="bugViewTable_th" scope="col"></th>
                                                <th className="bugViewTable_th" scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.filteredBugData.map(bug => {
                                                return (
                                                        <tr className="bugViewTable_tr" key={bug.mongoID}>
                                                                    <td id="isCompletedColumn" className="bugViewTable_td">

                                                                        <label className="isCompletedContainer">
                                                                            <input type="checkbox" checked={bug.isCompleted} onClick={() => this.completedCheck(bug)}
                                                                                value={bug.isCompleted} onChange={this.handleChange.bind(this)} name="bugIsCompleted"
                                                                            />
                                                                            <span className="checkmark"></span>
                                                                        </label>
                                                                    </td>
                                                                    <td id="titleColumn" className="bugViewTable_td">{bug.bugTitle}</td>
                                                                    <td id="userAssignedColumn" className="bugViewTable_td">{bug.userAssigned}</td>
                                                                    <td id="statusColumn" className="bugViewTable_td">{bug.status}</td>
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


                                ) : (<h3 className="noResultsMessage"> No Results to Display </h3>)} 
                       </div>
                        
                        
                        
                        : 
                        
                        
                        ""
                    } 
                       

                            {this.state.showCompletedBugs ? 
                            
                            
                            
                            
                            
                            <div>
                                <hr />
                                <h1 className="completedBugsTitle">Completed Bugs</h1>
                                {this.state.filteredCompletedBugData.length ? (
                                    <div>
                                    <table id="bugViewTable_Table" className="table table-hover bugViewTable_Table">
                                        <thead id="bugViewTable_head" className="thead-dark">
                                            <tr>
                                                <th className="bugViewTable_th" scope="col">Complete</th>
                                                <th className="bugViewTable_th" scope="col">Title</th>
                                                <th className="bugViewTable_th" scope="col">User Assigned</th>
                                                <th className="bugViewTable_th" scope="col">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.filteredCompletedBugData.map(bug => {
                                                return (
                                                        
                                                        <tr className="bugViewTable_tr" key={bug.mongoID}>
                                                            <td id="isCompletedColumn" className="bugViewTable_td">

                                                                <label className="isCompletedContainer">
                                                                    <input type="checkbox" checked={bug.isCompleted} onClick={() => this.completedCheck(bug)}
                                                                        value={bug.isCompleted} onChange={this.handleChange.bind(this)} name="bugIsCompleted"
                                                                    />
                                                                    <span className="checkmark"></span>
                                                                </label>


                                                            </td>
                                                            <td className="bugViewTable_td">{bug.bugTitle}</td>
                                                            <td id="userAssignedColumn" className="bugViewTable_td">{bug.userAssigned}</td>
                                                            <td id="statusColumn" className="bugViewTable_td">{bug.status}</td>
                                                        </tr>
                                         
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    </div>

                                ) : (<h3 className="noResultsMessage"> No Results to Display </h3>)} 


                            </div>
                            
                            
                            
                            
                            
                            
                            :
                                                      
                            
                            ""}

                                <br />
                                    <br />
                                
                       
                       
                
                        {/* This modal will pop up for editing bugs! */}
                        <Modal show={this.state.showModal} animation={false}>
                            <Modal.Header>
                                <Button className='btn btn-danger note-delete xButton' id="bugModalXButton" onClick={() => this.closeModal()}>X</Button>
                                <Modal.Title>{this.state.currentModalTitle}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>


                                <Input label="Title" onBlur={this.formatInput.bind(this)} isvalid={this.state.bugTitleValid.toString()} 
                                fielderror={this.state.formErrors.bugTitle} value={this.state.bugTitleInModal} 
                                formgroupclass={`form-group ${this.errorClass(this.state.formErrors.bugTitle)}`}
                                id="bugTitleInModal" onChange={this.handleChange.bind(this)} name="bugTitleInModal" />
                                <br />
                                {this.state.organizationUsers ?
                                    <div>
                                        <label htmlFor="bugUserAssignedInModal"><strong>Assignee</strong></label> <br />
                                        <select label="Assignee" value={this.state.bugUserAssignedInModal} onChange={this.handleChange.bind(this)} id="bugUserAssignedInModal" name="bugUserAssignedInModal">
                                            <option className="dropdown-item" href="#" value=""></option>
                                            {this.state.organizationUsers.map(user => {
                                                return (
                                                    <option className="dropdown-item" href="#" key={user.id} value={user.text}>{user.text}</option>
                                                )
                                            })
                                            }
                                        </select>
                                    </div>
                                    :
                                    ""}
                                <br />
                                <br />
                                <label htmlFor="bugStatusInModal"><strong>Status</strong></label>  <br />
                                <select label="Status" value={this.state.bugStatusInModal} onChange={this.handleChange.bind(this)} id="bugStatusInModal" name="bugStatusInModal">
                                    <option className="dropdown-item" href="#" value=""></option>
                                    <option className="dropdown-item" href="#" value="Open">Open</option>
                                    <option className="dropdown-item" href="#" value="In Development">In Development</option>
                                    <option className="dropdown-item" href="#" value="Needs Testing">Needs Testing</option>
                                </select>

                                <br />

                                <br />

                                <TextArea label="Description" onBlur={this.formatInput.bind(this)} value={this.state.bugDescriptionInModal} id="bugDescriptionInModal" onChange={this.handleChange.bind(this)} name="bugDescriptionInModal" />

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
                                                            <div>
                                                                <Button className='btn btn-danger bugComment-delete insideNote' id='cancelInsideNote' onClick={boundBugCommentClick}> X </Button>
                                                           
                                                                <BugCommentPanel key={bugComment._id} text={this.state.userFirstName + " " + this.state.userLastName + ": " + bugComment.text} date={bugComment.timestamp}>

                                                            </BugCommentPanel>
                                                            </div>
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

                                    </div>
                                }

                                {/* END OF BUG COMMENT SECTION */}



                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="primary" onClick={this.handleFormSubmit}>
                                    Submit
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
