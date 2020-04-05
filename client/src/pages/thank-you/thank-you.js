import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import "./thank-you.css";
import Cookies from 'universal-cookie';


class ThankYou extends Component {
    constructor(props) {
        super(props)
        this.state = {
        firstName: "",
        lastName: "",
        emailAddress:"",
        phoneNumber:"",
        guestCount:""
    };
    }

    //When the page loads, we want to get the data from the cookie.
    componentDidMount() {
        this.getCookie();
    }
  
    handleInputChange = event => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    };

    getCookie() {
        const cookies = new Cookies();
        //Here we check if the cookie "demo-requested" exists. If not, then we send user back to landing page.
        if (!cookies.get("demo-requested")){
            this.props.history.push("/landing-page");
        } else{
        var userData = cookies.get("demo-requested");
        this.setState({firstName:userData.firstName});
        this.setState({lastName: userData.lastName});
        this.setState({emailAddress: userData.emailAddress});
        this.setState({phoneNumber: userData.phoneNumber});
        this.setState({guestCount: userData.guestCount});
        }
        
    }

    render() {
        return (
            <Container fluid="true">

                <Row>
                    <Col size="md-12">
                        <div className="thankYouText">
                        <h1 id="thankYouHeader"><strong>Thank you {(this.state.firstName!==null || this.state.firstName!=="") ? this.state.firstName: this.state.lastName}!</strong></h1>
                        <p> A procore event planner will contact you shortly at {this.state.emailAddress} to confirm your RSVP. In the meantime, here are some resources to learn more about the event topics </p>
                        </div>
                    </Col>
                </Row>

                <div className="cards">
                <Row>
                    <Col size="sm-4">
                        <div className="card">
                            <div className="card-image">
                                <div className="color-overlay"></div>
                                <img className="screenshot" src={require('../../images/card1.jpg')}
                                    alt="Card 1" />
                            </div>
                            <div className="card-text">
                            <div className="eyeBrow">VIDEO</div>
                            <h1 className="cardTextHeader">Procore Video Tour</h1>
                            <p className="cardTextP">Dive in and see all of our products, explore different processes within the Procore app, and discover how our Customer Success Team works.</p>
                            <br></br>
                                <a target="_blank" href="http://procore.com/tour" rel="noopener noreferrer" className="CTAbutton"><strong>WATCH NOW </strong> </a>         
                            </div>                           
                        </div>
                    </Col>                    
                    <Col size="sm-4">
                        <div className="card">
                            <div className="card-image">
                                <div className="color-overlay"></div>
                                <img className="screenshot" src={require('../../images/card2.jpg')}
                                    alt="Card 2" />
                            </div>
                            <div className="card-text">
                                <div className="eyeBrow">EBOOK</div>
                                <h1 className="cardTextHeader">Construction Software Buyer's Guide</h1>      
                                <p className="cardTextP">A step-by-step guide to building your software-buying team, assessing your needs as a company, and determining what you want in a solution.</p>
                                <br></br>
                                <a href="./pdf/Construction_Software_Buyers_Guide.pdf"  target="_blank" rel="noopener noreferrer" className="CTAbutton" download><strong> DOWNLOAD</strong> </a>
                               
                            </div>
                        </div>               
                    </Col>
                    <Col size="sm-4">
                        {this.state.guestCount>=3 ? 
                        "":(<div className="card">
                            <div className="card-image">
                                <div className="color-overlay"></div>
                                <img className="screenshot" src={require('../../images/card3.jpg')}
                                    alt="Card 3" />
                            </div>
                            <div className="card-text">
                                <div className="eyeBrow">EBOOK</div>
                                <h1 className="cardTextHeader">Procore Customer Survey: Return on Investment</h1>                
                                <p className="cardTextP">We surveyed 967 of our clients ranging from small ot medium to enterprise companies, to find out how their projects are running since they started using Procore.</p>
                                <br></br>
                                <a href="https://procore.com/downloads/ebooks/Emerging_ROI_Overview_2018.pdf" target="_blank" rel="noopener noreferrer" className="CTAbutton"> <strong>READ THE REPORT</strong></a>
                            </div>
                        </div>    
                        )}                
                    </Col>
                </Row>
                </div>

            </Container>
        );
    }
}

export default ThankYou;
