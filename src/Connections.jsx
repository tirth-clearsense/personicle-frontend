
import { useOktaAuth } from '@okta/okta-react';
import React, { useEffect, useState } from 'react';
import { Header, Icon , Button,Table} from 'semantic-ui-react';
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal,Container,Row,Col } from 'react-bootstrap';
import TimelineChart from "./TimeLineChart";
import useGoogleCharts from './useGoogleCharts'
import config from './config';
import moment from 'moment';
import BarChart from './BarChart';

const Connections = () => {

  const ingestionServer = config.resourceServer.stagingServer
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);
  const[authorized,setAuthorized] = useState(false);
  const[showChart,setShowChart] = useState(false)
  const[showSummary,setShowSummary] = useState(false)
  const [showUserData, setUserData] = useState({userData:[],loading:true})
  const [userSummary, setUserSummary] = useState({userData:[],loading:true})

  const handleActivities = () => {
      setShowChart(true)
  }
  const handleClose = () =>{
    setShowChart(false)
    setShowSummary(false)
  }
  const handleSummary = () =>{ 
      setShowSummary(true)
  }
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

async function getDataFromApi(){
  const accessToken = oktaAuth.getAccessToken();
  var threeMonthsAgo = moment().subtract(3, 'months');
  var formattedThreeMonthsAgo = threeMonthsAgo.format('YYYY-MM-DD HH:mm:ss.SSSSSS');
  var currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
  // const url = "http://127.0.0.1:8000/request/events?"+"user_id=test_user&"+"datatype=com.personicle.individual.datastreams.heartrate&startTime=2022-02-28T16:50:11.226854&endTime=2022-02-28T16:50:11.226990"
  const url = "https://20.121.8.101:3000/request/events?&user_id="+"jorindo.kgp@gmail.com"+"&startTime="+formattedThreeMonthsAgo+"&endTime="+currentTime
  // const url = "https://20.121.8.101:3000/request/events?&user_id="+"jorindo.kgp@gmail.com"+"&startTime="+"2021-12-09 08:26:00.000000"+"&endTime="+"2021-12-09 15:42:00.000000"
  
  fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((response) => {
    if (!response.ok) {
      return Promise.reject();
    }
    
    return response.json();
  })
  .then((data) => {
    setUserData({userData: data, loading: false})
    setUserSummary({userData: data, loading: false})
  })
  .catch((err) => {
    console.error(err);
  });
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
                    <Button style={{marginTop:'9px'}} onClick={()=>{
                      getDataFromApi();
                      handleActivities();
                    }}>View Your Activites</Button>
              </div>
              <div className="col-sm">
                   <Button style={{marginTop:'9px'}}   onClick={() => {
                        getDataFromApi();
                        handleSummary();
                  }}>Events Summary</Button>
              </div>
        </div>
        {/* modal for summary (Bar chart) */}
        <Modal
          dialogClassName="modal-container"
          keyboard
          centered
          size="lg"
          show={showSummary}
          onHide={handleClose}
        >
          <Modal.Header  closeButton>
            <Modal.Title>Your Summary</Modal.Title>
          </Modal.Header>
          <Modal.Body className="modal-body">
              {userSummary.loading && ( <div> <p> <h3>Fetching your summary </h3></p></div>)}
              {!userSummary.loading && userSummary.userData.length==0 && ( <div> <p><h3>No summary for the past three months</h3></p></div>)}
              {!userSummary.loading  && userSummary.userData.length>0 && <BarChart google={google} userSummary={userSummary}/> }
          </Modal.Body>
      </Modal>
        {/* modal for activites (timeline chart)*/}
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
          {showUserData.loading && ( <div> <p> <h3>Fetching your activities </h3></p></div>)}
          {!showUserData.loading && showUserData.userData.length==0 && ( <div> <p><h3>No Activites for the past three months</h3></p></div>)}

          {!showUserData.loading && showUserData.userData.length>0 && <TimelineChart google={google} userData={showUserData}/>  }
         
        </Modal.Body>
      </Modal>
       
    </>
  );
};

export default Connections;
