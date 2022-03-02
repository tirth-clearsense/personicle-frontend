
import { useOktaAuth } from '@okta/okta-react';
import React, { useEffect, useState } from 'react';
import { Header, Icon , Button} from 'semantic-ui-react';
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal,Container,Row,Col } from 'react-bootstrap';
import TimelineChart from "./TimeLineChart";
import useGoogleCharts from './useGoogleCharts'
import config from './config';
const Connections = () => {

  const ingestionServer = config.resourceServer.stagingServer
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);
  const[authorized,setAuthorized] = useState(false);
  const[showChart,setShowChart] = useState(false)

  const handleShow = () => setShowChart(true)
  const handleClose = () => setShowChart(false)
  const google = useGoogleCharts();
  // authenticate resource server with access token
  useEffect(() => {
    if (authState && authState.isAuthenticated) {
      const accessToken = oktaAuth.getAccessToken();
      fetch(config.resourceServer.stagingServerAuthenticate, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            return Promise.reject();
          }
          return response.json();
        })
        .then((data) => {
          setAuthorized(data.message)
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [authState]);
  

  useEffect(() => {
    if (!authState || !authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
      }).catch((err) => {
        console.error(err);
      });
    }
  }, [authState, oktaAuth]); // Update if authState changes

  if (!userInfo) {
    return (
      <div>
        <p>Fetching user connections...</p>
      </div>
    );
  }
  const userConnections = [
    {
        'source': 'FitBit',
        'icon': '',
        'redirect': ingestionServer + '/fitbit/connection',
        'return': 'http://localhost:3000/testPage'
        // process.env.AUTH_SERVER + ':' + process.env.AUTH_PORT + process.env.FITBIT_AUTH_ENDPOINT
    },
    {
        'source': 'Oura',
        'icon': '',
        'redirect': '/',
        'return': 'http://localhost:3000/testPage'
    },
    {
        'source': 'GoogleFit',
        'icon': '',
        'redirect': ingestionServer + '/google-fit/connection',
        'return': 'http://localhost:3000/testPage'
    }
]
  
async function authorizationWindow(e, redirectUrl){
    if(authorized){
      console.log("Authorized")
       window.open(redirectUrl);
    } else {
      console.log("Unauthorized")
    }

}

  return (
    <>
      <Header as="h1">  
        My Connections
      </Header>
      
        <div className="row mt-4">
              <div className="col-sm">
                  {userConnections.map((connection)=>(
                  
                   <tr><button style={{ marginTop:'20px'}} onClick={(e) => authorizationWindow(e,connection.redirect+"?user_id="+userInfo.sub)}>{connection.source}</button></tr>
                
                   ))}
              </div>
              <div className="col-sm">
                    <Button style={{marginTop:'9px'}} onClick={handleShow}>View Your Activites</Button>
              </div>
              <div className="col-sm">
                   <Button style={{marginTop:'9px'}}>Events Summary</Button>
              </div>
        </div>
        <Modal

        dialogClassName="modal-container"
        keyboard
        centered
        size="lg"
        show={showChart}
        onHide={handleClose}
      >
        <Modal.Header  closeButton>
          <Modal.Title>Your Activities</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
       
         <TimelineChart google={google}/>  
        </Modal.Body>
      </Modal>
        {/* <Modal dialogClassName="model-style" centered show={showChart}  onHide={handleClose} > */}
            {/* <Modal.Header closeButton>
                <Modal.Title >Your Activities</Modal.Title>
            </Modal.Header> */}
            {/* <Modal.Body> <TimelineChart google={google}/> </Modal.Body> */}
        {/* </Modal> */}
    </>
  );
};

export default Connections;
