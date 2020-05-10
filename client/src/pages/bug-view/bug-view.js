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
            currentCompletedBugIndex: 0,
            showModal: false,
            showModal2: false,
            sampleBugViewTableData: [{ id: "1", bugTitle: "Title A", bugDescription: "Test A" }, { id: "2", bugTitle: "Title B", bugDescription: "Test B" }, { id: "3", bugTitle: "Title C", bugDescription: "Test C"}],
            bugData: [],
            completedBugData: [],
            filteredCompletedBugData: [],
            filteredBugData: [],
            bugTitleInModal: "",
            bugCommentsInModal: [],
            users: [{text: 'Tyler', id: '1'}, {text: 'Tawny', id: '2'}, {text: 'Anthony', id: '3'}, {text: 'Arthur', id:'4'}],
            currentBugCommentInModal:"",
            bugDescriptionInModal: "",
            bugStatusInModal: "",
            bugUserAssignedInModal: "",
            userFilter: "",
            statusFilter: "",
            organizationMongoID: "",
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



                    if (this.state.selectedBug.isCompleted){
                        //Once updated we need to update our state's local array

                        //We add to completed bug
                        this.state.completedBugData[this.state.currentCompletedBugIndex] = this.state.selectedBug;

                        //we remove from active bug list
                        var index = this.state.bugData.indexOf(this.state.selectedBug);
                        if (index > -1) {
                            this.state.bugData.splice(index, 1);
                        }
                    } else {
                        //Otherwise, if bug is incomplete...

                        //We add to active bugs
                        this.state.bugData[this.state.currentBugIndex] = this.state.selectedBug;

                        //We remove from the completed bug list
                        var index = this.state.completedBugData.indexOf(this.state.selectedBug);
                        if (index > -1) {
                            this.state.completedBugData.splice(index, 1);
                        }                   

                        
                    }
                    



                    this.forceUpdate();
                } else {
                    this.setState({ errorResponse: response })
                }
            })
    }
    checkBothCompletedAndActiveBugData(bugArrayFromDB){
        var bugs = [];
        var completedBugs = this.state.completedBugData;
        //Loop through bug data received from the server.
        for (var i = 0; i < bugArrayFromDB.length; i++) {

            //If bug is completed, then we add to separate array for rendering on the UI purposes
            if (bugArrayFromDB[i].isCompleted) {

                console.log("COMPLETED BUG " + this.state.currentBugIndex);
                console.log(bugArrayFromDB[i]);
                completedBugs.push({
                    mongoID: bugArrayFromDB[i]._id,
                    id: this.state.currentCompletedBugIndex,
                    bugTitle: bugArrayFromDB[i].bugTitle,
                    bugDescription: bugArrayFromDB[i].bugDescription,
                    userAssigned: bugArrayFromDB[i].userAssigned,
                    status: bugArrayFromDB[i].status,
                    isCompleted: bugArrayFromDB[i].isCompleted
                })


            } else {
                //If bug is not completed, then we add to separate array
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




            }




            this.setState({ currentBugIndex: this.state.currentBugIndex + 1, currentCompletedBugIndex: this.state.completedBugData + 1 });




        }
        console.log("before I set state, here is completed bugs");
        console.log(completedBugs);
        this.setState({ bugData: bugs, completedBugData: completedBugs });
        console.log("IF IM HEre THEN THE DATA JUST UPDATED!!!!");
        this.forceUpdate();
        console.log("Here is bug data from inside callback of API.getAllBugs in bug-view page!");
        console.log(bugs);

        //At default, we want to show all bugs in the table
        this.putAllBugsIntoFilteredArray();
        this.forceUpdate();
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

                        //If bug is completed, then we add to separate array for rendering on the UI purposes
                        if (bugArrayFromDB[i].isCompleted){

                            console.log("COMPLETED BUG " + this.state.currentBugIndex);
                            console.log(bugArrayFromDB[i]);
                            completedBugs.push({
                                mongoID: bugArrayFromDB[i]._id,
                                id: this.state.currentCompletedBugIndex,
                                bugTitle: bugArrayFromDB[i].bugTitle,
                                bugDescription: bugArrayFromDB[i].bugDescription,
                                userAssigned: bugArrayFromDB[i].userAssigned,
                                status: bugArrayFromDB[i].status,
                                isCompleted: bugArrayFromDB[i].isCompleted
                            })


                        }else {                           
                        //If bug is not completed, then we add to separate array
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




                        }




                        this.setState({ currentBugIndex: this.state.currentBugIndex + 1, currentCompletedBugIndex: this.state.currentCompletedBugIndex + 1});




                   }
                   console.log("before I set state, here is completed bugs");
                   console.log(completedBugs);
                    this.setState({ bugData: bugs, completedBugData: completedBugs });
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
                //var bugCommentsArr = [];
                // if(res.data.bugComment == null){
                //     bugCommentsArr = [];
                // }
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
        this.setState({ showModal: false, bugTitleInModal: "", bugDescriptionInModal: "", currentBugCommentInModal: "" });
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
        console.log("Component Did Mount has been called");
        console.log("BELOW IS THE PASSED PROPS STATE");
        console.log(this.props.location.state);
        this.setState({ organizationMongoID: this.props.location.state.organizationMongoID }, () => {
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
        for(var j=0; j<this.state.completedBugData.length; j++){
            this.state.completedBugData[j].id = j;
        }
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


        // if (bug.isCompleted) {
        //     bug.isCompleted = false;

        //     //Removing the bug from the UI
        //     var index = this.state.completedBugData.indexOf(bug);
        //     if (index > -1) {
        //         this.state.completedBugData.splice(index, 1);
        //     }

        //     this.state.bugData.push(bug);

        //     console.log("INDEX IS: " + index);

        //     console.log("IN CompeltedCheck(bug) --- HERE IS THE updated BUG DATA");
        //     console.log(this.state.bugData);
        //     console.log(" here is completed bug data");
        //     console.log(this.state.completedBugData);
        //     //this.adjustBugDataOrder();


        //     //Now we want to save this bug in DB
        //     this.setState({ selectedBug: bug, isCurrentBugCompleted: bug.isCompleted, currentCompletedBugIndex: index, completedBugData: this.state.completedBugData.splice(index, 1) }, () => {
        //         console.log("Before I call updateBugInDB i'm in checkComplete and here is selected bug");
        //         console.log(this.state.selectedBug);
        //         //this.adjustBugDataOrder();
        //         this.updateBugInDB();
        //         //this.checkBothCompletedAndActiveBugData(this.state.bugData)
        //         this.forceUpdate();
        
        //     });
        
        
        //     } else {
        //     //Removing the bug from the UI
        //     var index = this.state.bugData.indexOf(bug);
        //     if (index > -1) {
        //         this.state.bugData.splice(index, 1);
        //     }
        //     //SWAP

        //      bug.isCompleted = true;
            



        //     this.state.completedBugData.push(bug);

        //     console.log("INDEX IS: " + index);

        //     console.log("IN CompeltedCheck(bug) --- HERE IS THE updated BUG DATA");
        //     console.log(this.state.bugData);
        //     console.log(" here is completed bug data");
        //     console.log(this.state.completedBugData);
        //     //this.adjustBugDataOrder();

            
        //     //Now we want to save this bug in DB
        //     this.setState({ selectedBug: bug, currentBugIndex: index, isCurrentBugCompleted: bug.isCompleted, bugData: this.state.bugData.splice(index, 1) }, () => {
        //         console.log("Before I call updateBugInDB i'm in checkComplete and here is selected bug");
        //         console.log(this.state.selectedBug);
        //         //this.adjustBugDataOrder();
        //         this.updateBugInDB();
        //         //this.checkBothCompletedAndActiveBugData(this.state.bugData)
        //         this.forceUpdate();
        //     });

        // }


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
            if (statusFilterIsActive && assigneeFilterIsActive){
            return this.state.filteredBugData.push(bug);
            } else if (statusFilterIsActive && this.state.userFilter === ""){
                
                return this.state.filteredBugData.push(bug);
            }
            else if (assigneeFilterIsActive && this.state.statusFilter === "") {
                return this.state.filteredBugData.push(bug);
            }
        });
          } else {
            this.state.filteredBugData = [];
            this.state.bugData.map(bug => {
                    return this.state.filteredBugData.push(bug);

            });

          }




          // NOW WE WILL DO THE SAME LOGIC FOR COMPLETED BUGS
        if (this.state.userFilter !== "" || this.state.statusFilter !== "") {
            this.state.filteredCompletedBugData = [];
            this.state.completedBugData.map(bug => {

                var assigneeFilterIsActive = false;
                var statusFilterIsActive = false;
                //APPLY THE FILTERS
                if (this.state.statusFilter === bug.status && this.state.statusFilter !== "") {

                    statusFilterIsActive = true;
                }
                if (this.state.userFilter === bug.userAssigned && this.state.userFilter !== "") {
                    assigneeFilterIsActive = true;
                }
                if (statusFilterIsActive && assigneeFilterIsActive) {
                    return this.state.filteredCompletedBugData.push(bug);
                } else if (statusFilterIsActive && this.state.userFilter === "") {

                    return this.state.filteredCompletedBugData.push(bug);
                }
                else if (assigneeFilterIsActive && this.state.statusFilter === "") {
                    return this.state.filteredCompletedBugData.push(bug);
                }
            });
        } else {
            this.state.filteredCompletedBugData = [];
            this.state.completedBugData.map(bug => {
                return this.state.filteredCompletedBugData.push(bug);

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
                        <br />
                        <br />
                        <Row>
                            <Col size="sm-1">
                                <p><strong>Assignee </strong> </p>
                                <select value={this.state.userFilter} onChange={this.handleChange.bind(this)} id="userFilter" name="userFilter">
                                    <option className="dropdown-item" href="#" value=""></option>
                                    <option className="dropdown-item" href="#" value="Tyler">Tyler</option>
                                    <option className="dropdown-item" href="#" value="Tawny">Tawny</option>
                                    <option className="dropdown-item" href="#" value="Anthony">Anthony</option>
                                    <option className="dropdown-item" href="#" value="Arthur">Arthur</option>
                                </select>
                            </Col>
                            <Col size="sm-1">
                                <p><strong>Status</strong></p>
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
                            <br />
                                <br />

                        {this.state.showActiveBugs ?                   
                       <div>
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
                                                        <td className="bugViewTable_td">{bug.bugTitle}</td>
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


                                ) : (<h3> No Results to Display </h3>)} 
                       </div>
                        
                        
                        
                        : 
                        
                        
                        ""
                    } 
                       

                            {this.state.showCompletedBugs ? 
                            
                            
                            
                            
                            
                            <div>
                            
                                {this.state.completedBugData.length ? (
                                    <div>
                                    <h1>Completed Bugs</h1>
                                    <table id="bugViewTable_Table" className="table table-hover bugViewTable_Table">
                                        <thead id="bugViewTable_head" className="thead-dark">
                                            <tr>
                                                <th className="bugViewTable_th" scope="col">Complete</th>
                                                <th className="bugViewTable_th" scope="col">Title</th>
                                                <th className="bugViewTable_th" scope="col">User Assigned</th>
                                                <th className="bugViewTable_th" scope="col">Status</th>
                                                <th className="bugViewTable_th" scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.completedBugData.map(bug => {
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
                                                        <td id="deleteColumn" className="bugViewTable_td"> </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    </div>

                                ) : (<h3> No Results to Display </h3>)} 


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
